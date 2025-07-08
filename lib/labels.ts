import { sql, setCurrentUserId, sqlWithUser } from "./supabase"

export type Label = {
  id: number
  user_id: number
  name: string
  color: string
  created_at: string
}

export async function getLabels(userId: number): Promise<Label[]> {
  await setCurrentUserId(userId)
  
  const labels = await sql`
    SELECT * FROM labels
    WHERE user_id = ${userId}
    ORDER BY name ASC
  `

  return labels
}

export async function getLabel(labelId: number, userId: number): Promise<Label | null> {
  await setCurrentUserId(userId)
  
  const labels = await sql`
    SELECT * FROM labels
    WHERE id = ${labelId} AND user_id = ${userId}
  `

  return labels.length > 0 ? labels[0] : null
}

export async function createLabel(userId: number, name: string, color = "#808080"): Promise<Label> {
  await setCurrentUserId(userId)
  
  const [label] = await sql`
    INSERT INTO labels (user_id, name, color)
    VALUES (${userId}, ${name}, ${color})
    RETURNING *
  `

  return label
}

export async function updateLabel(labelId: number, userId: number, updates: Partial<Label>): Promise<Label> {
  await setCurrentUserId(userId)
  
  const [label] = await sql`
    UPDATE labels
    SET
      name = COALESCE(${updates.name}, name),
      color = COALESCE(${updates.color}, color)
    WHERE id = ${labelId} AND user_id = ${userId}
    RETURNING *
  `

  return label
}

export async function deleteLabel(labelId: number, userId: number): Promise<void> {
  await setCurrentUserId(userId)
  
  await sql`
    DELETE FROM labels
    WHERE id = ${labelId} AND user_id = ${userId}
  `
}

export async function getLabelTasks(labelId: number, userId: number): Promise<any[]> {
  await setCurrentUserId(userId)
  
  const tasks = await sql`
    SELECT t.* 
    FROM todos t
    JOIN todo_labels tl ON t.id = tl.todo_id
    WHERE tl.label_id = ${labelId} AND t.user_id = ${userId}
    ORDER BY t.completed ASC, t.priority ASC, t.due_date ASC
  `

  return tasks
}

export async function addLabelToTask(taskId: number, labelId: number): Promise<void> {
  await sql`
    INSERT INTO todo_labels (todo_id, label_id)
    VALUES (${taskId}, ${labelId})
    ON CONFLICT (todo_id, label_id) DO NOTHING
  `
}

export async function removeLabelFromTask(taskId: number, labelId: number): Promise<void> {
  await sql`
    DELETE FROM todo_labels
    WHERE todo_id = ${taskId} AND label_id = ${labelId}
  `
}

export async function getTaskLabels(taskId: number): Promise<Label[]> {
  const labels = await sql`
    SELECT l.* 
    FROM labels l
    JOIN todo_labels tl ON l.id = tl.label_id
    WHERE tl.todo_id = ${taskId}
    ORDER BY l.name ASC
  `

  return labels
}

