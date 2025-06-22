import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Todo } from '@/lib/todos';
import type { ReportFilters } from '@/app/app/reports/utils';

// Interface para dados do relatório
interface ReportData {
  title: string;
  period: { start: string; end: string };
  generatedAt: string;
  items: Todo[];
  filters?: ReportFilters;
}

// Adicionar propriedades personalizadas ao tipo Todo para o relatório
interface TodoWithExtras extends Todo {
  labels?: Array<{ id: number, name: string, color: string }>;
  project_name?: string;
  project_color?: string;
}

// Função para formatar data corretamente
const formatDate = (dateString: string): string => {
  try {
    // Vamos usar a data exatamente como foi fornecida pelo usuário
    // Converter para o formato brasileiro de data sem alterações de timezone
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
};

// Função para formatar pontos
const formatPoints = (points: number | null | undefined): string => {
  if (!points) return '-';
  
  const pointsMap: Record<number, string> = {
    1: '1 (Muito Fácil)',
    2: '2 (Fácil)', 
    3: '3 (Médio)',
    4: '4 (Difícil)',
    5: '5 (Muito Difícil)'
  };
  
  return pointsMap[points] || points.toString();
};

// Função para formatar tempo estimado
const formatEstimatedTime = (minutes: number | null | undefined): string => {
  if (!minutes || minutes <= 0) return '-';
  
  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0) parts.push(`${mins}m`);
  
      return parts.length > 0 ? parts.join(' ') : '-';
};

export function generatePDF(data: ReportData): Buffer {
  try {
    
    // Limitar o número de itens para evitar problemas de memória ou desempenho
    const MAX_ITEMS = 500;
    if (data.items.length > MAX_ITEMS) {
      data.items = data.items.slice(0, MAX_ITEMS);
    }
    
    // Verificar e sanitizar labels
    data.items = data.items.map(item => {
      const itemWithExtras = item as TodoWithExtras;
      
      // Verificar se labels existe e é um array
      if (itemWithExtras.labels) {
        // Se labels for uma string (pode ocorrer devido à serialização do JSON), converter para objeto
        if (typeof itemWithExtras.labels === 'string') {
          try {
            itemWithExtras.labels = JSON.parse(itemWithExtras.labels as unknown as string);
          } catch (e) {
            itemWithExtras.labels = [];
          }
        }
        
        // Verificar se é realmente um array
        if (!Array.isArray(itemWithExtras.labels)) {
          itemWithExtras.labels = [];
        }
      } else {
        itemWithExtras.labels = [];
      }
      
      return itemWithExtras;
    });
    
    // Criar um novo documento PDF
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Mapear níveis de prioridade
    const priorityLabels: Record<number, string> = {
      1: "Urgente",
      2: "Alta",
      3: "Média",
      4: "Baixa",
      5: "Muito Baixa"
    };
    
    // Mapear colunas Kanban
    const kanbanLabels: Record<string, string> = {
      "backlog": "Backlog",
      "planning": "Planejamento",
      "inProgress": "Em Progresso",
      "validation": "Validação",
      "completed": "Concluído"
    };

    // Cores para utilizar no documento
    const colors = {
      primary: '#3b82f6',
      lightGray: '#f3f4f6',
      text: '#374151',
      urgent: '#ef4444',
      high: '#f97316',
      medium: '#facc15',
      low: '#16a34a',
      veryLow: '#3b82f6',
    };
    
    // Configurações de fonte
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#111827');
    
    // Título do relatório
    doc.text(data.title, 14, 15);
    
    // Informações do período
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#6b7280');
    
    const startDate = formatDate(data.period.start);
    const endDate = formatDate(data.period.end);
    const generatedAt = new Date(data.generatedAt).toLocaleString('pt-BR');
    
    doc.text(`Período: ${startDate} a ${endDate}`, 14, 22);
    doc.text(`Gerado em: ${generatedAt}`, 14, 27);
    
    // Seção de estatísticas
    if (data.items.length > 0) {
      const totalTasks = data.items.length;
      const completedTasks = data.items.filter(task => task.completed).length;
      const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Contagem por prioridade
      const priorityCounts: Record<string, number> = {};
      data.items.forEach(task => {
        if (task.priority) {
          const priorityLabel = priorityLabels[task.priority] || task.priority.toString();
          priorityCounts[priorityLabel] = (priorityCounts[priorityLabel] || 0) + 1;
        }
      });
      
      // Estatísticas de pontos
      const tasksWithPoints = data.items.filter(task => task.points && task.points > 0);
      const totalPoints = tasksWithPoints.reduce((sum, task) => sum + (task.points || 0), 0);
      const avgPoints = tasksWithPoints.length > 0 ? Math.round((totalPoints / tasksWithPoints.length) * 10) / 10 : 0;
      
      // Estatísticas de tempo estimado
      const tasksWithTime = data.items.filter(task => task.estimated_time && task.estimated_time > 0);
      const totalEstimatedTime = tasksWithTime.reduce((sum, task) => sum + (task.estimated_time || 0), 0);
      const avgEstimatedTime = tasksWithTime.length > 0 ? Math.round(totalEstimatedTime / tasksWithTime.length) : 0;
      
      // Desenhar a seção de estatísticas
      doc.setFillColor(colors.lightGray);
      doc.rect(14, 32, doc.internal.pageSize.width - 28, 25, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(colors.text);
      doc.text('Resumo do Relatório', 16, 38);
      
      // Estatísticas principais
      doc.setFillColor('#FFFFFF');
      
      // Total de tarefas
      doc.roundedRect(16, 41, 40, 12, 1, 1, 'F');
      doc.setFontSize(14);
      doc.setTextColor(colors.primary);
      doc.text(String(totalTasks), 36, 47, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(colors.text);
      doc.text('Total de Tarefas', 36, 51, { align: 'center' });
      
      // Tarefas Concluídas
      doc.setFillColor('#FFFFFF');
      doc.roundedRect(60, 41, 40, 12, 1, 1, 'F');
      doc.setFontSize(14);
      doc.setTextColor(colors.primary);
      doc.text(String(completedTasks), 80, 47, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(colors.text);
      doc.text('Tarefas Concluídas', 80, 51, { align: 'center' });
      
      // Taxa de Conclusão
      doc.setFillColor('#FFFFFF');
      doc.roundedRect(104, 41, 40, 12, 1, 1, 'F');
      doc.setFontSize(14);
      doc.setTextColor(colors.primary);
      doc.text(`${percentComplete}%`, 124, 47, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(colors.text);
      doc.text('Taxa de Conclusão', 124, 51, { align: 'center' });
      
      // Total de Pontos
      if (totalPoints > 0) {
        doc.setFillColor('#FFFFFF');
        doc.roundedRect(148, 41, 40, 12, 1, 1, 'F');
        doc.setFontSize(14);
        doc.setTextColor(colors.primary);
        doc.text(String(totalPoints), 168, 47, { align: 'center' });
        doc.setFontSize(8);
        doc.setTextColor(colors.text);
        doc.text('Total de Pontos', 168, 51, { align: 'center' });
      }
      
      // Tempo Total Estimado
      if (totalEstimatedTime > 0) {
        doc.setFillColor('#FFFFFF');
        doc.roundedRect(192, 41, 40, 12, 1, 1, 'F');
        doc.setFontSize(12);
        doc.setTextColor(colors.primary);
        doc.text(formatEstimatedTime(totalEstimatedTime), 212, 47, { align: 'center' });
        doc.setFontSize(8);
        doc.setTextColor(colors.text);
        doc.text('Tempo Total Est.', 212, 51, { align: 'center' });
      }
      
      // Distribuição por prioridade
      let xPosition = totalEstimatedTime > 0 ? 236 : (totalPoints > 0 ? 192 : 160);
      
      // Título da distribuição
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribuição por Prioridade:', xPosition, 42);
      
      // Valores da distribuição
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      
      let priorityY = 46;
      Object.entries(priorityCounts).forEach(([priority, count], index) => {
        let color;
        switch (priority) {
          case 'Urgente': color = colors.urgent; break;
          case 'Alta': color = colors.high; break;
          case 'Média': color = colors.medium; break;
          case 'Baixa': color = colors.low; break;
          case 'Muito Baixa': color = colors.veryLow; break;
          default: color = colors.text; break;
        }
        
        // Desenhar círculo de cor
        doc.setFillColor(color);
        doc.circle(xPosition + 2, priorityY, 1.5, 'F');
        
        // Texto
        doc.setTextColor(colors.text);
        doc.text(`${priority}: ${count}`, xPosition + 5, priorityY + 0.5);
        
        priorityY += 4;
      });
    }
    
    // Seção de Filtros Aplicados
    let yPosition = 62;
    if (data.filters) {
      const hasProjectFilters = data.filters.projectIds && data.filters.projectIds.length > 0;
      const hasLabelFilters = data.filters.labelIds && data.filters.labelIds.length > 0;
      const hasPriorityFilters = data.filters.priorities && data.filters.priorities.length > 0;
      
      if (hasProjectFilters || hasLabelFilters || hasPriorityFilters) {
        doc.setFillColor(colors.lightGray);
        
        // Altura dinâmica com base no número de filtros
        const filtersHeight = 6 + 
          (hasProjectFilters ? 5 : 0) + 
          (hasLabelFilters ? 5 : 0) + 
          (hasPriorityFilters ? 5 : 0);
        
        doc.rect(14, yPosition, doc.internal.pageSize.width - 28, filtersHeight, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(colors.text);
        doc.text('Filtros Aplicados', 16, yPosition + 5);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        yPosition += 10;
        
        // Filtros de Projeto
        if (hasProjectFilters) {
          let projectText = "Projetos: ";
          
          // Limitar o texto exibido para evitar estouro
          if (data.filters.projectIds!.length > 10) {
            projectText += `Todos (${data.filters.projectIds!.length} selecionados)`;
          } else {
            projectText += data.filters.projectIds!.join(', ');
          }
          
          doc.text(projectText, 16, yPosition);
          yPosition += 5;
        }
        
        // Filtros de Etiqueta
        if (hasLabelFilters) {
          let labelText = "Etiquetas: ";
          
          // Limitar o texto exibido para evitar estouro
          if (data.filters.labelIds!.length > 10) {
            labelText += `Todas (${data.filters.labelIds!.length} selecionadas)`;
          } else {
            labelText += data.filters.labelIds!.join(', ');
          }
          
          doc.text(labelText, 16, yPosition);
          yPosition += 5;
        }
        
        // Filtros de Prioridade
        if (hasPriorityFilters) {
          let priorityNames;
          
          // Limitar o texto exibido para evitar estouro
          if (data.filters.priorities!.length >= 5) {
            priorityNames = "Todas as prioridades";
          } else {
            priorityNames = data.filters.priorities!.map(p => priorityLabels[parseInt(p)] || p).join(', ');
          }
          
          doc.text(`Prioridades: ${priorityNames}`, 16, yPosition);
          yPosition += 5;
        }
        
        yPosition += 5;
      }
    }
    
    // Preparar colunas e dados para a tabela
    const customColumns = data.filters?.customColumns || [];
    const includeAll = customColumns.length === 0;
    
    // Definir quais colunas incluir
    const columns = [
      { header: 'ID', dataKey: 'id' },
      { header: 'Título', dataKey: 'title' }
    ];
    
    // Colunas opcionais com base na customização
    const optionalColumns = [
      { id: 'description', header: 'Descrição', dataKey: 'description' },
      { id: 'due_date', header: 'Vencimento', dataKey: 'due_date' },
      { id: 'priority', header: 'Prioridade', dataKey: 'priority' },
      { id: 'completed', header: 'Concluída', dataKey: 'completed' },
      { id: 'project', header: 'Projeto', dataKey: 'project_name' },
      { id: 'labels', header: 'Etiquetas', dataKey: 'labels' },
      { id: 'kanban_column', header: 'Coluna', dataKey: 'kanban_column' },
      { id: 'points', header: 'Pontos', dataKey: 'points' },
      { id: 'estimated_time', header: 'Tempo Est.', dataKey: 'estimated_time' },
      { id: 'created_at', header: 'Criada em', dataKey: 'created_at' },
      { id: 'updated_at', header: 'Atualizada em', dataKey: 'updated_at' }
    ];
    
    if (includeAll) {
      columns.push(...optionalColumns);
    } else {
      optionalColumns.forEach(col => {
        if (customColumns.includes(col.id)) {
          columns.push(col);
        }
      });
    }
    
    // Preparar dados para a tabela
    const tableData = data.items.map(task => {
      // Tratar como TodoWithExtras para acessar as propriedades adicionais
      const taskWithExtras = task as TodoWithExtras;
      
      // Verificar e garantir que os campos essenciais existam para evitar erros
      const rowData: Record<string, any> = {
        id: task.id || '',
        title: task.title || '',
        description: task.description || '-',
        due_date: task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : '-',
        priority: task.priority !== undefined ? priorityLabels[task.priority] || task.priority.toString() : '-',
        completed: task.completed !== undefined ? (task.completed ? 'Sim' : 'Não') : '-',
        project_name: taskWithExtras.project_name || '-',
        labels: taskWithExtras.labels ? taskWithExtras.labels.map(label => label.name).join(', ') : '-',
        kanban_column: task.kanban_column ? kanbanLabels[task.kanban_column as string] || task.kanban_column : '-',
        points: formatPoints(task.points),
        estimated_time: formatEstimatedTime(task.estimated_time),
        created_at: task.created_at ? new Date(task.created_at).toLocaleDateString('pt-BR') : '-',
        updated_at: task.updated_at ? new Date(task.updated_at).toLocaleDateString('pt-BR') : '-',
      };
      
      return rowData;
    });
    
    // Função simplificada para adicionar numeração de página
    const addPageNumbers = () => {
      try {
        const pageCount = doc.getNumberOfPages();
        
        // Para cada página
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          
          // Adicionar número da página atual
          doc.setFontSize(8);
          doc.setTextColor('#9ca3af');
          doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
          );
        }
      } catch (err) {
        console.error("Erro ao adicionar numeração de página:", err);
        // Continuar sem a numeração em caso de erro
      }
    };
    
    // Renderizar a tabela com autoTable
    autoTable(doc, {
      startY: yPosition,
      head: [columns.map(col => col.header)],
      body: tableData.map(row => columns.map(col => row[col.dataKey])),
      headStyles: {
        fillColor: colors.primary,
        textColor: '#FFFFFF',
        fontStyle: 'bold',
        halign: 'left'
      },
      alternateRowStyles: {
        fillColor: '#f9fafb'
      },
      columnStyles: {
        0: { cellWidth: 15 }, // ID
        1: { cellWidth: 'auto' }, // Título
      },
      didDrawPage: function(data) {
        // Espaço para rodapé
        data.settings.margin.bottom = 20;
      },
      margin: { top: 10, right: 14, bottom: 15, left: 14 },
      styles: { fontSize: 9, cellPadding: 3 },
      tableLineWidth: 0.5,
      tableLineColor: '#e5e7eb',
      showHead: 'everyPage', // Garantir que o cabeçalho apareça em todas as páginas
      willDrawCell: (data) => {
        // Estilização condicional de células
        if (data.section === 'body') {
          try {
            const rowIndex = data.row.index;
            const colIndex = data.column.index;
            
            // Verificar se rowIndex está definido e dentro dos limites
            if (rowIndex === undefined || rowIndex < 0 || rowIndex >= tableData.length) {
              return;
            }
            
            const rowData = tableData[rowIndex];
            if (!rowData) {
              return;
            }
            
            // Verificar se colIndex está definido e dentro dos limites
            if (colIndex === undefined || colIndex < 0 || colIndex >= columns.length) {
              return;
            }
            
            const colKey = columns[colIndex].dataKey;
            
            // Destacar células de prioridade
            if (colKey === 'priority' && rowData.priority) {
              const priority = rowData.priority;
              switch (priority) {
                case 'Urgente':
                  data.cell.styles.textColor = colors.urgent;
                  data.cell.styles.fontStyle = 'bold';
                  break;
                case 'Alta':
                  data.cell.styles.textColor = colors.high;
                  data.cell.styles.fontStyle = 'bold';
                  break;
                case 'Média':
                  data.cell.styles.textColor = colors.medium;
                  break;
                case 'Baixa':
                  data.cell.styles.textColor = colors.low;
                  break;
                case 'Muito Baixa':
                  data.cell.styles.textColor = colors.veryLow;
                  break;
              }
            }
            
            // Destacar células de status
            if (colKey === 'completed' && rowData.completed) {
              const completed = rowData.completed;
              if (completed === 'Sim') {
                data.cell.styles.textColor = colors.low;
                data.cell.styles.fontStyle = 'bold';
              } else {
                data.cell.styles.textColor = colors.urgent;
              }
            }
            
            // Destacar células de pontos
            if (colKey === 'points' && rowData.points && rowData.points !== '-') {
              const pointsText = rowData.points;
              if (pointsText.includes('1 (Muito Fácil)')) {
                data.cell.styles.textColor = colors.low;
              } else if (pointsText.includes('2 (Fácil)')) {
                data.cell.styles.textColor = colors.veryLow;
              } else if (pointsText.includes('3 (Médio)')) {
                data.cell.styles.textColor = colors.medium;
              } else if (pointsText.includes('4 (Difícil)')) {
                data.cell.styles.textColor = colors.high;
              } else if (pointsText.includes('5 (Muito Difícil)')) {
                data.cell.styles.textColor = colors.urgent;
                data.cell.styles.fontStyle = 'bold';
              }
            }
          } catch (error) {
            console.error('Erro na formatação condicional de células:', error);
            // Continuar sem a formatação em caso de erro
          }
        }
      }
    });
    
    // Adicionar numeração de página após gerar a tabela
    addPageNumbers();
    
    // Adicionar rodapé em todas as páginas
    try {
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Linha de separação
        const pageHeight = doc.internal.pageSize.height;
        doc.setDrawColor('#e5e7eb');
        doc.line(80, pageHeight - 8, doc.internal.pageSize.width - 80, pageHeight - 8);
        
        // Texto de rodapé
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor('#9ca3af');
        doc.text('Relatório gerado automaticamente pelo sistema', doc.internal.pageSize.width / 2, pageHeight - 5, { align: 'center' });
      }
    } catch (err) {
      console.error("Erro ao adicionar rodapé:", err);
      // Continuar sem o rodapé se houver erro
    }
    
    console.log("Geração de PDF concluída, convertendo para buffer...");
    
    // Converter para buffer com tratamento de erro
    try {
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      return pdfBuffer;
    } catch (err) {
      console.error("Erro ao converter PDF para buffer:", err);
      throw new Error("Falha ao converter o PDF para download: " + (err instanceof Error ? err.message : String(err)));
    }
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha ao gerar o PDF: ' + (error instanceof Error ? error.message : String(error)));
  }
} 