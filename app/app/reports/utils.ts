import type { Todo } from "@/lib/todos";
import type { Label } from "@/lib/labels";
import type { Project } from "@/lib/projects";

// Tipo para filtros de relatório
export interface ReportFilters {
  projectIds?: string[];
  labelIds?: string[];
  priorities?: string[];
  customColumns?: string[];
}

// Interface para dados de relatório
export interface ReportData {
  title: string;
  period: { start: string; end: string };
  generatedAt: string;
  items: Todo[];
  filters?: ReportFilters;
}

// Função para buscar tarefas da API
export async function fetchTasks(reportType: string, startDate: string, endDate: string, filters?: ReportFilters): Promise<Todo[]> {
  try {
    // Construir URL com parâmetros
    let url = `/api/reports?type=${reportType}&startDate=${startDate}&endDate=${endDate}`;
    
    // Adicionar filtros de projetos
    if (filters?.projectIds && filters.projectIds.length > 0) {
      url += `&projectIds=${filters.projectIds.join(',')}`;
    }
    
    // Adicionar filtros de etiquetas
    if (filters?.labelIds && filters.labelIds.length > 0) {
      url += `&labelIds=${filters.labelIds.join(',')}`;
    }
    
    // Adicionar filtros de prioridades
    if (filters?.priorities && filters.priorities.length > 0) {
      url += `&priorities=${filters.priorities.join(',')}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching tasks: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return []; // Return empty array on error
  }
}

// Fetch all projects
export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      throw new Error(`Error fetching projects: ${response.status}`);
    }
    
    const data = await response.json();
    return data.projects || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

// Fetch all labels
export async function fetchLabels(): Promise<Label[]> {
  try {
    const response = await fetch('/api/labels');
    if (!response.ok) {
      throw new Error(`Error fetching labels: ${response.status}`);
    }
    
    const data = await response.json();
    return data.labels || [];
  } catch (error) {
    console.error("Error fetching labels:", error);
    return [];
  }
}

// Função para gerar CSV a partir de dados reais
export function generateCSV(data: ReportData): string {
  // Determinando quais colunas incluir com base na customização
  const customColumns = data.filters?.customColumns || [];
  const includeAll = customColumns.length === 0;

  // Definir cabeçalhos padrão e opcionais
  const defaultHeaders = ["ID", "Título"];
  
  const optionalHeaders: Record<string, string> = {
    "description": "Descrição",
    "due_date": "Data de Vencimento",
    "priority": "Prioridade", 
    "completed": "Concluída",
    "project": "Projeto",
    "labels": "Etiquetas",
    "kanban_column": "Coluna Kanban",
    "created_at": "Data de Criação",
    "updated_at": "Última Atualização"
  };
  
  // Construir os cabeçalhos finais
  let headers = [...defaultHeaders];
  
  if (includeAll) {
    headers = headers.concat(Object.values(optionalHeaders));
  } else {
    for (const column of customColumns) {
      if (optionalHeaders[column]) {
        headers.push(optionalHeaders[column]);
      }
    }
  }
  
  // Se não houver itens, criar um CSV vazio com cabeçalhos
  if (!data.items || data.items.length === 0) {
    return headers.join(',') + '\n';
  }
  
  // Converter cabeçalhos para linha CSV
  let csv = headers.join(',') + '\n';
  
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
  
  // Adicionar linhas para cada item
  data.items.forEach((task) => {
    // Formatar campos personalizados
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : '';
    const priority = task.priority ? priorityLabels[task.priority] || task.priority.toString() : '';
    const completed = task.completed ? "Sim" : "Não";
    const kanban = task.kanban_column ? kanbanLabels[task.kanban_column as string] || task.kanban_column : '';
    const createdAt = task.created_at ? new Date(task.created_at).toLocaleDateString('pt-BR') : '';
    const updatedAt = task.updated_at ? new Date(task.updated_at).toLocaleDateString('pt-BR') : '';
    
    // Formatar etiquetas (se existirem)
    let labelsText = '';
    if (task.labels && task.labels.length > 0) {
      labelsText = task.labels.map((label: Label) => label.name).join(', ');
    }
    
    // Escapar campos de texto para CSV
    const safeTitle = escapeCsvField(task.title);
    const safeDesc = escapeCsvField(task.description || '');
    const safeProject = escapeCsvField(task.project_name || '');
    const safeLabels = escapeCsvField(labelsText);
    
    // Construir linha
    let row = [
      task.id.toString(),
      safeTitle
    ];
    
    // Adicionar campos opcionais na ordem correta
    if (includeAll || customColumns.includes('description')) row.push(safeDesc);
    if (includeAll || customColumns.includes('due_date')) row.push(dueDate);
    if (includeAll || customColumns.includes('priority')) row.push(priority);
    if (includeAll || customColumns.includes('completed')) row.push(completed);
    if (includeAll || customColumns.includes('project')) row.push(safeProject);
    if (includeAll || customColumns.includes('labels')) row.push(safeLabels);
    if (includeAll || customColumns.includes('kanban_column')) row.push(kanban);
    if (includeAll || customColumns.includes('created_at')) row.push(createdAt);
    if (includeAll || customColumns.includes('updated_at')) row.push(updatedAt);
    
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

// Função para escapar campos em CSV
export function escapeCsvField(field: string): string {
  if (!field) return '';
  
  // Se o campo contém vírgula, aspas ou quebra de linha, envolva com aspas
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    // Substituir aspas por aspas duplas (padrão CSV)
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// Função para gerar HTML para PDF com dados reais
export function generateHTML(data: ReportData): string {
  // Determinando quais colunas incluir com base na customização
  const customColumns = data.filters?.customColumns || [];
  const includeAll = customColumns.length === 0;
  
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
  
  // Mapear cores de prioridade para visual
  const priorityColors: Record<number, string> = {
    1: "#ef4444", // Urgente - Vermelho
    2: "#f97316", // Alta - Laranja
    3: "#facc15", // Média - Amarelo
    4: "#16a34a", // Baixa - Verde
    5: "#3b82f6"  // Muito Baixa - Azul
  };
  
  // Definir colunas e cabeçalhos da tabela
  const defaultColumns = ["ID", "Título"];
  
  interface ColumnConfig {
    id: string;
    label: string;
    includeIf: boolean;
    format: (task: Todo) => string;
    width?: string; // Largura opcional da coluna
  }
  
  const columnConfigs: ColumnConfig[] = [
    {
      id: "id", 
      label: "ID", 
      includeIf: true, // ID é sempre incluído
      format: (task) => String(task.id),
      width: "50px"
    },
    {
      id: "title", 
      label: "Título", 
      includeIf: true, // Título é sempre incluído
      format: (task) => escapeHtml(task.title),
      width: "20%"
    },
    {
      id: "description", 
      label: "Descrição", 
      includeIf: includeAll || customColumns.includes('description'),
      format: (task) => escapeHtml(task.description || ''),
      width: "25%"
    },
    {
      id: "due_date", 
      label: "Vencimento", 
      includeIf: includeAll || customColumns.includes('due_date'),
      format: (task) => task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : '-',
      width: "100px"
    },
    {
      id: "priority", 
      label: "Prioridade", 
      includeIf: includeAll || customColumns.includes('priority'),
      format: (task) => {
        if (!task.priority) return '-';
        const label = priorityLabels[task.priority] || task.priority.toString();
        const color = priorityColors[task.priority] || '#777';
        return `<span style="display:inline-block; padding:2px 8px; border-radius:10px; background-color:${color}; color:white; font-size:11px; font-weight:bold;">${label}</span>`;
      },
      width: "100px"
    },
    {
      id: "completed", 
      label: "Concluída", 
      includeIf: includeAll || customColumns.includes('completed'),
      format: (task) => task.completed 
        ? '<span style="color:#16a34a; font-weight:bold;">Sim</span>' 
        : '<span style="color:#ef4444; font-weight:bold;">Não</span>',
      width: "80px"
    },
    {
      id: "project", 
      label: "Projeto", 
      includeIf: includeAll || customColumns.includes('project'),
      format: (task) => {
        if (!task.project_name) return '-';
        const color = task.project_color || '#3b82f6';
        return `<span style="display:inline-block; padding:2px 8px; border-radius:10px; background-color:${color}; color:white; font-size:11px;">${escapeHtml(task.project_name)}</span>`;
      },
      width: "120px"
    },
    {
      id: "labels", 
      label: "Etiquetas", 
      includeIf: includeAll || customColumns.includes('labels'),
      format: (task) => {
        if (!task.labels || task.labels.length === 0) return '-';
        return task.labels.map((label: Label) => {
          return `<span style="display:inline-block; margin:1px 2px; padding:1px 6px; border-radius:8px; background-color:${label.color || '#777'}; color:white; font-size:10px;">${escapeHtml(label.name)}</span>`;
        }).join(' ');
      },
      width: "150px"
    },
    {
      id: "kanban_column", 
      label: "Coluna", 
      includeIf: includeAll || customColumns.includes('kanban_column'),
      format: (task) => task.kanban_column ? kanbanLabels[task.kanban_column as string] || task.kanban_column : '-',
      width: "120px"
    },
    {
      id: "created_at", 
      label: "Criada em", 
      includeIf: includeAll || customColumns.includes('created_at'),
      format: (task) => task.created_at ? new Date(task.created_at).toLocaleDateString('pt-BR') : '-',
      width: "100px"
    },
    {
      id: "updated_at", 
      label: "Atualizada em", 
      includeIf: includeAll || customColumns.includes('updated_at'),
      format: (task) => task.updated_at ? new Date(task.updated_at).toLocaleDateString('pt-BR') : '-',
      width: "100px"
    }
  ];
  
  // Filtrar colunas que devem ser incluídas
  const columnsToInclude = columnConfigs.filter(col => col.includeIf);
  
  // Criar cabeçalhos HTML
  const tableHeaders = columnsToInclude.map(col => 
    `<th style="${col.width ? `width:${col.width};` : ''}">${col.label}</th>`
  ).join('');
  
  // Criar linhas de tabela HTML
  let tableRows = '';
  
  if (data.items && data.items.length > 0) {
    data.items.forEach((task, index) => {
      // Determinar a classe alternada para linhas pares/ímpares
      const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
      
      // Construir células da linha
      const cells = columnsToInclude.map(col => 
        `<td style="${col.width ? `width:${col.width};` : ''}">${col.format(task)}</td>`
      ).join('');
      
      // Construir linha HTML
      tableRows += `<tr class="${rowClass}">${cells}</tr>`;
    });
  } else {
    // Se não houver dados, mostrar mensagem
    tableRows = `<tr><td colspan="${columnsToInclude.length}" style="text-align:center; padding:20px; color:#888;">Nenhuma tarefa encontrada no período especificado</td></tr>`;
  }
  
  // Estatísticas rápidas
  let statsSection = '';
  if (data.items && data.items.length > 0) {
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
    
    // Contagem por projeto
    const projectsCount: Record<string, number> = {};
    data.items.forEach(task => {
      if (task.project_name) {
        projectsCount[task.project_name] = (projectsCount[task.project_name] || 0) + 1;
      }
    });
    
    // Gerar HTML das estatísticas
    statsSection = `
      <div class="stats-section">
        <h3>Resumo do Relatório</h3>
        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-value">${totalTasks}</span>
            <span class="stat-label">Total de Tarefas</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">${completedTasks}</span>
            <span class="stat-label">Tarefas Concluídas</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">${percentComplete}%</span>
            <span class="stat-label">Taxa de Conclusão</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">${Object.keys(projectsCount).length}</span>
            <span class="stat-label">Projetos</span>
          </div>
        </div>
        
        <div class="stats-detail">
          <div class="stats-priorities">
            <h4>Distribuição por Prioridade</h4>
            <ul class="stats-list">
              ${Object.entries(priorityCounts).map(([priority, count]) => {
                // Encontrar a cor correspondente
                const priorityNumber = Object.entries(priorityLabels).find(([_, label]) => label === priority)?.[0];
                const color = priorityNumber ? priorityColors[parseInt(priorityNumber, 10)] : '#777';
                
                return `
                  <li>
                    <span class="color-dot" style="background-color: ${color}"></span>
                    <span>${priority}: ${count}</span>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
          
          ${Object.keys(projectsCount).length > 0 ? `
            <div class="stats-projects">
              <h4>Principais Projetos</h4>
              <ul class="stats-list">
                ${Object.entries(projectsCount)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([project, count]) => `
                    <li>
                      <span>${escapeHtml(project)}: ${count} tarefa${count > 1 ? 's' : ''}</span>
                    </li>
                  `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  // Criar a seção de filtros aplicados
  let filtersSection = '';
  if (data.filters) {
    let filtersList = [];
    
    // Adicionar projetos filtrados
    if (data.filters.projectIds && data.filters.projectIds.length > 0) {
      const projectNames = data.filters.projectIds.map(id => {
        // Encontrar o nome do projeto baseado no ID, se disponível
        const project = data.items.find(item => item.project_name && item.id.toString() === id);
        return project ? project.project_name : id;
      }).join(', ');
      
      filtersList.push(`<strong>Projetos:</strong> ${escapeHtml(projectNames)}`);
    }
    
    // Adicionar etiquetas filtradas
    if (data.filters.labelIds && data.filters.labelIds.length > 0) {
      const labelNames = data.filters.labelIds.map(id => {
        // Tentativa de encontrar o nome da etiqueta nos items, assumindo que há uma propriedade labels
        const item = data.items.find(item => 
          item.labels && item.labels.some((label: any) => label.id.toString() === id)
        );
        const label = item?.labels?.find((l: any) => l.id.toString() === id);
        return label ? label.name : id;
      }).join(', ');
      
      filtersList.push(`<strong>Etiquetas:</strong> ${escapeHtml(labelNames)}`);
    }
    
    // Adicionar prioridades filtradas
    if (data.filters.priorities && data.filters.priorities.length > 0) {
      const priorityNames = data.filters.priorities.map(p => priorityLabels[parseInt(p)] || p).join(', ');
      filtersList.push(`<strong>Prioridades:</strong> ${escapeHtml(priorityNames)}`);
    }
    
    if (filtersList.length > 0) {
      filtersSection = `
        <div class="filters-section">
          <h3>Filtros Aplicados</h3>
          <ul>
            ${filtersList.map(filter => `<li>${filter}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }
  
  // Gerar assinatura do relatório com data e usuário
  const signatureSection = `
    <div class="signature-section">
      <div class="signature-line">
        <hr>
        <span>Relatório gerado automaticamente pelo sistema</span>
      </div>
    </div>
  `;
  
  // Código HTML completo com estilos CSS inline para melhor compatibilidade
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        
        /* Estilos gerais */
        body { 
          font-family: 'Roboto', Arial, sans-serif; 
          margin: 0; 
          padding: 0;
          background-color: #f9fafb;
          color: #374151;
          font-size: 13px;
          line-height: 1.5;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        /* Cabeçalho */
        .header {
          padding: 20px 0;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 20px;
        }
        
        h1 { 
          color: #111827; 
          font-size: 26px;
          font-weight: 700;
          margin: 0 0 5px 0;
        }
        
        h3 { 
          color: #4b5563; 
          font-size: 18px;
          margin-top: 25px;
          margin-bottom: 10px;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 5px;
        }
        
        h4 {
          color: #4b5563;
          font-size: 15px;
          margin: 15px 0 8px 0;
          font-weight: 600;
        }
        
        .info { 
          color: #6b7280; 
          margin-bottom: 10px;
          font-size: 13px;
        }
        
        /* Estatísticas */
        .stats-section {
          margin-bottom: 25px;
          background-color: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
        }
        
        .stats-grid {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        
        .stat-box {
          flex: 0 0 22%;
          padding: 10px;
          background-color: white;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          text-align: center;
          min-width: 120px;
          margin: 5px;
        }
        
        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #1e40af;
        }
        
        .stat-label {
          font-size: 12px;
          color: #6b7280;
        }
        
        .stats-detail {
          display: flex;
          flex-wrap: wrap;
          margin-top: 15px;
        }
        
        .stats-priorities, .stats-projects {
          flex: 1;
          min-width: 200px;
          padding: 0 10px;
        }
        
        .stats-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .stats-list li {
          margin-bottom: 5px;
          padding: 5px;
          display: flex;
          align-items: center;
        }
        
        .color-dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
        }
        
        /* Filtros */
        .filters-section { 
          margin-bottom: 20px; 
          background-color: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
        }
        
        .filters-section ul { 
          margin: 10px 0; 
          padding-left: 20px;
          color: #4b5563;
        }
        
        .filters-section li {
          margin-bottom: 5px;
        }
        
        /* Tabela */
        .table-wrapper {
          overflow-x: auto;
          margin-top: 20px;
          margin-bottom: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        table { 
          width: 100%; 
          border-collapse: collapse; 
          table-layout: fixed;
        }
        
        th { 
          background-color: #1e40af; 
          color: white;
          text-align: left; 
          padding: 12px 15px;
          font-weight: 500;
          font-size: 13px;
          position: sticky;
          top: 0;
        }
        
        th:first-child {
          border-top-left-radius: 8px;
        }
        
        th:last-child {
          border-top-right-radius: 8px;
        }
        
        td { 
          padding: 10px 15px; 
          border-bottom: 1px solid #e5e7eb;
          vertical-align: middle;
          font-size: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .even-row {
          background-color: white;
        }
        
        .odd-row {
          background-color: #f9fafb;
        }
        
        tr:hover {
          background-color: #f1f5f9;
        }
        
        /* Assinatura */
        .signature-section {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }
        
        .signature-line {
          max-width: 300px;
          margin: 0 auto;
        }
        
        .signature-line hr {
          margin-bottom: 5px;
          border: none;
          border-top: 1px solid #e5e7eb;
        }
        
        /* Ajustes para impressão */
        @media print {
          body {
            background-color: white;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .container {
            box-shadow: none;
            max-width: 100%;
          }
          
          .table-wrapper {
            overflow-x: visible;
            box-shadow: none;
          }
          
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          td { page-break-inside: avoid; }
          thead { display: table-header-group; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.title}</h1>
          <div class="info">
            <p><strong>Período:</strong> ${new Date(data.period.start).toLocaleDateString('pt-BR')} a ${new Date(data.period.end).toLocaleDateString('pt-BR')}</p>
            <p><strong>Gerado em:</strong> ${new Date(data.generatedAt).toLocaleString('pt-BR')}</p>
          </div>
        </div>
        
        ${statsSection}
        
        ${filtersSection}
        
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                ${tableHeaders}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        
        ${signatureSection}
      </div>
    </body>
    </html>
  `;
}

// Função para escapar HTML
export function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Função auxiliar para gerar um nome de arquivo para o relatório
export function generateFileName(type: string, format: string): string {
  const date = new Date().toISOString().split('T')[0];
  const reportName = type.charAt(0).toUpperCase() + type.slice(1);
  // Usar as extensões corretas para cada formato
  return `Relatorio_${reportName}_${date}.${format === 'pdf' ? 'html' : 'csv'}`;
}

// Função para disparar o download
export function triggerDownload(content: string, fileName: string, mimeType: string): void {
  // Criar um blob com o conteúdo
  const blob = new Blob([content], { type: mimeType });
  
  // Criar URL para o blob
  const url = URL.createObjectURL(blob);
  
  // Criar um elemento <a> para download
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  // Adicionar o link ao documento e clicar
  document.body.appendChild(link);
  link.click();
  
  // Limpar
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
} 