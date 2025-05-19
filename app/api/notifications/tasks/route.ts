import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getUserSettings } from "@/lib/settings"
import { getTasksForNotifications } from "@/lib/todos"

export async function GET(request: NextRequest) {
  try {
    console.log("[API] Iniciando busca de notificações de tarefas");
    
    // Forçar expiração de qualquer cache
    const cacheKey = request.nextUrl.searchParams.get('_cache') || Date.now().toString();
    console.log(`[API] Cache key: ${cacheKey}`);
    
    // Obter parâmetro da query "ignoreRead"
    const ignoreRead = request.nextUrl.searchParams.get('ignoreRead') === 'true'
    
    // Adicionar uma verificação mais robusta da sessão
    const session = await getSession()

    if (!session) {
      console.log("[API] Sessão não encontrada, retornando 401");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    if (!session.user || !session.user.id) {
      console.log("[API] Dados do usuário inválidos na sessão");
      return NextResponse.json({ message: "Invalid user session" }, { status: 403 })
    }

    const userId = session.user.id;
    
    console.log(`[API] Usuário autenticado: ID=${userId}, Email=${session.user.email}`);

    // Obter configurações do usuário para saber quantos dias a frente verificar
    const settings = await getUserSettings(userId)
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
        },
        userId,
        userEmail: session.user.email
      }, {
        headers: {
          // Desabilitar cache completamente
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store'
        }
      })
    }

    // Buscar tarefas para notificações, passando o parâmetro ignoreReadStatus
    const taskNotifications = await getTasksForNotifications(userId, task_notification_days, ignoreRead)
    
    // Verificação adicional de segurança: garantir que todas as tarefas pertencem ao usuário
    const safeOverdueTasks = taskNotifications.overdueTasks.filter(task => task.user_id === userId);
    const safeDueTodayTasks = taskNotifications.dueTodayTasks.filter(task => task.user_id === userId);
    const safeUpcomingTasks = taskNotifications.upcomingTasks.filter(task => task.user_id === userId);
    
    // Registrar se houve filtragem de segurança
    if (safeOverdueTasks.length !== taskNotifications.overdueTasks.length) {
      console.error(`[API] ERRO DE SEGURANÇA: Filtradas ${taskNotifications.overdueTasks.length - safeOverdueTasks.length} tarefas vencidas de outro usuário!`);
    }
    
    if (safeDueTodayTasks.length !== taskNotifications.dueTodayTasks.length) {
      console.error(`[API] ERRO DE SEGURANÇA: Filtradas ${taskNotifications.dueTodayTasks.length - safeDueTodayTasks.length} tarefas para hoje de outro usuário!`);
    }
    
    if (safeUpcomingTasks.length !== taskNotifications.upcomingTasks.length) {
      console.error(`[API] ERRO DE SEGURANÇA: Filtradas ${taskNotifications.upcomingTasks.length - safeUpcomingTasks.length} tarefas futuras de outro usuário!`);
    }
    
    // Usar as tarefas filtradas
    const safeTaskNotifications = {
      overdueCount: safeOverdueTasks.length,
      dueTodayCount: safeDueTodayTasks.length,
      upcomingCount: safeUpcomingTasks.length,
      overdueTasks: safeOverdueTasks,
      dueTodayTasks: safeDueTodayTasks,
      upcomingTasks: safeUpcomingTasks
    };
    
    // Calcular o total
    const totalCount = safeTaskNotifications.overdueCount + safeTaskNotifications.dueTodayCount + safeTaskNotifications.upcomingCount

    console.log(`[API] Retornando ${safeTaskNotifications.overdueTasks.length} tarefas vencidas, ${safeTaskNotifications.dueTodayTasks.length} para hoje, e ${safeTaskNotifications.upcomingTasks.length} próximas para o usuário ${userId}`);
    
    // Log das primeiras tasks para debug
    if (safeTaskNotifications.overdueTasks.length > 0) {
      const task = safeTaskNotifications.overdueTasks[0];
      console.log(`[API] Exemplo de tarefa vencida: ID=${task.id}, Título=${task.title}, UserID=${task.user_id}`);
    }
    
    return NextResponse.json({
      enabled: true,
      overdueCount: safeTaskNotifications.overdueCount,
      dueTodayCount: safeTaskNotifications.dueTodayCount,
      upcomingCount: safeTaskNotifications.upcomingCount,
      totalCount,
      tasks: {
        overdueTasks: safeTaskNotifications.overdueTasks,
        dueTodayTasks: safeTaskNotifications.dueTodayTasks,
        upcomingTasks: safeTaskNotifications.upcomingTasks
      },
      userId, // Adicionando ID do usuário para verificação no cliente
      userEmail: session.user.email // Adicionando email para verificação
    }, {
      headers: {
        // Desabilitar cache completamente
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store'
      }
    })
  } catch (error: any) {
    console.error("Erro ao buscar notificações de tarefas:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch task notifications" }, { status: 500 })
  }
} 