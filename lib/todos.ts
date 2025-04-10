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
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.due_date IS NOT NULL
    AND t.due_date >= ${startOfDay.toISOString()}
    AND t.due_date <= ${endOfDay.toISOString()}
    AND t.completed = false
    ORDER BY t.priority ASC, t.due_date ASC
  `

  return tasks as Todo[]
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

  return task as Todo
}

export async function updateTask(taskId: number, userId: number, updates: Partial<Todo>): Promise<Todo> {
  const now = new Date().toISOString()

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
  const now = new Date().toISOString()

  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.due_date IS NOT NULL
    AND t.due_date > ${now}
    AND t.completed = false
    ORDER BY t.due_date ASC, t.priority ASC
  `

  return tasks as Todo[]
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

