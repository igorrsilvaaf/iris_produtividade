import prisma from "./prisma"
import type { Todo } from "./todos"
import type { Project } from "./projects"
import type { Label } from "./labels"
import type { UserSettings } from "./settings"

export class StorageService {
  // Métodos genéricos usando Prisma Client
  static async findById<T>(table: string, id: number, userId?: number): Promise<T | null> {
    try {
      // Esta função agora é mais para manter compatibilidade
      // Prefira usar funções específicas do Prisma para cada modelo
      return null
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
      // Esta função agora é mais para manter compatibilidade
      // Prefira usar funções específicas do Prisma para cada modelo
      return []
    } catch (error) {
      console.error(`Error finding all ${table}:`, error)
      return []
    }
  }

  static async create<T>(
    table: string,
    data: any,
    userId?: number,
  ): Promise<T | null> {
    try {
      // Esta função agora é mais para manter compatibilidade
      // Prefira usar funções específicas do Prisma para cada modelo
      return null
    } catch (error) {
      console.error(`Error creating ${table}:`, error)
      return null
    }
  }

  static async update<T>(
    table: string,
    id: number,
    data: any,
    userId?: number,
  ): Promise<T | null> {
    try {
      // Esta função agora é mais para manter compatibilidade
      // Prefira usar funções específicas do Prisma para cada modelo
      return null
    } catch (error) {
      console.error(`Error updating ${table}:`, error)
      return null
    }
  }

  static async delete(
    table: string,
    id: number,
    userId?: number,
  ): Promise<boolean> {
    try {
      // Esta função agora é mais para manter compatibilidade
      // Prefira usar funções específicas do Prisma para cada modelo
      return false
    } catch (error) {
      console.error(`Error deleting ${table}:`, error)
      return false
    }
  }

  // Métodos específicos para tarefas
  static async getTasks(
    userId: number,
    filter: "today" | "upcoming" | "inbox" | "completed" | "all" = "all",
  ): Promise<Todo[]> {
    try {
      let whereClause: any = { user_id: userId }

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (filter === "today") {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        whereClause = {
          ...whereClause,
          due_date: {
            gte: today,
            lt: tomorrow
          },
          completed: false
        }
      } else if (filter === "upcoming") {
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        whereClause = {
          ...whereClause,
          due_date: {
            not: null,
            gte: tomorrow
          },
          completed: false
        }
      } else if (filter === "inbox") {
        whereClause = {
          ...whereClause,
          completed: false
        }
      } else if (filter === "completed") {
        whereClause = {
          ...whereClause,
          completed: true
        }
      }

      const tasks = await prisma.todos.findMany({
        where: whereClause,
        include: {
          todo_projects: {
            include: {
              projects: true
            }
          }
        },
        orderBy: filter === "completed" 
          ? [{ updated_at: 'desc' }]
          : [{ priority: 'asc' }, { due_date: 'asc' }],
        ...(filter === "completed" && { take: 50 })
      })

      return tasks.map(task => ({
        ...task,
        created_at: task.created_at.toISOString(),
        updated_at: task.updated_at?.toISOString() || null,
        due_date: task.due_date?.toISOString() || null,
        project_name: task.todo_projects[0]?.projects?.name || undefined,
        project_color: task.todo_projects[0]?.projects?.color || undefined,
        attachments: task.attachments as any[]
      }))
    } catch (error) {
      console.error("Error getting tasks:", error)
      return []
    }
  }

  static async searchTasks(userId: number, searchQuery: string): Promise<Todo[]> {
    try {
      const tasks = await prisma.todos.findMany({
        where: {
          user_id: userId,
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        include: {
          todo_projects: {
            include: {
              projects: true
            }
          }
        },
        orderBy: [
          { completed: 'asc' },
          { due_date: 'asc' },
          { priority: 'asc' }
        ]
      })

      return tasks.map(task => ({
        ...task,
        created_at: task.created_at.toISOString(),
        updated_at: task.updated_at?.toISOString() || null,
        due_date: task.due_date?.toISOString() || null,
        project_name: task.todo_projects[0]?.projects?.name || undefined,
        project_color: task.todo_projects[0]?.projects?.color || undefined,
        attachments: task.attachments as any[]
      }))
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
      const project = await prisma.projects.findFirst({
        where: {
          id: projectId,
          user_id: userId
        }
      })

      if (!project) {
        return null
      }

      const tasks = await prisma.todos.findMany({
        where: {
          user_id: userId,
          todo_projects: {
            some: {
              project_id: projectId
            }
          }
        },
        include: {
          todo_projects: {
            include: {
              projects: true
            }
          }
        },
        orderBy: [
          { completed: 'asc' },
          { priority: 'asc' },
          { due_date: 'asc' }
        ]
      })

      return {
        project: {
          ...project,
          created_at: project.created_at.toISOString(),
          color: project.color || "#808080",
          is_favorite: project.is_favorite || false
        },
        tasks: tasks.map(task => ({
          ...task,
          created_at: task.created_at.toISOString(),
          updated_at: task.updated_at?.toISOString() || null,
          due_date: task.due_date?.toISOString() || null,
          project_name: task.todo_projects[0]?.projects?.name || undefined,
          project_color: task.todo_projects[0]?.projects?.color || undefined,
          attachments: task.attachments as any[]
        }))
      }
    } catch (error) {
      console.error("Error getting project with tasks:", error)
      return null
    }
  }

  // Métodos específicos para etiquetas
  static async getLabelWithTasks(labelId: number, userId: number): Promise<{ label: Label; tasks: Todo[] } | null> {
    try {
      const label = await prisma.labels.findFirst({
        where: {
          id: labelId,
          user_id: userId
        }
      })

      if (!label) {
        return null
      }

      const tasks = await prisma.todos.findMany({
        where: {
          user_id: userId,
          todo_labels: {
            some: {
              label_id: labelId
            }
          }
        },
        include: {
          todo_projects: {
            include: {
              projects: true
            }
          }
        },
        orderBy: [
          { completed: 'asc' },
          { priority: 'asc' },
          { due_date: 'asc' }
        ]
      })

      return {
        label: {
          ...label,
          created_at: label.created_at.toISOString(),
          color: label.color || "#808080"
        },
        tasks: tasks.map(task => ({
          ...task,
          created_at: task.created_at.toISOString(),
          updated_at: task.updated_at?.toISOString() || null,
          due_date: task.due_date?.toISOString() || null,
          project_name: task.todo_projects[0]?.projects?.name || undefined,
          project_color: task.todo_projects[0]?.projects?.color || undefined,
          attachments: task.attachments as any[]
        }))
      }
    } catch (error) {
      console.error("Error getting label with tasks:", error)
      return null
    }
  }

  // Métodos para backup e exportação
  static async exportUserData(
    userId: number,
  ): Promise<{
    tasks: Todo[]
    projects: Project[]
    labels: Label[]
    settings: UserSettings | null
  }> {
    try {
      const tasks = await this.getTasks(userId, "all")
      
      const projects = await prisma.projects.findMany({
        where: { user_id: userId },
        orderBy: { name: 'asc' }
      })

      const labels = await prisma.labels.findMany({
        where: { user_id: userId },
        orderBy: { name: 'asc' }
      })

      const settings = await prisma.user_settings.findUnique({
        where: { user_id: userId }
      })

      return {
        tasks,
        projects: projects.map(p => ({
          ...p,
          created_at: p.created_at.toISOString(),
          color: p.color || "#808080",
          is_favorite: p.is_favorite || false
        })),
        labels: labels.map(l => ({
          ...l,
          created_at: l.created_at.toISOString(),
          color: l.color || "#808080"
        })),
        settings: settings ? {
          theme: settings.theme || "system",
          language: settings.language || "pt",
          pomodoro_work_minutes: settings.pomodoro_work_minutes || 25,
          pomodoro_break_minutes: settings.pomodoro_break_minutes || 5,
          pomodoro_long_break_minutes: settings.pomodoro_long_break_minutes || 15,
          pomodoro_cycles: settings.pomodoro_cycles || 4,
          enable_sound: settings.enable_sound ?? true,
          notification_sound: settings.notification_sound || "default",
          pomodoro_sound: settings.pomodoro_sound || "pomodoro",
          enable_desktop_notifications: settings.enable_desktop_notifications ?? true,
          enable_task_notifications: settings.enable_task_notifications ?? true,
          task_notification_days: settings.task_notification_days || 3,
          enable_spotify: settings.enable_spotify ?? true,
          spotify_playlist_url: settings.spotify_playlist_url || null,
          enable_flip_clock: settings.enable_flip_clock ?? true,
          flip_clock_size: settings.flip_clock_size || "medium",
          flip_clock_color: settings.flip_clock_color || "#ff5722"
        } : null
      }
    } catch (error) {
      console.error("Error exporting user data:", error)
      return {
        tasks: [],
        projects: [],
        labels: [],
        settings: null
      }
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
      // Importar projetos
      if (data.projects && data.projects.length > 0) {
        for (const project of data.projects) {
          await prisma.projects.upsert({
            where: {
              id: project.id || 0
            },
            update: {},
            create: {
              user_id: userId,
              name: project.name,
              color: project.color || "#808080",
              is_favorite: project.is_favorite || false
            }
          })
        }
      }

      // Importar etiquetas
      if (data.labels && data.labels.length > 0) {
        for (const label of data.labels) {
          await prisma.labels.upsert({
            where: {
              id: label.id || 0
            },
            update: {},
            create: {
              user_id: userId,
              name: label.name,
              color: label.color || "#808080"
            }
          })
        }
      }

      // Importar configurações
      if (data.settings) {
        await prisma.user_settings.upsert({
          where: { user_id: userId },
          update: {
            theme: data.settings.theme,
            language: data.settings.language,
            pomodoro_work_minutes: data.settings.pomodoro_work_minutes,
            pomodoro_break_minutes: data.settings.pomodoro_break_minutes,
            pomodoro_long_break_minutes: data.settings.pomodoro_long_break_minutes,
            pomodoro_cycles: data.settings.pomodoro_cycles,
            enable_sound: data.settings.enable_sound,
            notification_sound: data.settings.notification_sound,
            pomodoro_sound: data.settings.pomodoro_sound,
            enable_desktop_notifications: data.settings.enable_desktop_notifications,
            enable_task_notifications: data.settings.enable_task_notifications,
            task_notification_days: data.settings.task_notification_days,
            enable_spotify: data.settings.enable_spotify,
            spotify_playlist_url: data.settings.spotify_playlist_url,
            enable_flip_clock: data.settings.enable_flip_clock,
            flip_clock_size: data.settings.flip_clock_size,
            flip_clock_color: data.settings.flip_clock_color
          },
          create: {
            user_id: userId,
            theme: data.settings.theme || "system",
            language: data.settings.language || "pt",
            pomodoro_work_minutes: data.settings.pomodoro_work_minutes || 25,
            pomodoro_break_minutes: data.settings.pomodoro_break_minutes || 5,
            pomodoro_long_break_minutes: data.settings.pomodoro_long_break_minutes || 15,
            pomodoro_cycles: data.settings.pomodoro_cycles || 4,
            enable_sound: data.settings.enable_sound ?? true,
            notification_sound: data.settings.notification_sound || "default",
            pomodoro_sound: data.settings.pomodoro_sound || "pomodoro",
            enable_desktop_notifications: data.settings.enable_desktop_notifications ?? true,
            enable_task_notifications: data.settings.enable_task_notifications ?? true,
            task_notification_days: data.settings.task_notification_days || 3,
            enable_spotify: data.settings.enable_spotify ?? true,
            spotify_playlist_url: data.settings.spotify_playlist_url || null,
            enable_flip_clock: data.settings.enable_flip_clock ?? true,
            flip_clock_size: data.settings.flip_clock_size || "medium",
            flip_clock_color: data.settings.flip_clock_color || "#ff5722"
          }
        })
      }

      return true
    } catch (error) {
      console.error("Error importing user data:", error)
      return false
    }
  }
}

