import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Dados recebidos na requisição de criação de pomodoro:", JSON.stringify(body));
    
    const taskIdString = body.taskId;
    const rawDuration = body.duration;
    const rawMode = body.mode;

    if (rawDuration === undefined || rawDuration === null || Number(rawDuration) <= 0) {
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
        console.log(`ID da tarefa válido: ${taskIdInt}`);
      } else {
        console.warn(`[API Pomodoro Log] Recebido taskId em formato inválido: ${taskIdString}. O log será salvo sem taskId.`);
      }
    }

    // Usar crypto.randomUUID() em vez de uuidv4()
    const newPomodoroLogId = crypto.randomUUID();
    console.log(`Criando novo log com ID: ${newPomodoroLogId}, userId: ${userId}, taskId: ${taskIdInt}, mode: ${mode}, duration: ${duration}`);

    const pomodoroLog = await prisma.pomodoroLog.create({
      data: {
        id: newPomodoroLogId,
        userId: userId,
        taskId: taskIdInt,
        duration: duration,
        mode: mode,
        startedAt: new Date(Date.now() - duration * 60 * 1000), 
        completedAt: new Date(),
      },
    });

    console.log("Log de pomodoro criado com sucesso:", JSON.stringify(pomodoroLog));

    return NextResponse.json({
      success: true,
      pomodoroSession: pomodoroLog,
    });
  } catch (error) {
    console.error("Erro ao registrar sessão de pomodoro:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Stack de erro:", errorStack);
    
    return NextResponse.json(
      { error: "Erro ao registrar sessão de pomodoro", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();

    if (!session || !session.user || !session.user.id) {
      console.log("GET /api/pomodoro/log: Usuário não autenticado");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const url = new URL(request.url);
    const taskIdParam = url.searchParams.get("taskId");
    const limit = Number(url.searchParams.get("limit") || "50");
    const page = Number(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    const userId: string = String(session.user.id); // Garantindo que userId seja string

    console.log(`GET /api/pomodoro/log: Buscando logs para userId=${userId}, taskId=${taskIdParam}, page=${page}, limit=${limit}`);

    // Filtro para buscar por taskId específico
    let taskIdInt: number | null = null;
    if (taskIdParam) {
        const parsedId = parseInt(taskIdParam, 10);
        if (!isNaN(parsedId)) {
            taskIdInt = parsedId;
            console.log(`GET /api/pomodoro/log: ID da tarefa válido: ${taskIdInt}`);
        } else {
            console.warn(`[API Pomodoro Log GET] Recebido taskId em formato inválido: ${taskIdParam}.`);
            // Opcional: retornar erro se o taskId é obrigatório ou tem formato inválido
            // return NextResponse.json({ error: "Formato de taskId inválido." }, { status: 400 });
        }
    }
    
    const where: any = { // Usar 'any' temporariamente para where ou definir um tipo mais específico
      userId: userId,
    };

    if (taskIdInt !== null) {
      where.taskId = taskIdInt;
    }
    
    console.log(`GET /api/pomodoro/log: Filtro de busca - ${JSON.stringify(where)}`);
    
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

    console.log(`GET /api/pomodoro/log: Encontrados ${pomodoroLogs.length} logs de pomodoro com total de ${total}`);
    if (pomodoroLogs.length > 0) {
      console.log(`GET /api/pomodoro/log: Primeiro log encontrado - ${JSON.stringify(pomodoroLogs[0])}`);
    } else {
      console.log(`GET /api/pomodoro/log: Nenhum log encontrado para os filtros aplicados.`);
    }

    return NextResponse.json({
      success: true,
      pomodoroLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar histórico de pomodoro:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao buscar histórico de pomodoro", details: errorMessage },
      { status: 500 }
    );
  }
} 