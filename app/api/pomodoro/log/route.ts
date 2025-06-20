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
    
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Formato de requisição inválido", details: "O corpo da requisição deve ser um JSON válido" },
        { status: 400 }
      );
    }
    
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
      }
    }

    const newPomodoroLogId = crypto.randomUUID();
    
    const startedAt = new Date(Date.now() - duration * 60 * 1000);
    const completedAt = new Date();

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
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
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
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    const url = new URL(request.url);
    
    const taskIdParam = url.searchParams.get("taskId");
    const limit = Number(url.searchParams.get("limit") || "50");
    const page = Number(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;
    const userId: string = String(session.user.id);
    
    let taskIdInt: number | null = null;
    if (taskIdParam) {
        const parsedId = parseInt(taskIdParam, 10);
        if (!isNaN(parsedId)) {
            taskIdInt = parsedId;
        }
    }
    
    const where: any = { 
      userId: userId,
    };

    if (taskIdInt !== null) {
      where.taskId = taskIdInt;
    }
    
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
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { error: "Erro ao buscar histórico de pomodoro", details: errorMessage },
      { status: 500 }
    );
  }
} 