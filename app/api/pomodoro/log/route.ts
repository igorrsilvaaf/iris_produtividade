import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

export async function POST(request: Request) {
  console.log("[API Pomodoro Log] Recebendo requisição POST");
  try {
    const session = await getSession();

    if (!session || !session.user || !session.user.id) {
      console.log("[API Pomodoro Log] Erro de autenticação: Sessão inválida");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    console.log("[API Pomodoro Log] Usuário autenticado:", session.user.id);

    let body;
    try {
      body = await request.json();
      console.log("[API Pomodoro Log] Dados recebidos:", JSON.stringify(body));
    } catch (error) {
      console.error("[API Pomodoro Log] Erro ao processar o corpo da requisição:", error);
      return NextResponse.json(
        { error: "Formato de requisição inválido", details: "O corpo da requisição deve ser um JSON válido" },
        { status: 400 }
      );
    }
    
    const taskIdString = body.taskId;
    const rawDuration = body.duration;
    const rawMode = body.mode;
    
    console.log(`[API Pomodoro Log] Parâmetros extraídos: taskId=${taskIdString}, duration=${rawDuration}, mode=${rawMode}`);

    if (rawDuration === undefined || rawDuration === null || Number(rawDuration) <= 0) {
      console.log("[API Pomodoro Log] Erro de validação: Duração inválida", rawDuration);
      return NextResponse.json(
        { error: "Duração é obrigatória e deve ser maior que zero" },
        { status: 400 }
      );
    }

    const duration: number = Number(rawDuration);
    const mode: string = typeof rawMode === 'string' && rawMode.trim() !== '' ? rawMode : "work";
    const userId: string = String(session.user.id); // Garantindo que userId seja string

    // Cria o registro de log do pomodoro
    let taskIdInt: number | null = null;
    if (taskIdString) {
      const parsedId = parseInt(String(taskIdString), 10);
      if (!isNaN(parsedId)) {
        taskIdInt = parsedId;
        console.log(`[API Pomodoro Log] ID da tarefa válido: ${taskIdInt}`);
      } else {
        console.warn(`[API Pomodoro Log] Recebido taskId em formato inválido: ${taskIdString}. O log será salvo sem taskId.`);
      }
    } else {
      console.log("[API Pomodoro Log] Nenhum taskId fornecido, o log será salvo sem associação a uma tarefa.");
    }

    const newPomodoroLogId = crypto.randomUUID();
    console.log(`[API Pomodoro Log] Criando novo log com ID: ${newPomodoroLogId}, userId: ${userId}, taskId: ${taskIdInt}, mode: ${mode}, duration: ${duration}`);
    
    const startedAt = new Date(Date.now() - duration * 60 * 1000);
    const completedAt = new Date();
    
    console.log(`[API Pomodoro Log] Período da sessão: ${startedAt.toISOString()} até ${completedAt.toISOString()}`);

    const pomodoroLog = await prisma.pomodoroLog.create({
      data: {
        id: newPomodoroLogId,
        userId: userId,
        taskId: taskIdInt,
        duration: duration,
        mode: mode,
        startedAt: startedAt,
        completedAt: completedAt,
      },
    });

    console.log("[API Pomodoro Log] Log criado com sucesso:", JSON.stringify(pomodoroLog));

    // Resposta com cabeçalhos que evitam cache em dispositivos móveis
    return new NextResponse(
      JSON.stringify({
        success: true,
        pomodoroSession: pomodoroLog,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error("[API Pomodoro Log] Erro ao registrar sessão:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[API Pomodoro Log] Stack de erro:", errorStack);
    
    return NextResponse.json(
      { error: "Erro ao registrar sessão de pomodoro", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  console.log("[API Pomodoro Log] Recebendo requisição GET");
  try {
    const session = await getSession();

    if (!session || !session.user || !session.user.id) {
      console.log("[API Pomodoro Log] Erro de autenticação: Usuário não autenticado");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    console.log("[API Pomodoro Log] Usuário autenticado:", session.user.id);

    const url = new URL(request.url);
    console.log("[API Pomodoro Log] URL completa:", request.url);
    
    const taskIdParam = url.searchParams.get("taskId");
    const limit = Number(url.searchParams.get("limit") || "50");
    const page = Number(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    const userId: string = String(session.user.id);
    
    const timestamp = url.searchParams.get("t"); // Para verificar se está usando cache buster
    console.log(`[API Pomodoro Log] Parâmetros da requisição: taskId=${taskIdParam}, page=${page}, limit=${limit}, timestamp=${timestamp}`);

    console.log(`[API Pomodoro Log] Buscando logs para userId=${userId}, taskId=${taskIdParam}, page=${page}, limit=${limit}`);

    let taskIdInt: number | null = null;
    if (taskIdParam) {
        const parsedId = parseInt(taskIdParam, 10);
        if (!isNaN(parsedId)) {
            taskIdInt = parsedId;
            console.log(`[API Pomodoro Log] ID da tarefa válido: ${taskIdInt}`);
        } else {
            console.warn(`[API Pomodoro Log] Recebido taskId em formato inválido: ${taskIdParam}.`);
        }
    }
    
    const where: any = { 
      userId: userId,
    };

    if (taskIdInt !== null) {
      where.taskId = taskIdInt;
    }
    
    console.log(`[API Pomodoro Log] Filtro de busca - ${JSON.stringify(where)}`);
    
    const pomodoroLogs = await prisma.pomodoroLog.findMany({
      where,
      orderBy: {
        completedAt: "desc",
      },
      skip,
      take: limit,
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    const total = await prisma.pomodoroLog.count({ where });

    console.log(`[API Pomodoro Log] Encontrados ${pomodoroLogs.length} logs de pomodoro com total de ${total}`);
    if (pomodoroLogs.length > 0) {
      console.log(`[API Pomodoro Log] Primeiro log encontrado - ${JSON.stringify(pomodoroLogs[0])}`);
    } else {
      console.log(`[API Pomodoro Log] Nenhum log encontrado para os filtros aplicados.`);
    }

    // Retornar resposta com cabeçalhos que evitam cache em dispositivos móveis
    return new NextResponse(
      JSON.stringify({
        success: true,
        pomodoroLogs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (error) {
    console.error("[API Pomodoro Log] Erro ao buscar histórico:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao buscar histórico de pomodoro", details: errorMessage },
      { status: 500 }
    );
  }
} 