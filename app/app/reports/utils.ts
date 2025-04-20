import type { Todo as BaseTodo } from "@/lib/todos";
import type { Label } from "@/lib/labels";
import type { Project } from "@/lib/projects";

interface Todo extends BaseTodo {
  labels?: Label[];
  project_id?: number;
}

export interface ReportFilters {
  projectIds?: string[];
  labelIds?: string[];
  priorities?: string[];
  customColumns?: string[];
}

export interface ReportData {
  title: string;
  period: { start: string; end: string };
  generatedAt: string;
  items: Todo[];
  filters?: ReportFilters;
}

export async function fetchTasks(reportType: string, startDate: string, endDate: string, filters?: ReportFilters): Promise<Todo[]> {
  try {
    let url = `/api/reports?type=${reportType}&startDate=${startDate}&endDate=${endDate}`;
    
    const safeFilters = filters || {};
    console.log("Filtros sendo aplicados:", JSON.stringify(safeFilters));
    
    if (safeFilters.projectIds && Array.isArray(safeFilters.projectIds) && safeFilters.projectIds.length > 0) {
      const projectString = safeFilters.projectIds.join(',');
      url += `&projectIds=${projectString}`;
      console.log(`Filtrando por projetos [${projectString}]`);
    }
    
    if (safeFilters.labelIds && Array.isArray(safeFilters.labelIds) && safeFilters.labelIds.length > 0) {
      const labelString = safeFilters.labelIds.join(',');
      url += `&labelIds=${labelString}`;
      console.log(`Filtrando por etiquetas [${labelString}]`);
    }
    
    if (safeFilters.priorities && Array.isArray(safeFilters.priorities) && safeFilters.priorities.length > 0) {
      const priorityString = safeFilters.priorities.join(',');
      url += `&priorities=${priorityString}`;
      console.log(`Filtrando por prioridades [${priorityString}]`);
    }
    
    console.log("URL de requisição do relatório:", url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Erro na resposta do servidor:", response.status, response.statusText);
      throw new Error(`Error fetching tasks: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Recebidas ${data.tasks?.length || 0} tarefas do servidor`);
    
    if (safeFilters.projectIds && safeFilters.projectIds.length > 0) {
      // Verificação adicional para garantir que apenas tarefas dos projetos selecionados sejam retornadas
      const projectIds = safeFilters.projectIds;
      const filteredTasks = data.tasks?.filter((task: Todo) => 
        task.project_name && 
        projectIds.some(id => {
          // Verificamos o ID de forma segura, permitindo tanto string quanto número
          const projectId = id.toString();
          return task.project_id ? task.project_id.toString() === projectId : false;
        })
      ) || [];
      
      if (filteredTasks.length !== data.tasks?.length) {
        console.warn(`Filtragem adicional de projetos aplicada: ${data.tasks?.length || 0} -> ${filteredTasks.length}`);
        return filteredTasks;
      }
    }
    
    return data.tasks || [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

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

export function generateCSV(data: ReportData): string {
  const customColumns = data.filters?.customColumns || [];
  const includeAll = customColumns.length === 0;

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
  
  if (!data.items || data.items.length === 0) {
    return headers.join(',') + '\n';
  }
  
  let csv = headers.join(',') + '\n';
  
  const priorityLabels: Record<number, string> = {
    1: "Urgente",
    2: "Alta",
    3: "Média",
    4: "Baixa",
    5: "Muito Baixa"
  };
  
  const kanbanLabels: Record<string, string> = {
    "backlog": "Backlog",
    "planning": "Planejamento",
    "inProgress": "Em Progresso",
    "validation": "Validação",
    "completed": "Concluído"
  };
  
  data.items.forEach((task) => {
    const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : '';
    const priority = task.priority ? priorityLabels[task.priority] || task.priority.toString() : '';
    const completed = task.completed ? "Sim" : "Não";
    const kanban = task.kanban_column ? kanbanLabels[task.kanban_column as string] || task.kanban_column : '';
    const createdAt = task.created_at ? new Date(task.created_at).toLocaleDateString('pt-BR') : '';
    const updatedAt = task.updated_at ? new Date(task.updated_at).toLocaleDateString('pt-BR') : '';
    
    let labelsText = '';
    if (task.labels && task.labels.length > 0) {
      labelsText = task.labels.map((label: Label) => label.name).join(', ');
    }
    
    const safeTitle = escapeCsvField(task.title);
    const safeDesc = escapeCsvField(task.description || '');
    const safeProject = escapeCsvField(task.project_name || '');
    const safeLabels = escapeCsvField(labelsText);
    
    let row = [
      task.id.toString(),
      safeTitle
    ];
    
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

export function escapeCsvField(field: string): string {
  if (!field) return '';
  
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  
  return field;
}

export function generateHTML(data: ReportData): string {
  const customColumns = data.filters?.customColumns || [];
  const includeAll = customColumns.length === 0;
  
  const priorityLabels: Record<number, string> = {
    1: "Urgente",
    2: "Alta",
    3: "Média",
    4: "Baixa",
    5: "Muito Baixa"
  };
  
  const kanbanLabels: Record<string, string> = {
    "backlog": "Backlog",
    "planning": "Planejamento",
    "inProgress": "Em Progresso",
    "validation": "Validação",
    "completed": "Concluído"
  };
  
  const priorityColors: Record<number, string> = {
    1: "#ef4444",
    2: "#f97316",
    3: "#facc15",
    4: "#16a34a",
    5: "#3b82f6"
  };
  
  const defaultColumns = ["ID", "Título"];
  
  interface ColumnConfig {
    id: string;
    label: string;
    includeIf: boolean;
    format: (task: Todo) => string;
    width?: string;
  }
  
  const columnConfigs: ColumnConfig[] = [
    {
      id: "id", 
      label: "ID", 
      includeIf: true,
      format: (task) => String(task.id),
      width: "50px"
    },
    {
      id: "title", 
      label: "Título", 
      includeIf: true,
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
  
  const columnsToInclude = columnConfigs.filter(col => col.includeIf);
  
  const tableHeaders = columnsToInclude.map(col => 
    `<th style="${col.width ? `width:${col.width};` : ''}">${col.label}</th>`
  ).join('');
  
  let tableRows = '';
  
  if (data.items && data.items.length > 0) {
    data.items.forEach((task, index) => {
      const rowClass = index % 2 === 0 ? 'even-row' : 'odd-row';
      
      const cells = columnsToInclude.map(col => 
        `<td style="${col.width ? `width:${col.width};` : ''}">${col.format(task)}</td>`
      ).join('');
      
      tableRows += `<tr class="${rowClass}">${cells}</tr>`;
    });
  } else {
    tableRows = `<tr><td colspan="${columnsToInclude.length}" style="text-align:center; padding:20px; color:#888;">Nenhuma tarefa encontrada no período especificado</td></tr>`;
  }
  
  let statsSection = '';
  let chartsSection = '';
  
  if (data.items && data.items.length > 0) {
    const totalTasks = data.items.length;
    const completedTasks = data.items.filter(task => task.completed).length;
    const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const priorityCounts: Record<string, number> = {};
    data.items.forEach(task => {
      if (task.priority) {
        const priorityLabel = priorityLabels[task.priority] || task.priority.toString();
        priorityCounts[priorityLabel] = (priorityCounts[priorityLabel] || 0) + 1;
      } else {
        priorityCounts["Sem prioridade"] = (priorityCounts["Sem prioridade"] || 0) + 1;
      }
    });
    
    const projectsCount: Record<string, number> = {};
    data.items.forEach(task => {
      if (task.project_name) {
        projectsCount[task.project_name] = (projectsCount[task.project_name] || 0) + 1;
      } else {
        projectsCount["Sem projeto"] = (projectsCount["Sem projeto"] || 0) + 1;
      }
    });
    
    const statusData = [
      { label: "Concluídas", value: completedTasks, color: "#16a34a" },
      { label: "Pendentes", value: totalTasks - completedTasks, color: "#ef4444" }
    ];
    
    const monthlyData: Record<string, number> = {};
    
    if (data.items[0]?.created_at) {
      data.items.forEach(task => {
        if (task.created_at) {
          const month = new Date(task.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
          monthlyData[month] = (monthlyData[month] || 0) + 1;
        }
      });
    }
    
    const priorityChartData = {
      labels: Object.keys(priorityCounts),
      datasets: [{
        data: Object.values(priorityCounts),
        backgroundColor: Object.keys(priorityCounts).map(label => {
          const priorityNumber = Object.entries(priorityLabels).find(([_, pLabel]) => pLabel === label)?.[0];
          return priorityNumber ? priorityColors[parseInt(priorityNumber, 10)] : '#777';
        }),
        borderWidth: 0
      }]
    };
    
    const sortedProjects = Object.entries(projectsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    const projectChartData = {
      labels: sortedProjects.map(([project]) => project),
      datasets: [{
        label: 'Número de Tarefas',
        data: sortedProjects.map(([_, count]) => count),
        backgroundColor: '#3b82f6',
        borderWidth: 0,
        borderRadius: 4
      }]
    };
    
    const sortedMonthlyEntries = Object.entries(monthlyData)
      .sort((a, b) => {
        const [monthA, yearA] = a[0].split('/').map(Number);
        const [monthB, yearB] = b[0].split('/').map(Number);
        
        if (yearA !== yearB) return yearA - yearB;
        return monthA - monthB;
      });
    
    const timelineChartData = {
      labels: sortedMonthlyEntries.map(([date]) => date),
      datasets: [{
        label: 'Tarefas Criadas',
        data: sortedMonthlyEntries.map(([_, count]) => count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };
    
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
    
    chartsSection = `
      <div class="charts-section">
        <h3>Visualização Gráfica</h3>
        
        <div class="charts-grid">
          <div class="chart-container">
            <h4>Distribuição por Prioridade</h4>
            <div class="chart-wrapper">
              <canvas id="priorityChart"></canvas>
            </div>
          </div>
          
          <div class="chart-container">
            <h4>Status de Conclusão</h4>
            <div class="chart-wrapper">
              <canvas id="statusChart"></canvas>
            </div>
          </div>
          
          ${Object.keys(projectsCount).length > 3 ? `
            <div class="chart-container chart-full-width">
              <h4>Tarefas por Projeto</h4>
              <div class="chart-wrapper">
                <canvas id="projectChart"></canvas>
              </div>
            </div>
          ` : ''}
          
          ${Object.keys(monthlyData).length > 1 ? `
            <div class="chart-container chart-full-width">
              <h4>Linha do Tempo de Tarefas</h4>
              <div class="chart-wrapper">
                <canvas id="timelineChart"></canvas>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
      
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          Chart.defaults.font.family = "'Roboto', sans-serif";
          Chart.defaults.font.size = 12;
          Chart.defaults.plugins.legend.position = 'bottom';
          
          new Chart(
            document.getElementById('priorityChart'),
            {
              type: 'doughnut',
              data: ${JSON.stringify(priorityChartData)},
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      usePointStyle: true,
                      boxWidth: 10
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const value = context.raw;
                        const percentage = Math.round((value / total) * 100);
                        return \`\${context.label}: \${value} (\${percentage}%)\`;
                      }
                    }
                  }
                }
              }
            }
          );
          
          new Chart(
            document.getElementById('statusChart'),
            {
              type: 'pie',
              data: {
                labels: ${JSON.stringify(statusData.map(item => item.label))},
                datasets: [{
                  data: ${JSON.stringify(statusData.map(item => item.value))},
                  backgroundColor: ${JSON.stringify(statusData.map(item => item.color))},
                  borderWidth: 0
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const value = context.raw;
                        const percentage = Math.round((value / total) * 100);
                        return \`\${context.label}: \${value} (\${percentage}%)\`;
                      }
                    }
                  }
                }
              }
            }
          );
          
          ${Object.keys(projectsCount).length > 3 ? `
            new Chart(
              document.getElementById('projectChart'),
              {
                type: 'bar',
                data: ${JSON.stringify(projectChartData)},
                options: {
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false
                      },
                      ticks: {
                        precision: 0
                      }
                    },
                    y: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }
              }
            );
          ` : ''}
          
          ${Object.keys(monthlyData).length > 1 ? `
            new Chart(
              document.getElementById('timelineChart'),
              {
                type: 'line',
                data: ${JSON.stringify(timelineChartData)},
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      grid: {
                        drawBorder: false
                      },
                      beginAtZero: true,
                      ticks: {
                        precision: 0
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  }
                }
              }
            );
          ` : ''}
        });
      </script>
    `;
  }
  
  let filtersSection = '';
  if (data.filters) {
    let filtersList = [];
    
    if (data.filters.projectIds && data.filters.projectIds.length > 0) {
      const projectNames = data.filters.projectIds.map(id => {
        const project = data.items.find(item => item.project_name && item.id.toString() === id);
        return project ? project.project_name : id;
      }).join(', ');
      
      filtersList.push(`<strong>Projetos:</strong> ${escapeHtml(projectNames)}`);
    }
    
    if (data.filters.labelIds && data.filters.labelIds.length > 0) {
      const labelNames = data.filters.labelIds.map(id => {
        const item = data.items.find(item => 
          item.labels && item.labels.some((label: any) => label.id.toString() === id)
        );
        const label = item?.labels?.find((l: any) => l.id.toString() === id);
        return label ? label.name : id;
      }).join(', ');
      
      filtersList.push(`<strong>Etiquetas:</strong> ${escapeHtml(labelNames)}`);
    }
    
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
  
  const signatureSection = `
    <div class="signature-section">
      <div class="signature-line">
        <hr>
        <span>Relatório gerado automaticamente pelo sistema</span>
      </div>
    </div>
  `;
  
  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  };
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title}</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        
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
          color: #3b82f6;
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
        
        .charts-section {
          margin-bottom: 30px;
        }
        
        .charts-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 15px;
        }
        
        .chart-container {
          flex: 1 0 calc(50% - 20px);
          min-width: 250px;
          background-color: #fff;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .chart-full-width {
          flex: 1 0 100%;
        }
        
        .chart-wrapper {
          height: 250px;
          position: relative;
        }
        
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
          background-color: #3b82f6; 
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
          
          .chart-wrapper {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.title}</h1>
          <div class="info">
            <p><strong>Período:</strong> ${formatDate(data.period.start)} a ${formatDate(data.period.end)}</p>
            <p><strong>Gerado em:</strong> ${new Date(data.generatedAt).toLocaleString('pt-BR')}</p>
          </div>
        </div>
        
        ${statsSection}
        
        ${chartsSection}
        
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

export function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateFileName(type: string, format: string): string {
  const date = new Date().toISOString().split('T')[0];
  const reportName = type.charAt(0).toUpperCase() + type.slice(1);
  let extension = 'html';
  
  if (format === 'excel') {
    extension = 'csv';
  }
  
  return `Relatorio_${reportName}_${date}.${extension}`;
}

export function triggerDownload(content: string, fileName: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
} 