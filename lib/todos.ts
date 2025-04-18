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
}

export async function getTodayTasks(userId: number): Promise<Todo[]> {
  // Obter data atual no formato YYYY-MM-DD
  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];

  // Consulta usando CAST para ignorar a hora e considerar apenas a data
  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.due_date IS NOT NULL
    AND CAST(t.due_date AS DATE) = CURRENT_DATE
    AND t.completed = false
    ORDER BY t.priority ASC, t.due_date ASC
  `;

  console.log(`[getTodayTasks] Encontradas ${tasks.length} tarefas para hoje`);
  
  // Mostrar detalhes para debug
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
): Promise<Todo> {
  const now = new Date().toISOString()
  
  console.log(`[createTask] Criando tarefa para usuário ${userId}`)
  console.log(`[createTask] Título: ${title}`)
  console.log(`[createTask] Data de vencimento: ${dueDate}`)
  
  if (dueDate) {
    try {
      const date = new Date(dueDate)
      console.log(`[createTask] Data convertida: ${date.toString()}`)
      console.log(`[createTask] Horário: ${date.getHours()}:${date.getMinutes()}`)
    } catch (error) {
      console.error(`[createTask] Erro ao processar data: ${error}`)
    }
  }

  const [task] = await sql`
    INSERT INTO todos (user_id, title, description, due_date, priority, created_at)
    VALUES (${userId}, ${title}, ${description}, ${dueDate}, ${priority}, ${now})
    RETURNING *
  `

  if (projectId) {
    await sql`
      INSERT INTO todo_projects (todo_id, project_id)
      VALUES (${task.id}, ${projectId})
    `
  }
  
  console.log(`[createTask] Tarefa criada: ID=${task.id}, data=${task.due_date}`)
  
  return task as Todo
}

export async function updateTask(taskId: number, userId: number, updates: Partial<Todo>): Promise<Todo> {
  const now = new Date().toISOString()
  
  console.log(`[updateTask] Atualizando tarefa ${taskId} para usuário ${userId}`);
  
  // Diagnóstico de data
  if (updates.due_date !== undefined) {
    console.log(`[updateTask] Nova data: ${updates.due_date}`);
    try {
      if (updates.due_date !== null) {
        const date = new Date(updates.due_date);
        console.log(`[updateTask] Data convertida: ${date.toString()}`);
        console.log(`[updateTask] Horário: ${date.getHours()}:${date.getMinutes()}`);
        
        // Verificar se a data está em formato válido
        if (isNaN(date.getTime())) {
          console.error(`[updateTask] ERRO: Data inválida fornecida: ${updates.due_date}`);
        }
      } else {
        console.log(`[updateTask] Removendo data da tarefa`);
      }
    } catch (error) {
      console.error(`[updateTask] Erro ao processar data: ${error}`);
    }
  }

  const [task] = await sql`
    UPDATE todos
    SET
      title = COALESCE(${updates.title}, title),
      description = COALESCE(${updates.description}, description),
      due_date = COALESCE(${updates.due_date}, due_date),
      priority = COALESCE(${updates.priority}, priority),
      completed = COALESCE(${updates.completed}, completed),
      updated_at = ${now}
    WHERE id = ${taskId} AND user_id = ${userId}
    RETURNING *
  `
  
  console.log(`[updateTask] Tarefa atualizada: ID=${task.id}, nova data=${task.due_date}`);

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
    // First, remove any existing project association
    console.log(`[setTaskProject] Removendo associações existentes para taskId=${taskId}`);
    await sql`
      DELETE FROM todo_projects
      WHERE todo_id = ${taskId}
    `;
  
    // Then, if a project ID is provided, add the new association
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
  // Data e hora atual
  const now = new Date();
  const nowIsoString = now.toISOString();
  const todayDate = now.toISOString().split('T')[0];
  
  console.log(`[getUpcomingTasks] Buscando tarefas futuras a partir de ${nowIsoString}`);

  // Consulta usando CAST para tratar datas corretamente
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

  console.log(`[getUpcomingTasks] Encontradas ${tasks.length} tarefas futuras`);
  
  // Mostrar detalhes para debug
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
    // Normalize search text - garantir case insensitive
    const normalizedSearchText = searchText.toLowerCase().trim();
    // Criar padrão LIKE com % no início e fim para busca parcial
    const pattern = `%${normalizedSearchText}%`;
    
    console.log(`Buscando tarefas com padrão: "${pattern}"`);
    
    // Verificar se o usuário existe
    const userCheck = await sql`SELECT id FROM users WHERE id = ${userId} LIMIT 1`;
    if (userCheck.length === 0) {
      console.log(`Usuário com ID ${userId} não encontrado`);
      return [];
    }
    
    // Verificar se há tarefas para este usuário
    const taskCount = await sql`SELECT COUNT(*) as count FROM todos WHERE user_id = ${userId}`;
    console.log(`Total de tarefas do usuário: ${taskCount[0]?.count || 0}`);
    
    // Query para encontrar tarefas que correspondam - garantir LOWER nas colunas
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
    
    // Se encontramos resultados, buscar informações de projeto
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
    // Calcular datas relevantes
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    // Adicionar logs detalhados para depuração
    console.log("==== NOTIFICATION DATE DEBUGGING ====");
    console.log(`Current date: ${now.toISOString()}`);
    console.log(`Today (start): ${today.toISOString()}`);
    console.log(`Tomorrow (start): ${tomorrow.toISOString()}`);
    console.log(`Future date (based on daysAhead=${daysAhead}): ${futureDate.toISOString()}`);
    
    // Tarefas já vencidas (antes de hoje)
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
    
    // Tarefas que vencem hoje
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
    
    // Tarefas que vencem nos próximos dias (até o limite definido)
    // Corrigimos a consulta para garantir que recuperamos tarefas futuras
    // Mesmo quando daysAhead = 1 (que significa apenas incluir amanhã)
    let upcomingTasksQuery;
    
    if (daysAhead === 1) {
      // Quando daysAhead=1, queremos tarefas de amanhã
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
      // Para outros valores de daysAhead, usar o intervalo completo
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
    
    // Log detalhado para depuração
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

