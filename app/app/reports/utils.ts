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
  
  // Definir colunas e cabeçalhos da tabela
  const defaultColumns = ["ID", "Título"];
  
  interface ColumnConfig {
    id: string;
    label: string;
    includeIf: boolean;
    format: (task: Todo) => string;
  }
  
  const columnConfigs: ColumnConfig[] = [
    {
      id: "id", 
      label: "ID", 
      includeIf: true, // ID é sempre incluído
      format: (task) => String(task.id)
    },
    {
      id: "title", 
      label: "Título", 
      includeIf: true, // Título é sempre incluído
      format: (task) => escapeHtml(task.title)
    },
    {
      id: "description", 
      label: "Descrição", 
      includeIf: includeAll || customColumns.includes('description'),
      format: (task) => escapeHtml(task.description || '')
    },
    {
      id: "due_date", 
      label: "Vencimento", 
      includeIf: includeAll || customColumns.includes('due_date'),
      format: (task) => task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : '-'
    },
    {
      id: "priority", 
      label: "Prioridade", 
      includeIf: includeAll || customColumns.includes('priority'),
      format: (task) => task.priority ? priorityLabels[task.priority] || task.priority.toString() : '-'
    },
    {
      id: "completed", 
      label: "Concluída", 
      includeIf: includeAll || customColumns.includes('completed'),
      format: (task) => task.completed ? "Sim" : "Não"
    },
    {
      id: "project", 
      label: "Projeto", 
      includeIf: includeAll || customColumns.includes('project'),
      format: (task) => escapeHtml(task.project_name || '-')
    },
    {
      id: "labels", 
      label: "Etiquetas", 
      includeIf: includeAll || customColumns.includes('labels'),
      format: (task) => {
        if (!task.labels || task.labels.length === 0) return '-';
        return escapeHtml(task.labels.map((label: Label) => label.name).join(', '));
      }
    },
    {
      id: "kanban_column", 
      label: "Coluna", 
      includeIf: includeAll || customColumns.includes('kanban_column'),
      format: (task) => task.kanban_column ? kanbanLabels[task.kanban_column as string] || task.kanban_column : '-'
    },
    {
      id: "created_at", 
      label: "Criada em", 
      includeIf: includeAll || customColumns.includes('created_at'),
      format: (task) => task.created_at ? new Date(task.created_at).toLocaleDateString('pt-BR') : '-'
    },
    {
      id: "updated_at", 
      label: "Atualizada em", 
      includeIf: includeAll || customColumns.includes('updated_at'),
      format: (task) => task.updated_at ? new Date(task.updated_at).toLocaleDateString('pt-BR') : '-'
    }
  ];
  
  // Filtrar colunas que devem ser incluídas
  const columnsToInclude = columnConfigs.filter(col => col.includeIf);
  
  // Criar cabeçalhos HTML
  const tableHeaders = columnsToInclude.map(col => 
    `<th>${col.label}</th>`
  ).join('');
  
  // Criar linhas de tabela HTML
  let tableRows = '';
  
  if (data.items && data.items.length > 0) {
    data.items.forEach((task) => {
      // Construir células da linha
      const cells = columnsToInclude.map(col => 
        `<td>${col.format(task)}</td>`
      ).join('');
      
      // Construir linha HTML
      tableRows += `<tr>${cells}</tr>`;
    });
  } else {
    // Se não houver dados, mostrar mensagem
    tableRows = `<tr><td colspan="${columnsToInclude.length}" style="text-align:center">Nenhuma tarefa encontrada no período especificado</td></tr>`;
  }
  
  // Criar a seção de filtros aplicados
  let filtersSection = '';
  if (data.filters) {
    let filtersList = [];
    
    // Adicionar projetos filtrados
    if (data.filters.projectIds && data.filters.projectIds.length > 0) {
      filtersList.push(`<strong>Projetos:</strong> ${escapeHtml(data.filters.projectIds.join(', '))}`);
    }
    
    // Adicionar etiquetas filtradas
    if (data.filters.labelIds && data.filters.labelIds.length > 0) {
      filtersList.push(`<strong>Etiquetas:</strong> ${escapeHtml(data.filters.labelIds.join(', '))}`);
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
  
  // Código HTML completo com estilos CSS inline para melhor compatibilidade
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${data.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; font-size: 24px; margin-bottom: 10px; }
        h3 { color: #555; font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
        .info { color: #666; margin-bottom: 20px; font-size: 14px; }
        .filters-section { margin-bottom: 20px; background-color: #f8f8f8; padding: 10px; border-radius: 5px; }
        .filters-section ul { margin: 10px 0; padding-left: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background-color: #f2f2f2; text-align: left; padding: 8px; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f9f9f9; }
      </style>
    </head>
    <body>
      <h1>${data.title}</h1>
      <div class="info">
        <p>Período: ${new Date(data.period.start).toLocaleDateString('pt-BR')} a ${new Date(data.period.end).toLocaleDateString('pt-BR')}</p>
        <p>Gerado em: ${new Date(data.generatedAt).toLocaleString('pt-BR')}</p>
      </div>
      
      ${filtersSection}
      
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