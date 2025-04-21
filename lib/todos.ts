import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export type Todo = {
  id: number
  title: string
  description: string | null
  due_date: string | null
  priority: number
  completed: boolean
  created_at: string
  updated_at: string | null
  project_name?: string
  project_color?: string
  kanban_column?: "backlog" | "planning" | "inProgress" | "validation" | "completed" | null
  points?: number
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
    ORDER BY t.priority ASC, t.due_date ASC
  `;
  
  tasks.forEach((task: any) => {
    console.log(`[getTodayTasks] ID: ${task.id}, Título: ${task.title}, Data: ${task.due_date}`);
  });
  
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
    ORDER BY t.created_at DESC
  `

  return tasks as Todo[]
}

export async function getCompletedTasks(userId: number): Promise<Todo[]> {
  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.completed = true
    ORDER BY t.updated_at DESC
    LIMIT 50
  `

  return tasks as Todo[]
}

export async function createTask(
  userId: number,
  title: string,
  description: string | null = null,
  dueDate: string | null = null,
  priority = 4,
  projectId: number | null = null,
  kanbanColumn: "backlog" | "planning" | "inProgress" | "validation" | "completed" | null = null,
  points: number = 3,
): Promise<Todo> {
  const now = new Date().toISOString()
  
  console.log(`[createTask] Iniciando criação da tarefa: "${title}"`);
  console.log(`[createTask] Data fornecida: ${dueDate}`);
  console.log(`[createTask] Project ID: ${projectId}`);
  
  let normalizedDueDate = dueDate;
  if (dueDate) {
    try {
      const date = new Date(dueDate);
      if (!isNaN(date.getTime())) {
        date.setHours(23, 59, 59, 999);
        normalizedDueDate = date.toISOString();
        console.log(`[createTask] Data normalizada: ${normalizedDueDate}`);
      } else {
        console.error(`[createTask] ERRO: Data inválida fornecida: ${dueDate}`);
      }
    } catch (error) {
      console.error(`[createTask] Erro ao processar data: ${error}`);
    }
  } else {
    console.log(`[createTask] Nenhuma data fornecida.`);
  }

  console.log(`[createTask] Inserindo tarefa com data: ${normalizedDueDate}`);

  const [task] = await sql`
    INSERT INTO todos (user_id, title, description, due_date, priority, created_at, kanban_column, points)
    VALUES (${userId}, ${title}, ${description}, ${normalizedDueDate}, ${priority}, ${now}, ${kanbanColumn}, ${points})
    RETURNING *
  `

  if (projectId) {
    await sql`
      INSERT INTO todo_projects (todo_id, project_id)
      VALUES (${task.id}, ${projectId})
    `
  }
  
  console.log(`[createTask] Tarefa criada: ID=${task.id}, data=${task.due_date}, coluna=${task.kanban_column}, pontos=${task.points}`)
  
  return task as Todo
}

export async function updateTask(taskId: number, userId: number, updates: Partial<Todo>): Promise<Todo> {
  const now = new Date().toISOString()
  
  if (updates.due_date !== undefined) {
    console.log(`[updateTask] Data original: ${updates.due_date}`);
    try {
      if (updates.due_date !== null) {
        const date = new Date(updates.due_date);
        if (!isNaN(date.getTime())) {
          date.setHours(23, 59, 59, 999);
          updates.due_date = date.toISOString();
          console.log(`[updateTask] Data normalizada: ${updates.due_date}`);
        } else {
          console.error(`[updateTask] ERRO: Data inválida fornecida: ${updates.due_date}`);
        }
      } else {
        console.log(`[updateTask] Removendo data da tarefa`);
      }
    } catch (error) {
      console.error(`[updateTask] Erro ao processar data: ${error}`);
    }
  }

  if (updates.kanban_column !== undefined) {
    console.log(`[updateTask] Atualizando coluna Kanban: ${updates.kanban_column}`);
  }

  if (updates.points !== undefined) {
    console.log(`[updateTask] Atualizando pontos: ${updates.points}`);
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
      points = COALESCE(${updates.points}, points),
      updated_at = ${now}
    WHERE id = ${taskId} AND user_id = ${userId}
    RETURNING *
  `
  
  console.log(`[updateTask] Tarefa atualizada: ID=${task.id}, nova data=${task.due_date}, coluna=${task.kanban_column}, pontos=${task.points}`);

  return task as Todo
}

export async function toggleTaskCompletion(taskId: number, userId: number): Promise<Todo> {
  const now = new Date().toISOString()

  const [task] = await sql`
    UPDATE todos
    SET
      completed = NOT completed,
      updated_at = ${now}
    WHERE id = ${taskId} AND user_id = ${userId}
    RETURNING *
  `

  return task as Todo
}

export async function deleteTask(taskId: number, userId: number): Promise<void> {
  await sql`
    DELETE FROM todos
    WHERE id = ${taskId} AND user_id = ${userId}
  `
}

export async function getTaskById(taskId: number, userId: number): Promise<Todo | null> {
  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.id = ${taskId} AND t.user_id = ${userId}
  `

  return tasks.length > 0 ? tasks[0] as Todo : null
}

export async function getTaskProject(taskId: number): Promise<number | null> {
  const projects = await sql`
    SELECT project_id
    FROM todo_projects
    WHERE todo_id = ${taskId}
  `

  return projects.length > 0 ? projects[0].project_id : null
}

export async function setTaskProject(taskId: number, projectId: number | null): Promise<void> {
  console.log(`[setTaskProject] Iniciando com taskId=${taskId}, projectId=${projectId}`);
  
  if (!taskId || isNaN(taskId) || taskId <= 0) {
    console.error(`[setTaskProject] ID de tarefa inválido: ${taskId}`);
    throw new Error("Invalid task ID");
  }
  
  try {
    console.log(`[setTaskProject] Removendo associações existentes para taskId=${taskId}`);
    await sql`
      DELETE FROM todo_projects
      WHERE todo_id = ${taskId}
    `;
  
    if (projectId !== null && projectId > 0) {
      console.log(`[setTaskProject] Adicionando nova associação: taskId=${taskId}, projectId=${projectId}`);
      await sql`
        INSERT INTO todo_projects (todo_id, project_id)
        VALUES (${taskId}, ${projectId})
      `;
    } else {
      console.log(`[setTaskProject] Nenhum projectId válido fornecido (${projectId}), apenas removendo associações existentes`);
    }
    
    console.log(`[setTaskProject] Concluído com sucesso para taskId=${taskId}`);
  } catch (error) {
    console.error(`[setTaskProject] Erro ao definir projeto da tarefa:`, error);
    throw error;
  }
}

export async function getUpcomingTasks(userId: number): Promise<Todo[]> {
  const now = new Date();
  const nowIsoString = now.toISOString();
  const todayDate = now.toISOString().split('T')[0];

  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.due_date IS NOT NULL
    AND (
      -- Tarefas de hoje com horário futuro
      (CAST(t.due_date AS DATE) = CAST(${todayDate} AS DATE) AND t.due_date > ${nowIsoString})
      -- OU tarefas de dias futuros
      OR CAST(t.due_date AS DATE) > CAST(${todayDate} AS DATE)
    )
    AND t.completed = false
    ORDER BY t.due_date ASC, t.priority ASC
  `;

  
  tasks.forEach((task: any) => {
    console.log(`[getUpcomingTasks] ID: ${task.id}, Título: ${task.title}, Data: ${task.due_date}`);
  });
  
  return tasks as Todo[];
}

export async function searchTasks(userId: number, searchText: string): Promise<Todo[]> {
  if (!searchText || searchText.length < 2) {
    return [];
  }

  try {
    const normalizedSearchText = searchText.toLowerCase().trim();
    const pattern = `%${normalizedSearchText}%`;
    
    console.log(`Buscando tarefas com padrão: "${pattern}"`);
    
    const userCheck = await sql`SELECT id FROM users WHERE id = ${userId} LIMIT 1`;
    if (userCheck.length === 0) {
      console.log(`Usuário com ID ${userId} não encontrado`);
      return [];
    }
    
    const taskCount = await sql`SELECT COUNT(*) as count FROM todos WHERE user_id = ${userId}`;
    console.log(`Total de tarefas do usuário: ${taskCount[0]?.count || 0}`);
    
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
    
    console.log(`Resultados encontrados: ${result.length}`);
    
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
    console.error('[searchTasks] Erro:', error);
    return [];
  }
}

export async function getTasksForNotifications(userId: number, daysAhead: number = 3, ignoreReadStatus: boolean = false): Promise<{
  overdueCount: number,
  dueTodayCount: number,
  upcomingCount: number,
  overdueTasks: Todo[],
  dueTodayTasks: Todo[],
  upcomingTasks: Todo[]
}> {
  try {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    const overdueTasks = await sql`
      SELECT t.*, p.name as project_name, p.color as project_color
      FROM todos t
      LEFT JOIN todo_projects tp ON t.id = tp.todo_id
      LEFT JOIN projects p ON tp.project_id = p.id
      WHERE t.user_id = ${userId}
      AND t.due_date IS NOT NULL
      AND t.due_date < ${today.toISOString()}
      AND t.completed = false
      ORDER BY t.due_date ASC, t.priority ASC
      LIMIT 10
    `;
    
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
      ORDER BY t.due_date ASC, t.priority ASC
      LIMIT 10
    `;
    
    let upcomingTasksQuery;
    
    if (daysAhead === 1) {
      upcomingTasksQuery = await sql`
        SELECT t.*, p.name as project_name, p.color as project_color
        FROM todos t
        LEFT JOIN todo_projects tp ON t.id = tp.todo_id
        LEFT JOIN projects p ON tp.project_id = p.id
        WHERE t.user_id = ${userId}
        AND t.due_date IS NOT NULL
        AND CAST(t.due_date AS DATE) = CAST(${tomorrow.toISOString()} AS DATE)
        AND t.completed = false
        ORDER BY t.due_date ASC, t.priority ASC
        LIMIT 10
      `;
    } else {
      upcomingTasksQuery = await sql`
        SELECT t.*, p.name as project_name, p.color as project_color
        FROM todos t
        LEFT JOIN todo_projects tp ON t.id = tp.todo_id
        LEFT JOIN projects p ON tp.project_id = p.id
        WHERE t.user_id = ${userId}
        AND t.due_date IS NOT NULL
        AND t.due_date >= ${tomorrow.toISOString()}
        AND t.due_date < ${futureDate.toISOString()}
        AND t.completed = false
        ORDER BY t.due_date ASC, t.priority ASC
        LIMIT 10
      `;
    }
    
    const upcomingTasks = upcomingTasksQuery;
    
    console.log(`Overdue tasks found: ${overdueTasks.length}`);
    console.log(`Due today tasks found: ${dueTodayTasks.length}`);
    console.log(`Upcoming tasks found: ${upcomingTasks.length}`);
    
    overdueTasks.forEach((task: any) => {
      console.log(`Overdue task: ${task.title}, due: ${task.due_date}`);
    });
    
    dueTodayTasks.forEach((task: any) => {
      console.log(`Today task: ${task.title}, due: ${task.due_date}`);
    });
    
    upcomingTasks.forEach((task: any) => {
      console.log(`Upcoming task: ${task.title}, due: ${task.due_date}`);
    });
    
    return {
      overdueCount: overdueTasks.length,
      dueTodayCount: dueTodayTasks.length,
      upcomingCount: upcomingTasks.length,
      overdueTasks: overdueTasks as Todo[],
      dueTodayTasks: dueTodayTasks as Todo[],
      upcomingTasks: upcomingTasks as Todo[]
    };
  } catch (error) {
    console.error("Error fetching tasks for notifications:", error);
    return {
      overdueCount: 0,
      dueTodayCount: 0,
      upcomingCount: 0,
      overdueTasks: [],
      dueTodayTasks: [],
      upcomingTasks: []
    };
  }
}

