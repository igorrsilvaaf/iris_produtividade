import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createTask, getCompletedTasks, getInboxTasks, getTasksForNotifications, searchTasks } from "@/lib/todos"
import { neon } from "@neondatabase/serverless"
import prisma from '@/lib/prisma'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      console.log("Acesso não autorizado ao endpoint /api/tasks");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const completed = searchParams.get("completed");
    const overdue = searchParams.get("overdue");
    const searchText = searchParams.get("search");
    const all = searchParams.get("all");
    
    let tasks = [];
    
    // Opção para retornar todas as tarefas (necessário para o Kanban)
    if (all === "true") {
      console.log("Buscando TODAS as tarefas para o usuário");
      
      // Usar consulta SQL direta para obter todas as tarefas com informação de projeto
      tasks = await sql`
        SELECT t.*, p.name as project_name, p.color as project_color
        FROM todos t
        LEFT JOIN todo_projects tp ON t.id = tp.todo_id
        LEFT JOIN projects p ON tp.project_id = p.id
        WHERE t.user_id = ${userId}
        ORDER BY t.created_at DESC
      `;
      
      console.log(`Encontradas ${tasks.length} tarefas no total`);
    }
    // Use funções específicas baseadas nos parâmetros
    else if (searchText) {
      // Usar a função de busca se houver texto de pesquisa
      tasks = await searchTasks(userId, searchText);
    } else if (completed === "true") {
      // Obter tarefas completas
      tasks = await getCompletedTasks(userId);
    } else if (overdue === "true") {
      // Obter tarefas atrasadas usando getTasksForNotifications que já tem essa lógica
      const taskGroups = await getTasksForNotifications(userId);
      tasks = taskGroups.overdueTasks;
    } else {
      // Padrão: obter tarefas da caixa de entrada
      tasks = await getInboxTasks(userId);
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      console.log("Acesso não autorizado ao endpoint POST /api/tasks");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    
    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Criar tarefa usando a função do lib/todos
    const task = await createTask(
      userId,
      body.title,
      body.description || null,
      body.due_date || null,
      body.priority || 4,
      body.project_id || null,
      body.kanban_column || null,
      body.points || 3
    );

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

