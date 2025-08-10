import type { Todo as BaseTodo } from "@/lib/todos";
import type { Label } from "@/lib/labels";
import type { Project } from "@/lib/projects";

interface Todo extends BaseTodo {
  labels?: Label[];
  project_id?: number;
  pomodoro_minutes?: number;
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

// Função para calcular a cor de texto baseada na cor de fundo
function getContrastColor(hexColor: string) {
  // Se não houver cor ou for inválida, retornar preto
  if (!hexColor || !hexColor.startsWith("#")) {
    return "#000000";
  }

  // Converter hex para RGB
  let r = 0,
    g = 0,
    b = 0;
  if (hexColor.length === 7) {
    r = parseInt(hexColor.substring(1, 3), 16);
    g = parseInt(hexColor.substring(3, 5), 16);
    b = parseInt(hexColor.substring(5, 7), 16);
  } else if (hexColor.length === 4) {
    r = parseInt(hexColor.substring(1, 2), 16) * 17;
    g = parseInt(hexColor.substring(2, 3), 16) * 17;
    b = parseInt(hexColor.substring(3, 4), 16) * 17;
  }

  // Calcular luminância
  // Fórmula YIQ: https://24ways.org/2010/calculating-color-contrast/
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Retornar branco ou preto dependendo da luminância
  return yiq >= 128 ? "#000000" : "#ffffff";
}

export async function fetchTasks(
  reportType: string,
  startDate: string,
  endDate: string,
  filters?: ReportFilters
): Promise<Todo[]> {
  try {
    let url = `/api/reports?type=${reportType}&startDate=${startDate}&endDate=${endDate}`;

    const safeFilters = filters || {};

    if (
      safeFilters.projectIds &&
      Array.isArray(safeFilters.projectIds) &&
      safeFilters.projectIds.length > 0
    ) {
      const projectString = safeFilters.projectIds.join(",");
      url += `&projectIds=${projectString}`;
    }

    if (
      safeFilters.labelIds &&
      Array.isArray(safeFilters.labelIds) &&
      safeFilters.labelIds.length > 0
    ) {
      const labelString = safeFilters.labelIds.join(",");
      url += `&labelIds=${labelString}`;
    }

    if (
      safeFilters.priorities &&
      Array.isArray(safeFilters.priorities) &&
      safeFilters.priorities.length > 0
    ) {
      const priorityString = safeFilters.priorities.join(",");
      url += `&priorities=${priorityString}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        "Erro na resposta do servidor:",
        response.status,
        response.statusText
      );
      throw new Error(`Error fetching tasks: ${response.status}`);
    }

    const data = await response.json();

    if (safeFilters.projectIds && safeFilters.projectIds.length > 0) {
      const projectIds = safeFilters.projectIds;
      const filteredTasks =
        data.tasks?.filter(
          (task: Todo) =>
            task.project_name &&
            projectIds.some((id) => {
              const projectId = id.toString();
              return task.project_id
                ? task.project_id.toString() === projectId
                : false;
            })
        ) || [];

      return filteredTasks;
    }

    return data.tasks || [];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch("/api/projects");
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

export async function fetchFocusSummary(): Promise<{
  totalMinutes: number;
  byMode: Record<string, number>;
  days: Array<{ date: string; minutes: number }>;
  hours: Array<{ hour: string; minutes: number }>;
  insights: { bestHour: string };
} | null> {
  try {
    const response = await fetch("/api/pomodoro/summary", {
      credentials: "include",
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data && data.success) return data;
    return null;
  } catch {
    return null;
  }
}

export async function fetchLabels(): Promise<Label[]> {
  try {
    const response = await fetch("/api/labels");
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
    description: "Descrição",
    due_date: "Data de Vencimento",
    priority: "Prioridade",
    completed: "Concluída",
    project: "Projeto",
    labels: "Etiquetas",
    kanban_column: "Coluna Kanban",
    points: "Pontos",
    estimated_time: "Tempo Estimado",
    pomodoro_minutes: "Tempo Gasto (Pomodoro)",
    created_at: "Data de Criação",
    updated_at: "Última Atualização",
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
    return headers.join(",") + "\n";
  }

  let csv = headers.join(",") + "\n";

  const priorityLabels: Record<number, string> = {
    1: "Urgente",
    2: "Alta",
    3: "Média",
    4: "Baixa",
    5: "Muito Baixa",
  };

  const kanbanLabels: Record<string, string> = {
    backlog: "Backlog",
    planning: "Planejamento",
    inProgress: "Em Progresso",
    validation: "Validação",
    completed: "Concluído",
  };

  // Função auxiliar para formatar pontos
  const formatPoints = (points: number | null | undefined) => {
    if (!points) return "";
    const pointsLabels: Record<number, string> = {
      1: "1 - Muito Fácil",
      2: "2 - Fácil",
      3: "3 - Médio",
      4: "4 - Difícil",
      5: "5 - Muito Difícil",
    };
    return pointsLabels[points] || points.toString();
  };

  // Função auxiliar para formatar tempo estimado
  const formatEstimatedTime = (minutes: number | null | undefined) => {
    if (!minutes) return "";

    const days = Math.floor(minutes / (60 * 8));
    const remainingHours = Math.floor((minutes % (60 * 8)) / 60);
    const remainingMinutes = minutes % 60;

    if (days > 0) {
      if (remainingHours > 0 || remainingMinutes > 0) {
        return `${days}d ${remainingHours > 0 ? `${remainingHours}h` : ""} ${
          remainingMinutes > 0 ? `${remainingMinutes}min` : ""
        }`.trim();
      }
      return `${days}d`;
    } else if (remainingHours > 0) {
      if (remainingMinutes > 0) {
        return `${remainingHours}h ${remainingMinutes}min`;
      }
      return `${remainingHours}h`;
    } else {
      return `${remainingMinutes}min`;
    }
  };

  data.items.forEach((task) => {
    const dueDate = task.due_date
      ? new Date(task.due_date).toLocaleDateString("pt-BR")
      : "";
    const priority = task.priority
      ? priorityLabels[task.priority] || task.priority.toString()
      : "";
    const completed = task.completed ? "Sim" : "Não";
    const kanban = task.kanban_column
      ? kanbanLabels[task.kanban_column as string] || task.kanban_column
      : "";
    const points = formatPoints(task.points);
    const estimatedTime = formatEstimatedTime(task.estimated_time);
    const createdAt = task.created_at
      ? new Date(task.created_at).toLocaleDateString("pt-BR")
      : "";
    const updatedAt = task.updated_at
      ? new Date(task.updated_at).toLocaleDateString("pt-BR")
      : "";

    let labelsText = "";
    if (task.labels && task.labels.length > 0) {
      labelsText = task.labels.map((label: Label) => label.name).join(", ");
    }

    const safeTitle = escapeCsvField(task.title);
    const safeDesc = escapeCsvField(task.description || "");
    const safeProject = escapeCsvField(task.project_name || "");
    const safeLabels = escapeCsvField(labelsText);

    let row = [task.id.toString(), safeTitle];

    if (includeAll || customColumns.includes("description")) row.push(safeDesc);
    if (includeAll || customColumns.includes("due_date")) row.push(dueDate);
    if (includeAll || customColumns.includes("priority")) row.push(priority);
    if (includeAll || customColumns.includes("completed")) row.push(completed);
    if (includeAll || customColumns.includes("project")) row.push(safeProject);
    if (includeAll || customColumns.includes("labels")) row.push(safeLabels);
    if (includeAll || customColumns.includes("kanban_column")) row.push(kanban);
    if (includeAll || customColumns.includes("points")) row.push(points);
    if (includeAll || customColumns.includes("estimated_time"))
      row.push(estimatedTime);
    if (includeAll || customColumns.includes("created_at")) row.push(createdAt);
    if (includeAll || customColumns.includes("pomodoro_minutes"))
      row.push(String(task.pomodoro_minutes || 0));
    if (includeAll || customColumns.includes("updated_at")) row.push(updatedAt);

    csv += row.join(",") + "\n";
  });

  return csv;
}

export function escapeCsvField(field: string): string {
  if (!field) return "";

  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
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
    5: "Muito Baixa",
  };

  const kanbanLabels: Record<string, string> = {
    backlog: "Backlog",
    planning: "Planejamento",
    inProgress: "Em Progresso",
    validation: "Validação",
    completed: "Concluído",
  };

  const priorityColors: Record<number, string> = {
    1: "#ef4444",
    2: "#f97316",
    3: "#facc15",
    4: "#16a34a",
    5: "#3b82f6",
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
      width: "50px",
    },
    {
      id: "title",
      label: "Título",
      includeIf: true,
      format: (task) => {
        const title = task.title || "";
        const truncated =
          title.length > 50 ? title.substring(0, 50) + "..." : title;
        return `<div class="cell-tooltip" data-full-text="${escapeHtml(
          title
        )}">${escapeHtml(truncated)}</div>`;
      },
      width: "20%",
    },
    {
      id: "description",
      label: "Descrição",
      includeIf: includeAll || customColumns.includes("description"),
      format: (task) => {
        const description = task.description || "";
        if (!description) return "-";
        const truncated =
          description.length > 80
            ? description.substring(0, 80) + "..."
            : description;
        return `<div class="cell-tooltip" data-full-text="${escapeHtml(
          description
        )}">${escapeHtml(truncated)}</div>`;
      },
      width: "25%",
    },
    {
      id: "due_date",
      label: "Vencimento",
      includeIf: includeAll || customColumns.includes("due_date"),
      format: (task) =>
        task.due_date
          ? new Date(task.due_date).toLocaleDateString("pt-BR")
          : "-",
      width: "100px",
    },
    {
      id: "priority",
      label: "Prioridade",
      includeIf: includeAll || customColumns.includes("priority"),
      format: (task) => {
        if (!task.priority) return "-";

        const label = priorityLabels[task.priority] || task.priority;
        const color = priorityColors[task.priority] || "#777";
        const textColor = getContrastColor(color);

        return `<span style="display:inline-block; padding:2px 8px; border-radius:10px; background-color:${color}; color:${textColor}; font-size:11px; font-weight:bold;">${label}</span>`;
      },
      width: "80px",
    },
    {
      id: "completed",
      label: "Concluída",
      includeIf: includeAll || customColumns.includes("completed"),
      format: (task) =>
        task.completed
          ? '<span style="color:#16a34a; font-weight:bold;">Sim</span>'
          : '<span style="color:#ef4444; font-weight:bold;">Não</span>',
      width: "80px",
    },
    {
      id: "project",
      label: "Projeto",
      includeIf: includeAll || customColumns.includes("project"),
      format: (task) => {
        if (!task.project_name) return "-";

        const color = task.project_color || "#777";
        const textColor = getContrastColor(color);

        return `<span style="display:inline-block; padding:2px 8px; border-radius:10px; background-color:${color}; color:${textColor}; font-size:11px;">${escapeHtml(
          task.project_name
        )}</span>`;
      },
      width: "120px",
    },
    {
      id: "labels",
      label: "Etiquetas",
      includeIf: includeAll || customColumns.includes("labels"),
      format: (task) => {
        if (!task.labels || task.labels.length === 0) return "-";
        return task.labels
          .map((label: Label) => {
            const color = label.color || "#777";
            const textColor = getContrastColor(color);
            return `<span style="display:inline-block; margin:1px 2px; padding:1px 6px; border-radius:8px; background-color:${color}; color:${textColor}; font-size:10px;">${escapeHtml(
              label.name
            )}</span>`;
          })
          .join(" ");
      },
      width: "150px",
    },
    {
      id: "kanban_column",
      label: "Coluna",
      includeIf: includeAll || customColumns.includes("kanban_column"),
      format: (task) =>
        task.kanban_column
          ? kanbanLabels[task.kanban_column as string] || task.kanban_column
          : "-",
      width: "120px",
    },
    {
      id: "points",
      label: "Pontos",
      includeIf: includeAll || customColumns.includes("points"),
      format: (task) => {
        if (!task.points) return "-";

        const pointsLabels: Record<number, string> = {
          1: "Muito Fácil",
          2: "Fácil",
          3: "Médio",
          4: "Difícil",
          5: "Muito Difícil",
        };

        const pointsColors: Record<number, string> = {
          1: "#16a34a",
          2: "#3b82f6",
          3: "#facc15",
          4: "#f97316",
          5: "#ef4444",
        };

        const label = pointsLabels[task.points] || task.points.toString();
        const color = pointsColors[task.points] || "#777";
        const textColor = getContrastColor(color);

        return `<span style="display:inline-block; padding:2px 8px; border-radius:10px; background-color:${color}; color:${textColor}; font-size:11px; font-weight:bold;">${task.points} - ${label}</span>`;
      },
      width: "100px",
    },
    {
      id: "estimated_time",
      label: "Tempo Estimado",
      includeIf: includeAll || customColumns.includes("estimated_time"),
      format: (task) => {
        if (!task.estimated_time) return "-";

        const minutes = task.estimated_time;
        const days = Math.floor(minutes / (60 * 8));
        const remainingHours = Math.floor((minutes % (60 * 8)) / 60);
        const remainingMinutes = minutes % 60;

        if (days > 0) {
          if (remainingHours > 0 || remainingMinutes > 0) {
            return `${days}d ${
              remainingHours > 0 ? `${remainingHours}h` : ""
            } ${remainingMinutes > 0 ? `${remainingMinutes}min` : ""}`.trim();
          }
          return `${days}d`;
        } else if (remainingHours > 0) {
          if (remainingMinutes > 0) {
            return `${remainingHours}h ${remainingMinutes}min`;
          }
          return `${remainingHours}h`;
        } else {
          return `${remainingMinutes}min`;
        }
      },
      width: "120px",
    },
    {
      id: "created_at",
      label: "Criada em",
      includeIf: includeAll || customColumns.includes("created_at"),
      format: (task) =>
        task.created_at
          ? new Date(task.created_at).toLocaleDateString("pt-BR")
          : "-",
      width: "100px",
    },
    {
      id: "updated_at",
      label: "Atualizada em",
      includeIf: includeAll || customColumns.includes("updated_at"),
      format: (task) =>
        task.updated_at
          ? new Date(task.updated_at).toLocaleDateString("pt-BR")
          : "-",
      width: "100px",
    },
  ];

  const columnsToInclude = columnConfigs.filter((col) => col.includeIf);

  const tableHeaders = columnsToInclude
    .map(
      (col, index) =>
        `<th class="resizable-column" style="${
          col.width ? `width:${col.width};` : ""
        }" data-column="${index}">
      ${col.label}
      <div class="column-resizer"></div>
    </th>`
    )
    .join("");

  let tableRows = "";

  if (data.items && data.items.length > 0) {
    data.items.forEach((task, index) => {
      const rowClass = index % 2 === 0 ? "even-row" : "odd-row";

      const cells = columnsToInclude
        .map(
          (col) =>
            `<td style="${col.width ? `width:${col.width};` : ""}">${col.format(
              task
            )}</td>`
        )
        .join("");

      tableRows += `<tr class="${rowClass}">${cells}</tr>`;
    });
  } else {
    tableRows = `<tr><td colspan="${columnsToInclude.length}" style="text-align:center; padding:20px; color:#888;">Nenhuma tarefa encontrada no período especificado</td></tr>`;
  }

  let statsSection = "";
  let chartsSection = "";

  if (data.items && data.items.length > 0) {
    const totalTasks = data.items.length;
    const completedTasks = data.items.filter((task) => task.completed).length;
    const percentComplete =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const priorityCounts: Record<string, number> = {};
    data.items.forEach((task) => {
      if (task.priority) {
        const priorityLabel =
          priorityLabels[task.priority] || task.priority.toString();
        priorityCounts[priorityLabel] =
          (priorityCounts[priorityLabel] || 0) + 1;
      } else {
        priorityCounts["Sem prioridade"] =
          (priorityCounts["Sem prioridade"] || 0) + 1;
      }
    });

    const projectsCount: Record<string, number> = {};
    data.items.forEach((task) => {
      if (task.project_name) {
        projectsCount[task.project_name] =
          (projectsCount[task.project_name] || 0) + 1;
      } else {
        projectsCount["Sem projeto"] = (projectsCount["Sem projeto"] || 0) + 1;
      }
    });

    // Calcular estatísticas de pontos
    const pointsCounts: Record<string, number> = {};
    let totalPoints = 0;
    let tasksWithPoints = 0;

    data.items.forEach((task) => {
      if (task.points) {
        const pointsLabels: Record<number, string> = {
          1: "Muito Fácil (1)",
          2: "Fácil (2)",
          3: "Médio (3)",
          4: "Difícil (4)",
          5: "Muito Difícil (5)",
        };
        const pointsLabel = pointsLabels[task.points] || task.points.toString();
        pointsCounts[pointsLabel] = (pointsCounts[pointsLabel] || 0) + 1;
        totalPoints += task.points;
        tasksWithPoints++;
      }
    });

    const averagePoints =
      tasksWithPoints > 0 ? (totalPoints / tasksWithPoints).toFixed(1) : 0;

    // Calcular estatísticas de tempo estimado
    let totalEstimatedTime = 0;
    let tasksWithTime = 0;

    data.items.forEach((task) => {
      if (task.estimated_time) {
        totalEstimatedTime += task.estimated_time;
        tasksWithTime++;
      }
    });

    const formatTotalTime = (minutes: number) => {
      const days = Math.floor(minutes / (60 * 8));
      const remainingHours = Math.floor((minutes % (60 * 8)) / 60);
      const remainingMinutes = minutes % 60;

      if (days > 0) {
        if (remainingHours > 0 || remainingMinutes > 0) {
          return `${days}d ${remainingHours > 0 ? `${remainingHours}h` : ""} ${
            remainingMinutes > 0 ? `${remainingMinutes}min` : ""
          }`.trim();
        }
        return `${days}d`;
      } else if (remainingHours > 0) {
        if (remainingMinutes > 0) {
          return `${remainingHours}h ${remainingMinutes}min`;
        }
        return `${remainingHours}h`;
      } else {
        return `${remainingMinutes}min`;
      }
    };

    const averageEstimatedTime =
      tasksWithTime > 0 ? Math.round(totalEstimatedTime / tasksWithTime) : 0;

    const statusData = [
      { label: "Concluídas", value: completedTasks, color: "#16a34a" },
      {
        label: "Pendentes",
        value: totalTasks - completedTasks,
        color: "#ef4444",
      },
    ];

    const monthlyData: Record<string, number> = {};

    if (data.items[0]?.created_at) {
      data.items.forEach((task) => {
        if (task.created_at) {
          const month = new Date(task.created_at).toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          });
          monthlyData[month] = (monthlyData[month] || 0) + 1;
        }
      });
    }

    const priorityChartData = {
      labels: Object.keys(priorityCounts),
      datasets: [
        {
          data: Object.values(priorityCounts),
          backgroundColor: Object.keys(priorityCounts).map((label) => {
            const priorityNumber = Object.entries(priorityLabels).find(
              ([_, pLabel]) => pLabel === label
            )?.[0];
            return priorityNumber
              ? priorityColors[parseInt(priorityNumber, 10)]
              : "#777";
          }),
          borderWidth: 0,
        },
      ],
    };

    const sortedProjects = Object.entries(projectsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const projectChartData = {
      labels: sortedProjects.map(([project]) => project),
      datasets: [
        {
          label: "Número de Tarefas",
          data: sortedProjects.map(([_, count]) => count),
          backgroundColor: "#3b82f6",
          borderWidth: 0,
          borderRadius: 4,
        },
      ],
    };

    const sortedMonthlyEntries = Object.entries(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a[0].split("/").map(Number);
      const [monthB, yearB] = b[0].split("/").map(Number);

      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    const timelineChartData = {
      labels: sortedMonthlyEntries.map(([date]) => date),
      datasets: [
        {
          label: "Tarefas Criadas",
          data: sortedMonthlyEntries.map(([_, count]) => count),
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          tension: 0.4,
          fill: true,
        },
      ],
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
          ${
            tasksWithPoints > 0
              ? `
          <div class="stat-box">
            <span class="stat-value">${totalPoints}</span>
            <span class="stat-label">Total de Pontos</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">${averagePoints}</span>
            <span class="stat-label">Média de Pontos</span>
          </div>
          `
              : ""
          }
          ${
            tasksWithTime > 0
              ? `
          <div class="stat-box">
            <span class="stat-value">${formatTotalTime(
              totalEstimatedTime
            )}</span>
            <span class="stat-label">Tempo Total Estimado</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">${formatTotalTime(
              averageEstimatedTime
            )}</span>
            <span class="stat-label">Tempo Médio por Tarefa</span>
          </div>
          `
              : ""
          }
        </div>
        
        <div class="stats-detail">
          <div class="stats-priorities">
            <h4>Distribuição por Prioridade</h4>
            <ul class="stats-list">
              ${Object.entries(priorityCounts)
                .map(([priority, count]) => {
                  const priorityNumber = Object.entries(priorityLabels).find(
                    ([_, label]) => label === priority
                  )?.[0];
                  const color = priorityNumber
                    ? priorityColors[parseInt(priorityNumber, 10)]
                    : "#777";

                  return `
                  <li>
                    <span class="color-dot" style="background-color: ${color}"></span>
                    <span>${priority}: ${count}</span>
                  </li>
                `;
                })
                .join("")}
            </ul>
          </div>
          
          ${
            Object.keys(projectsCount).length > 0
              ? `
            <div class="stats-projects">
              <h4>Principais Projetos</h4>
              <ul class="stats-list">
                ${Object.entries(projectsCount)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(
                    ([project, count]) => `
                    <li>
                      <span>${escapeHtml(project)}: ${count} tarefa${
                      count > 1 ? "s" : ""
                    }</span>
                    </li>
                  `
                  )
                  .join("")}
              </ul>
            </div>
          `
              : ""
          }
          
          ${
            Object.keys(pointsCounts).length > 0
              ? `
            <div class="stats-points">
              <h4>Distribuição por Pontos</h4>
              <ul class="stats-list">
                ${Object.entries(pointsCounts)
                  .map(([points, count]) => {
                    const pointsColors: Record<string, string> = {
                      "Muito Fácil (1)": "#16a34a",
                      "Fácil (2)": "#3b82f6",
                      "Médio (3)": "#facc15",
                      "Difícil (4)": "#f97316",
                      "Muito Difícil (5)": "#ef4444",
                    };
                    const color = pointsColors[points] || "#777";

                    return `
                    <li>
                      <span class="color-dot" style="background-color: ${color}"></span>
                      <span>${points}: ${count}</span>
                    </li>
                  `;
                  })
                  .join("")}
              </ul>
            </div>
          `
              : ""
          }
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
          
          ${
            Object.keys(pointsCounts).length > 0
              ? `
          <div class="chart-container">
            <h4>Distribuição por Pontos</h4>
            <div class="chart-wrapper">
              <canvas id="pointsChart"></canvas>
            </div>
          </div>
          `
              : ""
          }
          
          ${
            Object.keys(projectsCount).length > 3
              ? `
            <div class="chart-container chart-full-width">
              <h4>Tarefas por Projeto</h4>
              <div class="chart-wrapper">
                <canvas id="projectChart"></canvas>
              </div>
            </div>
          `
              : ""
          }
          
          ${
            Object.keys(monthlyData).length > 1
              ? `
            <div class="chart-container chart-full-width">
              <h4>Linha do Tempo de Tarefas</h4>
              <div class="chart-wrapper">
                <canvas id="timelineChart"></canvas>
              </div>
            </div>
          `
              : ""
          }
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
                labels: ${JSON.stringify(statusData.map((item) => item.label))},
                datasets: [{
                  data: ${JSON.stringify(statusData.map((item) => item.value))},
                  backgroundColor: ${JSON.stringify(
                    statusData.map((item) => item.color)
                  )},
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
          
          ${
            Object.keys(pointsCounts).length > 0
              ? `
          new Chart(
            document.getElementById('pointsChart'),
            {
              type: 'doughnut',
              data: {
                labels: ${JSON.stringify(Object.keys(pointsCounts))},
                datasets: [{
                  data: ${JSON.stringify(Object.values(pointsCounts))},
                  backgroundColor: ${JSON.stringify(
                    Object.keys(pointsCounts).map((points) => {
                      const pointsColors: Record<string, string> = {
                        "Muito Fácil (1)": "#16a34a",
                        "Fácil (2)": "#3b82f6",
                        "Médio (3)": "#facc15",
                        "Difícil (4)": "#f97316",
                        "Muito Difícil (5)": "#ef4444",
                      };
                      return pointsColors[points] || "#777";
                    })
                  )},
                  borderWidth: 0
                }]
              },
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
          `
              : ""
          }
          
          ${
            Object.keys(projectsCount).length > 3
              ? `
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
          `
              : ""
          }
          
          ${
            Object.keys(monthlyData).length > 1
              ? `
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
          `
              : ""
          }
        });
      </script>
    `;
  }

  let filtersSection = "";
  if (data.filters) {
    let filtersList = [];

    if (data.filters.projectIds && data.filters.projectIds.length > 0) {
      const projectNames = data.filters.projectIds
        .map((id) => {
          const project = data.items.find(
            (item) => item.project_name && item.id.toString() === id
          );
          return project ? project.project_name : id;
        })
        .join(", ");

      filtersList.push(
        `<strong>Projetos:</strong> ${escapeHtml(projectNames)}`
      );
    }

    if (data.filters.labelIds && data.filters.labelIds.length > 0) {
      const labelNames = data.filters.labelIds
        .map((id) => {
          const item = data.items.find(
            (item) =>
              item.labels &&
              item.labels.some((label: any) => label.id.toString() === id)
          );
          const label = item?.labels?.find((l: any) => l.id.toString() === id);
          return label ? label.name : id;
        })
        .join(", ");

      filtersList.push(`<strong>Etiquetas:</strong> ${escapeHtml(labelNames)}`);
    }

    if (data.filters.priorities && data.filters.priorities.length > 0) {
      const priorityNames = data.filters.priorities
        .map((p) => priorityLabels[parseInt(p)] || p)
        .join(", ");
      filtersList.push(
        `<strong>Prioridades:</strong> ${escapeHtml(priorityNames)}`
      );
    }

    if (filtersList.length > 0) {
      filtersSection = `
        <div class="filters-section">
          <h3>Filtros Aplicados</h3>
          <ul>
            ${filtersList.map((filter) => `<li>${filter}</li>`).join("")}
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
      const [year, month, day] = dateString.split("-");
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
          table-layout: auto;
          min-width: 1000px;
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
          white-space: nowrap;
          user-select: none;
          resize: horizontal;
          overflow: hidden;
        }
        
        th:first-child {
          border-top-left-radius: 8px;
          min-width: 60px;
        }
        
        th:last-child {
          border-top-right-radius: 8px;
        }
        
        /* Colunas específicas com larguras mínimas */
        th:nth-child(1) { min-width: 60px; max-width: 80px; } /* ID */
        th:nth-child(2) { min-width: 200px; max-width: 400px; } /* Título */
        th:nth-child(3) { min-width: 250px; max-width: 500px; } /* Descrição */
        th:nth-child(4) { min-width: 120px; max-width: 150px; } /* Vencimento */
        th:nth-child(5) { min-width: 100px; max-width: 120px; } /* Prioridade */
        th:nth-child(6) { min-width: 80px; max-width: 100px; } /* Concluída */
        th:nth-child(7) { min-width: 120px; max-width: 180px; } /* Projeto */
        th:nth-child(8) { min-width: 150px; max-width: 250px; } /* Etiquetas */
        th:nth-child(9) { min-width: 100px; max-width: 150px; } /* Coluna */
        th:nth-child(10) { min-width: 100px; max-width: 150px; } /* Pontos */
        th:nth-child(11) { min-width: 120px; max-width: 180px; } /* Tempo Estimado */
        
        td { 
          padding: 10px 15px; 
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
          font-size: 12px;
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          line-height: 1.4;
        }
        
        /* Células específicas */
        td:nth-child(1) { /* ID */
          white-space: nowrap;
          text-align: center;
          font-weight: 600;
        }
        
        td:nth-child(2) { /* Título */
          font-weight: 500;
          white-space: normal;
          word-break: break-word;
          max-width: 400px;
        }
        
        td:nth-child(3) { /* Descrição */
          white-space: normal;
          word-break: break-word;
          max-width: 500px;
          line-height: 1.4;
        }
        
        td:nth-child(4) { /* Vencimento */
          white-space: nowrap;
        }
        
        td:nth-child(5) { /* Prioridade */
          white-space: nowrap;
        }
        
        td:nth-child(6) { /* Concluída */
          white-space: nowrap;
          text-align: center;
        }
        
        td:nth-child(7) { /* Projeto */
          white-space: nowrap;
        }
        
        td:nth-child(8) { /* Etiquetas */
          white-space: normal;
          line-height: 1.6;
        }
        
        td:nth-child(9) { /* Coluna */
          white-space: nowrap;
        }
        
        td:nth-child(10) { /* Pontos */
          white-space: nowrap;
        }
        
        td:nth-child(11) { /* Tempo Estimado */
          white-space: nowrap;
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
        
        /* Redimensionamento de colunas */
        .resizable-column {
          position: relative;
        }
        
        .column-resizer {
          position: absolute;
          top: 0;
          right: 0;
          width: 5px;
          height: 100%;
          cursor: col-resize;
          background: transparent;
          border-right: 2px solid transparent;
          user-select: none;
        }
        
        .column-resizer:hover {
          border-right-color: rgba(255, 255, 255, 0.5);
        }
        
        .column-resizer.resizing {
          border-right-color: rgba(255, 255, 255, 0.8);
        }
        
        /* Tooltip para título e descrição */
        .cell-tooltip {
          position: relative;
          cursor: help;
        }
        
        .cell-tooltip:hover::after {
          content: attr(data-full-text);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background-color: #1f2937;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          white-space: normal;
          max-width: 300px;
          word-wrap: break-word;
          z-index: 1000;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          pointer-events: none;
        }
        
        .cell-tooltip:hover::before {
          content: '';
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(100%);
          border: 5px solid transparent;
          border-top-color: #1f2937;
          z-index: 1001;
          pointer-events: none;
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
          
          .column-resizer {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${data.title}</h1>
          <div class="info">
            <p><strong>Período:</strong> ${formatDate(
              data.period.start
            )} a ${formatDate(data.period.end)}</p>
            <p><strong>Gerado em:</strong> ${new Date(
              data.generatedAt
            ).toLocaleString("pt-BR")}</p>
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
      
      <script>
        // Funcionalidade de redimensionamento de colunas
        document.addEventListener('DOMContentLoaded', function() {
          let isResizing = false;
          let currentColumn = null;
          let startX = 0;
          let startWidth = 0;
          
          // Adicionar event listeners para os redimensionadores
          const resizers = document.querySelectorAll('.column-resizer');
          
          resizers.forEach(resizer => {
            resizer.addEventListener('mousedown', function(e) {
              e.preventDefault();
              isResizing = true;
              currentColumn = this.parentElement;
              startX = e.clientX;
              startWidth = parseInt(window.getComputedStyle(currentColumn).width, 10);
              
              this.classList.add('resizing');
              document.body.style.cursor = 'col-resize';
              document.body.style.userSelect = 'none';
            });
          });
          
          document.addEventListener('mousemove', function(e) {
            if (!isResizing || !currentColumn) return;
            
            const width = startWidth + e.clientX - startX;
            const minWidth = 60;
            const maxWidth = 600;
            
            if (width >= minWidth && width <= maxWidth) {
              currentColumn.style.width = width + 'px';
              
              // Atualizar também as células da coluna
              const columnIndex = parseInt(currentColumn.dataset.column);
              const cells = document.querySelectorAll('td:nth-child(' + (columnIndex + 1) + ')');
              cells.forEach(cell => {
                cell.style.width = width + 'px';
              });
            }
          });
          
          document.addEventListener('mouseup', function() {
            if (isResizing) {
              isResizing = false;
              currentColumn = null;
              
              // Remover classes e estilos temporários
              const resizingElements = document.querySelectorAll('.resizing');
              resizingElements.forEach(el => el.classList.remove('resizing'));
              
              document.body.style.cursor = '';
              document.body.style.userSelect = '';
            }
          });
          
          // Prevenir seleção de texto durante o redimensionamento
          document.addEventListener('selectstart', function(e) {
            if (isResizing) {
              e.preventDefault();
            }
          });
        });
      </script>
    </body>
    </html>
  `;
}

export function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateFileName(type: string, format: string): string {
  const date = new Date().toISOString().split("T")[0];
  const reportName = type.charAt(0).toUpperCase() + type.slice(1);
  let extension = "html";

  if (format === "excel") {
    extension = "csv";
  }

  return `Relatorio_${reportName}_${date}.${extension}`;
}

export function triggerDownload(
  content: string,
  fileName: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
