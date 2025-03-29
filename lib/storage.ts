import { neon } from "@neondatabase/serverless"
import type { Todo } from "./todos"
import type { Project } from "./projects"
import type { Label } from "./labels"
import type { UserSettings } from "./settings"

const sql = neon(process.env.DATABASE_URL!)

export class StorageService {
  // Métodos genéricos
  static async findById<T>(table: string, id: number, userId?: number): Promise<T | null> {
    try {
      const whereClause = userId ? `id = ${id} AND user_id = ${userId}` : `id = ${id}`
      const result = await sql`
        SELECT * FROM ${sql(table)} 
        WHERE ${sql(whereClause)}
        LIMIT 1
      `
      return result.length > 0 ? (result[0] as T) : null
    } catch (error) {
      console.error(`Error finding ${table} by ID:`, error)
      return null
    }
  }

  static async findAll<T>(
    table: string,
    userId?: number,
    options?: { orderBy?: string; limit?: number },
  ): Promise<T[]> {
    try {
      let query = `SELECT * FROM ${table}`

      if (userId) {
        query += ` WHERE user_id = ${userId}`
      }

      if (options?.orderBy) {
        query += ` ORDER BY ${options.orderBy}`
      }

      if (options?.limit) {
        query += ` LIMIT ${options.limit}`
      }

      const result = await sql.raw(query)
      return result.rows as T[]
    } catch (error) {
      console.error(`Error finding all ${table}:`, error)
      return []
    }
  }

  static async create<T>(table: string, data: Record<string, any>): Promise<T | null> {
    try {
      const keys = Object.keys(data)
      const values = Object.values(data)

      const columns = keys.join(", ")
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ")

      const query = `
        INSERT INTO ${table} (${columns})
        VALUES (${placeholders})
        RETURNING *
      `

      const result = await sql.raw(query, ...values)
      return result.rows[0] as T
    } catch (error) {
      console.error(`Error creating ${table}:`, error)
      return null
    }
  }

  static async update<T>(table: string, id: number, data: Record<string, any>, userId?: number): Promise<T | null> {
    try {
      const keys = Object.keys(data)
      const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ")

      let query = `
        UPDATE ${table}
        SET ${setClause}
        WHERE id = $${keys.length + 1}
      `

      if (userId) {
        query += ` AND user_id = $${keys.length + 2}`
      }

      query += " RETURNING *"

      const values = [...Object.values(data), id]
      if (userId) values.push(userId)

      const result = await sql.raw(query, ...values)
      return result.rows[0] as T
    } catch (error) {
      console.error(`Error updating ${table}:`, error)
      return null
    }
  }

  static async delete(table: string, id: number, userId?: number): Promise<boolean> {
    try {
      let query = `DELETE FROM ${table} WHERE id = $1`

      if (userId) {
        query += ` AND user_id = $2`
      }

      const values = userId ? [id, userId] : [id]
      await sql.raw(query, ...values)

      return true
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error)
      return false
    }
  }

  // Métodos específicos para tarefas
  static async getTasks(
    userId: number,
    filter: "today" | "upcoming" | "inbox" | "completed" | "all" = "all",
  ): Promise<Todo[]> {
    try {
      let whereClause = `t.user_id = ${userId}`

      if (filter === "today") {
        const today = new Date().toISOString().split("T")[0]
        whereClause += ` AND (t.due_date IS NULL OR DATE(t.due_date) <= '${today}') AND t.completed = false`
      } else if (filter === "upcoming") {
        const today = new Date().toISOString().split("T")[0]
        whereClause += ` AND t.due_date IS NOT NULL AND DATE(t.due_date) > '${today}' AND t.completed = false`
      } else if (filter === "inbox") {
        whereClause += ` AND t.completed = false`
      } else if (filter === "completed") {
        whereClause += ` AND t.completed = true`
      }

      const query = `
        SELECT t.*, p.name as project_name, p.color as project_color
        FROM todos t
        LEFT JOIN todo_projects tp ON t.id = tp.todo_id
        LEFT JOIN projects p ON tp.project_id = p.id
        WHERE ${whereClause}
        ORDER BY ${filter === "completed" ? "t.updated_at DESC" : "t.priority ASC, t.due_date ASC"}
        ${filter === "completed" ? "LIMIT 50" : ""}
      `

      const result = await sql.raw(query)
      return result.rows as Todo[]
    } catch (error) {
      console.error("Error getting tasks:", error)
      return []
    }
  }

  static async searchTasks(userId: number, searchQuery: string): Promise<Todo[]> {
    try {
      const query = `
        SELECT t.*, p.name as project_name, p.color as project_color
        FROM todos t
        LEFT JOIN todo_projects tp ON t.id = tp.todo_id
        LEFT JOIN projects p ON tp.project_id = p.id
        WHERE t.user_id = $1
        AND (
          t.title ILIKE $2
          OR t.description ILIKE $2
        )
        ORDER BY t.completed ASC, t.due_date ASC, t.priority ASC
      `

      const result = await sql.raw(query, userId, `%${searchQuery}%`)
      return result.rows as Todo[]
    } catch (error) {
      console.error("Error searching tasks:", error)
      return []
    }
  }

  // Métodos específicos para projetos
  static async getProjectWithTasks(
    projectId: number,
    userId: number,
  ): Promise<{ project: Project; tasks: Todo[] } | null> {
    try {
      const projectQuery = `
        SELECT * FROM projects
        WHERE id = $1 AND user_id = $2
      `

      const tasksQuery = `
        SELECT t.*, p.name as project_name, p.color as project_color
        FROM todos t
        JOIN todo_projects tp ON t.id = tp.todo_id
        JOIN projects p ON tp.project_id = p.id
        WHERE tp.project_id = $1 AND t.user_id = $2
        ORDER BY t.completed ASC, t.priority ASC, t.due_date ASC
      `

      const projectResult = await sql.raw(projectQuery, projectId, userId)

      if (projectResult.rows.length === 0) {
        return null
      }

      const tasksResult = await sql.raw(tasksQuery, projectId, userId)

      return {
        project: projectResult.rows[0] as Project,
        tasks: tasksResult.rows as Todo[],
      }
    } catch (error) {
      console.error("Error getting project with tasks:", error)
      return null
    }
  }

  // Métodos específicos para etiquetas
  static async getLabelWithTasks(labelId: number, userId: number): Promise<{ label: Label; tasks: Todo[] } | null> {
    try {
      const labelQuery = `
        SELECT * FROM labels
        WHERE id = $1 AND user_id = $2
      `

      const tasksQuery = `
        SELECT t.*, p.name as project_name, p.color as project_color
        FROM todos t
        JOIN todo_labels tl ON t.id = tl.todo_id
        LEFT JOIN todo_projects tp ON t.id = tp.todo_id
        LEFT JOIN projects p ON tp.project_id = p.id
        WHERE tl.label_id = $1 AND t.user_id = $2
        ORDER BY t.completed ASC, t.priority ASC, t.due_date ASC
      `

      const labelResult = await sql.raw(labelQuery, labelId, userId)

      if (labelResult.rows.length === 0) {
        return null
      }

      const tasksResult = await sql.raw(tasksQuery, labelId, userId)

      return {
        label: labelResult.rows[0] as Label,
        tasks: tasksResult.rows as Todo[],
      }
    } catch (error) {
      console.error("Error getting label with tasks:", error)
      return null
    }
  }

  // Métodos para backup e restauração
  static async exportUserData(userId: number): Promise<{
    tasks: Todo[]
    projects: Project[]
    labels: Label[]
    settings: UserSettings
  }> {
    try {
      const tasks = await this.getTasks(userId, "all")
      const projects = await this.findAll<Project>("projects", userId, { orderBy: "name ASC" })
      const labels = await this.findAll<Label>("labels", userId, { orderBy: "name ASC" })

      const settingsResult = await sql`
        SELECT * FROM user_settings
        WHERE user_id = ${userId}
      `

      const settings = settingsResult.length > 0 ? (settingsResult[0] as UserSettings) : null

      return {
        tasks,
        projects,
        labels,
        settings,
      }
    } catch (error) {
      console.error("Error exporting user data:", error)
      throw new Error("Failed to export user data")
    }
  }

  static async importUserData(
    userId: number,
    data: {
      tasks?: Todo[]
      projects?: Project[]
      labels?: Label[]
      settings?: UserSettings
    },
  ): Promise<boolean> {
    try {
      // Implementação da importação de dados
      // Esta é uma operação complexa que requer transações e mapeamento de IDs
      // Aqui está uma implementação simplificada

      // Importar projetos
      if (data.projects && data.projects.length > 0) {
        for (const project of data.projects) {
          await sql`
            INSERT INTO projects (user_id, name, color, is_favorite)
            VALUES (${userId}, ${project.name}, ${project.color}, ${project.is_favorite})
            ON CONFLICT (user_id, name) DO NOTHING
          `
        }
      }

      // Importar etiquetas
      if (data.labels && data.labels.length > 0) {
        for (const label of data.labels) {
          await sql`
            INSERT INTO labels (user_id, name, color)
            VALUES (${userId}, ${label.name}, ${label.color})
            ON CONFLICT (user_id, name) DO NOTHING
          `
        }
      }

      // Importar configurações
      if (data.settings) {
        await sql`
          UPDATE user_settings
          SET 
            theme = ${data.settings.theme},
            pomodoro_work_minutes = ${data.settings.pomodoro_work_minutes},
            pomodoro_break_minutes = ${data.settings.pomodoro_break_minutes},
            pomodoro_long_break_minutes = ${data.settings.pomodoro_long_break_minutes},
            pomodoro_cycles = ${data.settings.pomodoro_cycles},
            enable_sound = ${data.settings.enable_sound},
            notification_sound = ${data.settings.notification_sound},
            enable_desktop_notifications = ${data.settings.enable_desktop_notifications}
          WHERE user_id = ${userId}
        `
      }

      return true
    } catch (error) {
      console.error("Error importing user data:", error)
      return false
    }
  }
}

