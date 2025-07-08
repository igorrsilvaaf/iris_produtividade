import { sql } from "./supabase";
import prisma from './prisma';

export type Todo = {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: number;
  completed: boolean;
  created_at: string;
  updated_at: string | null;
  project_name?: string;
  project_color?: string;
  kanban_column?:
    | "backlog"
    | "planning"
    | "inProgress"
    | "validation"
    | "completed"
    | null;
  kanban_order?: number | null;
  points?: number;
  attachments?: any[];
  estimated_time?: number | null;
};

// Função auxiliar para verificar se uma tarefa é válida para hoje
// Considera data e horário para determinar se ainda não venceu
function isTaskValidForToday(task: any): boolean {
  if (!task.due_date) return false;
  
  const now = new Date();
  const taskDueDate = new Date(task.due_date);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Verifica se é para hoje (mesmo dia)
  const isToday = taskDueDate >= today && taskDueDate < tomorrow;
  
  // Verifica se o horário ainda não passou
  const notExpired = taskDueDate >= now;
  
  // Verifica se não está concluída
  const notCompleted = !task.completed;
  
  return isToday && notExpired && notCompleted;
}

export async function getTodayTasks(userId: number): Promise<Todo[]> {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.due_date IS NOT NULL
    AND t.due_date >= ${today.toISOString()}
    AND t.due_date < ${tomorrow.toISOString()}
    AND t.completed = false
    ORDER BY t.kanban_order ASC NULLS LAST, t.priority ASC, t.due_date ASC
  `;

  return tasks as Todo[];
}

export async function getInboxTasks(userId: number): Promise<Todo[]> {
  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.completed = false
    ORDER BY t.kanban_order ASC NULLS LAST, t.created_at DESC
  `;

  return tasks as Todo[];
}

export async function getCompletedTasks(userId: number): Promise<Todo[]> {
  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.completed = true
    ORDER BY t.kanban_order ASC NULLS LAST, t.updated_at DESC
    LIMIT 50
  `;

  return tasks as Todo[];
}

export async function createTask({
  userId,
  title,
  description,
  dueDate,
  priority = 4,
  projectId = null,
  kanbanColumn = null,
  kanbanOrder = null,
  points = 3,
  attachments = [],
  estimatedTime = null,
}: {
  userId: number;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority?: number;
  projectId?: number | null;
  kanbanColumn?: string | null;
  kanbanOrder?: number | null;
  points?: number;
  attachments?: any[];
  estimatedTime?: number | null;
}): Promise<Todo> {
  const now = new Date().toISOString();
  let normalizedDueDate = dueDate;
  
  if (dueDate) {
    try {
      const date = new Date(dueDate);
      if (!isNaN(date.getTime())) {
        normalizedDueDate = date.toISOString();
      }
    } catch (error) {
      normalizedDueDate = null;
    }
  }
  
  // Se não foi especificada uma coluna kanban, determinar baseado na data
  if (!kanbanColumn && normalizedDueDate) {
    const taskDate = new Date(normalizedDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Se a data é hoje
    if (taskDate >= today && taskDate < tomorrow) {
      kanbanColumn = "planning";
    } 
    // Se a data é futura
    else if (taskDate >= tomorrow) {
      kanbanColumn = "backlog";
    }
    // Se a data já passou
    else {
      kanbanColumn = "backlog";
    }
  }
  
  // Se ainda não tem coluna (sem data), vai para backlog
  if (!kanbanColumn) {
    kanbanColumn = "backlog";
  }

  let normalizedAttachments = [];
  try {
    if (Array.isArray(attachments)) {
      normalizedAttachments = attachments;
    } else if (typeof attachments === "string") {
      try {
        normalizedAttachments = JSON.parse(attachments);
      } catch (e) {
        normalizedAttachments = [];
      }
    }
  } catch (error) {
    normalizedAttachments = [];
  }

  const [task] = await sql`
    INSERT INTO todos (user_id, title, description, due_date, priority, created_at, kanban_column, kanban_order, points, attachments, estimated_time)
    VALUES (${userId}, ${title}, ${description}, ${normalizedDueDate}, ${priority}, ${now}, ${kanbanColumn}, ${kanbanOrder}, ${points}, ${JSON.stringify(normalizedAttachments)}, ${estimatedTime})
    RETURNING *
  `;

  if (projectId) {
    await sql`
      INSERT INTO todo_projects (todo_id, project_id)
      VALUES (${task.id}, ${projectId})
    `;
  }

  const taskWithParsedAttachments = {
    ...task,
    attachments: normalizedAttachments,
  };

  return taskWithParsedAttachments as Todo;
}

export async function updateTask(
  taskId: number,
  userId: number,
  updates: Partial<Todo>,
): Promise<Todo> {
  const now = new Date().toISOString();

  // Verificar se a tarefa existe e pertence ao usuário
  const existingTask = await sql`
    SELECT id, user_id FROM todos WHERE id = ${taskId} AND user_id = ${userId}
  `;

  if (existingTask.length === 0) {
    throw new Error("Task not found or not owned by user");
  }

  if (updates.due_date !== undefined) {
    try {
      if (updates.due_date !== null) {
        const date = new Date(updates.due_date);
        if (!isNaN(date.getTime())) {
          updates.due_date = date.toISOString();
        } else {
          updates.due_date = null;
        }
      }
    } catch (error) {
      updates.due_date = null;
    }
  }

  if (updates.attachments !== undefined) {
    // Garantir que attachments seja sempre um array válido antes de atualizar
    let normalizedAttachments = [];
    try {
      if (Array.isArray(updates.attachments)) {
        normalizedAttachments = updates.attachments;
      } else if (typeof updates.attachments === "string") {
        try {
          normalizedAttachments = JSON.parse(updates.attachments);
        } catch (e) {
          // Manter anexos atuais em caso de erro
          const currentTask = await getTaskById(taskId, userId);
          normalizedAttachments = currentTask?.attachments || [];
        }
      } else if (updates.attachments) {
        // Manter anexos atuais se formato inválido
        const currentTask = await getTaskById(taskId, userId);
        normalizedAttachments = currentTask?.attachments || [];
      }
    } catch (error) {
      // Manter anexos atuais em caso de erro
      const currentTask = await getTaskById(taskId, userId);
      normalizedAttachments = currentTask?.attachments || [];
    }

    updates.attachments = normalizedAttachments;
  }

  const [task] = await sql`
    UPDATE todos
    SET
      title = COALESCE(${updates.title}, title),
      description = COALESCE(${updates.description}, description),
      due_date = COALESCE(${updates.due_date}, due_date),
      priority = COALESCE(${updates.priority}, priority),
      completed = COALESCE(${updates.completed}, completed),
      kanban_column = COALESCE(${updates.kanban_column}, kanban_column),
      kanban_order = COALESCE(${updates.kanban_order}, kanban_order),
      points = COALESCE(${updates.points}, points),
      attachments = COALESCE(${updates.attachments !== undefined ? JSON.stringify(updates.attachments) : null}, attachments),
      estimated_time = COALESCE(${updates.estimated_time}, estimated_time),
      updated_at = ${now}
    WHERE id = ${taskId} AND user_id = ${userId}
    RETURNING *
  `;

  if (!task) {
    throw new Error("Failed to update task or task not found");
  }

  const taskWithParsedAttachments = {
    ...task,
    attachments:
      typeof task.attachments === "string"
        ? JSON.parse(task.attachments)
        : task.attachments || [],
  };

  return taskWithParsedAttachments as Todo;
}

export async function toggleTaskCompletion(
  taskId: number,
  userId: number,
): Promise<Todo> {
  const now = new Date().toISOString();

  // Primeiro verificar se a tarefa existe e pertence ao usuário
  const existingTask = await sql`
    SELECT id, user_id, completed FROM todos WHERE id = ${taskId} AND user_id = ${userId}
  `;

  if (existingTask.length === 0) {
    throw new Error("Task not found or not owned by user");
  }

  // Executar a atualização
  const [task] = await sql`
    UPDATE todos
    SET
      completed = NOT completed,
      updated_at = ${now}
    WHERE id = ${taskId} AND user_id = ${userId}
    RETURNING *
  `;

  if (!task) {
    throw new Error("Failed to update task completion status");
  }

  return task as Todo;
}

export async function deleteTask(
  taskId: number,
  userId: number,
): Promise<void> {
  
  try {
    // Primeiro verificar se a tarefa existe e pertence ao usuário
    const existingTask = await sql`
      SELECT id, user_id FROM todos WHERE id = ${taskId} AND user_id = ${userId}
    `;
    
    if (existingTask.length === 0) {
      throw new Error("Task not found or not owned by user");
    }
    
    // Deletar anexos relacionados
    await prisma.attachments.deleteMany({
      where: {
        entity_type: 'task',
        entity_id: taskId,
        user_id: userId
      }
    });
    
    // Deletar a tarefa
    const result = await sql`
      DELETE FROM todos
      WHERE id = ${taskId} AND user_id = ${userId}
    `;
    
  } catch (error) {
    throw error;
  }
}

export async function getTaskById(
  taskId: number,
  userId: number,
): Promise<Todo | null> {
  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.id = ${taskId} AND t.user_id = ${userId}
  `;

  if (tasks.length === 0) {
    return null;
  }

  const task = tasks[0] as Todo;

  // Buscar anexos da nova tabela
  try {
    const attachments = await prisma.attachments.findMany({
      where: {
        entity_type: 'task',
        entity_id: taskId,
        user_id: userId
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Converter anexos para o formato esperado pelo frontend
    task.attachments = attachments.map(att => ({
      id: att.id,
      type: att.mime_type.startsWith('image/') ? 'image' : 'file',
      url: att.file_path,
      name: att.file_name,
      size: Number(att.file_size)
    }));
  } catch (error) {
    console.error('Error fetching attachments:', error);
    task.attachments = [];
  }

  return task;
}

export async function getTaskProject(
  taskId: number,
  userId: number,
): Promise<number | null> {
  // Verificar primeiro se a tarefa pertence ao usuário
  const taskCheck = await sql`
    SELECT id FROM todos WHERE id = ${taskId} AND user_id = ${userId}
  `;

  // Se a tarefa não pertencer ao usuário, retorne null
  if (taskCheck.length === 0) {
    return null;
  }

  const projects = await sql`
    SELECT project_id
    FROM todo_projects
    WHERE todo_id = ${taskId}
  `;

  return projects.length > 0 ? projects[0].project_id : null;
}

export async function setTaskProject(
  taskId: number,
  userId: number,
  projectId: number | null,
): Promise<void> {
  if (!taskId || isNaN(taskId) || taskId <= 0) {
    throw new Error("Invalid task ID");
  }

  try {
    // Verificar primeiro se a tarefa pertence ao usuário
    const taskCheck = await sql`
      SELECT id FROM todos WHERE id = ${taskId} AND user_id = ${userId}
    `;

    // Se a tarefa não pertencer ao usuário, lançar erro
    if (taskCheck.length === 0) {
      throw new Error("Task not found or not owned by user");
    }

    await sql`
      DELETE FROM todo_projects
      WHERE todo_id = ${taskId}
    `;

    if (projectId !== null && projectId > 0) {
      await sql`
        INSERT INTO todo_projects (todo_id, project_id)
        VALUES (${taskId}, ${projectId})
      `;
    } else {
    }


  } catch (error) {
    console.error(`[setTaskProject] Erro ao definir projeto da tarefa:`, error);
    throw error;
  }
}

export async function getUpcomingTasks(userId: number): Promise<Todo[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Início do dia de hoje

  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.due_date IS NOT NULL
    AND t.due_date >= ${today.toISOString()}
    AND t.completed = false
    ORDER BY t.kanban_order ASC NULLS LAST, t.due_date ASC, t.priority ASC
  `;

  tasks.forEach((task: any) => {
;
  });

  return tasks as Todo[];
}

export async function searchTasks(
  userId: number,
  searchText: string,
): Promise<Todo[]> {
  if (!searchText || searchText.length < 2) {
    return [];
  }

  try {
    const normalizedSearchText = searchText.toLowerCase().trim();
    const pattern = `%${normalizedSearchText}%`;



    const userCheck =
      await sql`SELECT id FROM users WHERE id = ${userId} LIMIT 1`;
    if (userCheck.length === 0) {

      return [];
    }

    const taskCount =
      await sql`SELECT COUNT(*) as count FROM todos WHERE user_id = ${userId}`;


    const result = await sql`
      SELECT *
      FROM todos
      WHERE user_id = ${userId}
      AND (
        position(${normalizedSearchText} in LOWER(title)) > 0
        OR position(${normalizedSearchText} in LOWER(coalesce(description, ''))) > 0
      )
      ORDER BY completed ASC, priority ASC
      LIMIT 50
    `;



    if (result.length > 0) {
      for (const task of result) {
        const projectInfo = await sql`
          SELECT p.name, p.color
          FROM projects p
          JOIN todo_projects tp ON p.id = tp.project_id
          WHERE tp.todo_id = ${task.id}
          LIMIT 1
        `;

        if (projectInfo.length > 0) {
          task.project_name = projectInfo[0].name;
          task.project_color = projectInfo[0].color;
        }
      }
    }

    return result as Todo[];
  } catch (error) {
    console.error("[searchTasks] Erro:", error);
    return [];
  }
}

export async function getTasksForNotifications(
  userId: number,
  daysAhead: number = 3,
  ignoreReadStatus: boolean = false,
): Promise<{
  overdueCount: number;
  dueTodayCount: number;
  upcomingCount: number;
  overdueTasks: Todo[];
  dueTodayTasks: Todo[];
  upcomingTasks: Todo[];
}> {
  
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + daysAhead);

  // Tasks vencidas (overdue)
  const overdueTasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.due_date IS NOT NULL
    AND t.due_date < ${today.toISOString()}
    AND t.completed = false
    ORDER BY t.due_date ASC
  `;

  // Tasks para hoje (due today)
  const dueTodayTasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.due_date IS NOT NULL
    AND t.due_date >= ${today.toISOString()}
    AND t.due_date < ${tomorrow.toISOString()}
    AND t.completed = false
    ORDER BY t.due_date ASC
  `;

  // Tasks futuras (upcoming)
  const upcomingTasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.due_date IS NOT NULL
    AND t.due_date >= ${tomorrow.toISOString()}
    AND t.due_date < ${futureDate.toISOString()}
    AND t.completed = false
    ORDER BY t.due_date ASC
  `;

  const safeOverdueTasks = Array.isArray(overdueTasks) ? overdueTasks : [];
  const safeDueTodayTasks = Array.isArray(dueTodayTasks) ? dueTodayTasks : [];
  const safeUpcomingTasks = Array.isArray(upcomingTasks) ? upcomingTasks : [];

  return {
    overdueCount: safeOverdueTasks.length,
    dueTodayCount: safeDueTodayTasks.length,
    upcomingCount: safeUpcomingTasks.length,
    overdueTasks: safeOverdueTasks as Todo[],
    dueTodayTasks: safeDueTodayTasks as Todo[],
    upcomingTasks: safeUpcomingTasks as Todo[],
  };
}

export async function getAllTasksForUser(userId: number): Promise<Todo[]> {
  // Esta é uma representação da lógica que deve ser aplicada
  // na sua rota GET /api/tasks quando all=true
  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    ORDER BY
      CASE t.kanban_column
        WHEN 'backlog' THEN 1
        WHEN 'planning' THEN 2
        WHEN 'inProgress' THEN 3
        WHEN 'validation' THEN 4
        WHEN 'completed' THEN 5
        ELSE 6
      END,
      t.kanban_order ASC NULLS LAST,
      t.created_at DESC
  `;
  return tasks as Todo[];
}
