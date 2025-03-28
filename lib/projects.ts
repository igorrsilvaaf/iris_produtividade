import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export type Project = {
  id: number
  user_id: number
  name: string
  color: string
  is_favorite: boolean
  created_at: string
}

export async function getProjects(userId: number): Promise<Project[]> {
  const projects = await sql`
    SELECT * FROM projects
    WHERE user_id = ${userId}
    ORDER BY is_favorite DESC, name ASC
  `

  return projects
}

export async function getProject(projectId: number, userId: number): Promise<Project | null> {
  const projects = await sql`
    SELECT * FROM projects
    WHERE id = ${projectId} AND user_id = ${userId}
  `

  return projects.length > 0 ? projects[0] : null
}

export async function createProject(
  userId: number,
  name: string,
  color = "#808080",
  isFavorite = false,
): Promise<Project> {
  const [project] = await sql`
    INSERT INTO projects (user_id, name, color, is_favorite)
    VALUES (${userId}, ${name}, ${color}, ${isFavorite})
    RETURNING *
  `

  return project
}

export async function updateProject(projectId: number, userId: number, updates: Partial<Project>): Promise<Project> {
  const [project] = await sql`
    UPDATE projects
    SET
      name = COALESCE(${updates.name}, name),
      color = COALESCE(${updates.color}, color),
      is_favorite = COALESCE(${updates.is_favorite}, is_favorite)
    WHERE id = ${projectId} AND user_id = ${userId}
    RETURNING *
  `

  return project
}

export async function deleteProject(projectId: number, userId: number): Promise<void> {
  await sql`
    DELETE FROM projects
    WHERE id = ${projectId} AND user_id = ${userId}
  `
}

export async function toggleProjectFavorite(projectId: number, userId: number): Promise<Project> {
  const [project] = await sql`
    UPDATE projects
    SET is_favorite = NOT is_favorite
    WHERE id = ${projectId} AND user_id = ${userId}
    RETURNING *
  `

  return project
}

export async function getProjectTasks(projectId: number, userId: number): Promise<any[]> {
  const tasks = await sql`
    SELECT t.* 
    FROM todos t
    JOIN todo_projects tp ON t.id = tp.todo_id
    WHERE tp.project_id = ${projectId} AND t.user_id = ${userId}
    ORDER BY t.completed ASC, t.priority ASC, t.due_date ASC
  `

  return tasks
}

