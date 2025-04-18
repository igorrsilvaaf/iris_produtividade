import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getUserSettings } from "@/lib/settings"
import { getTasksForNotifications } from "@/lib/todos"

export async function GET(request: NextRequest) {
  try {
    // Obter parâmetro da query "ignoreRead"
    const ignoreRead = request.nextUrl.searchParams.get('ignoreRead') === 'true'
    
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Obter configurações do usuário para saber quantos dias a frente verificar
    const settings = await getUserSettings(session.user.id)
    const { task_notification_days } = settings
    
    console.log(`[API] Task notification days configurados: ${task_notification_days}, tipo: ${typeof task_notification_days}`);
    
    // Somente retornar notificações se estiverem habilitadas
    if (!settings.enable_task_notifications) {
      return NextResponse.json({ 
        enabled: false,
        overdueCount: 0,
        dueTodayCount: 0,
        upcomingCount: 0,
        totalCount: 0,
        tasks: {
          overdueTasks: [],
          dueTodayTasks: [],
          upcomingTasks: []
        }
      })
    }

    // Buscar tarefas para notificações, passando o parâmetro ignoreReadStatus
    const taskNotifications = await getTasksForNotifications(session.user.id, task_notification_days, ignoreRead)
    
    // Calcular o total
    const totalCount = taskNotifications.overdueCount + taskNotifications.dueTodayCount + taskNotifications.upcomingCount

    return NextResponse.json({
      enabled: true,
      overdueCount: taskNotifications.overdueCount,
      dueTodayCount: taskNotifications.dueTodayCount,
      upcomingCount: taskNotifications.upcomingCount,
      totalCount,
      tasks: {
        overdueTasks: taskNotifications.overdueTasks,
        dueTodayTasks: taskNotifications.dueTodayTasks,
        upcomingTasks: taskNotifications.upcomingTasks
      }
    })
  } catch (error: any) {
    console.error("Erro ao buscar notificações de tarefas:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch task notifications" }, { status: 500 })
  }
} 