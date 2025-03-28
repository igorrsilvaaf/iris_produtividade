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
  const today = new Date().toISOString().split("T")[0]

  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND (t.due_date IS NULL OR DATE(t.due_date) <= ${today})
    AND t.completed = false
    ORDER BY t.priority ASC, t.due_date ASC
  `

  return tasks
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

  return tasks
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

  return tasks
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

  return task
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

  return task
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

  return task
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

  return tasks.length > 0 ? tasks[0] : null
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
  // First, remove any existing project association
  await sql`
    DELETE FROM todo_projects
    WHERE todo_id = ${taskId}
  `

  // Then, if a project ID is provided, add the new association
  if (projectId) {
    await sql`
      INSERT INTO todo_projects (todo_id, project_id)
      VALUES (${taskId}, ${projectId})
    `
  }
}

export async function getUpcomingTasks(userId: number): Promise<Todo[]> {
  const today = new Date().toISOString().split("T")[0]

  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND t.due_date IS NOT NULL
    AND DATE(t.due_date) > ${today}
    AND t.completed = false
    ORDER BY t.due_date ASC, t.priority ASC
  `

  return tasks
}

export async function searchTasks(userId: number, query: string): Promise<Todo[]> {
  const searchQuery = `%${query}%`

  const tasks = await sql`
    SELECT t.*, p.name as project_name, p.color as project_color
    FROM todos t
    LEFT JOIN todo_projects tp ON t.id = tp.todo_id
    LEFT JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id = ${userId}
    AND (
      t.title ILIKE ${searchQuery}
      OR t.description ILIKE ${searchQuery}
    )
    ORDER BY t.completed ASC, t.due_date ASC, t.priority ASC
  `

  return tasks
}

