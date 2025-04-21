import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createTask, getCompletedTasks, getInboxTasks, getTasksForNotifications, searchTasks } from "@/lib/todos"
import { neon } from "@neondatabase/serverless"
import prisma from '@/lib/prisma'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      console.log("Acesso não autorizado ao endpoint /api/tasks");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const completed = searchParams.get("completed");
    const overdue = searchParams.get("overdue");
    const searchText = searchParams.get("search");
    const all = searchParams.get("all");
    
    let tasks = [];
    
    if (all === "true") {
      tasks = await sql`
        SELECT t.*, p.name as project_name, p.color as project_color
        FROM todos t
        LEFT JOIN todo_projects tp ON t.id = tp.todo_id
        LEFT JOIN projects p ON tp.project_id = p.id
        WHERE t.user_id = ${userId}
        ORDER BY t.created_at DESC
      `;
    }
    else if (searchText) {
      tasks = await searchTasks(userId, searchText);
    } else if (completed === "true") {
      tasks = await getCompletedTasks(userId);
    } else if (overdue === "true") {
      const taskGroups = await getTasksForNotifications(userId);
      tasks = taskGroups.overdueTasks;
    } else {
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
    const session = await getSession();
    if (!session) {
      console.log("Acesso não autorizado ao endpoint POST /api/tasks");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    
    console.log(`[POST /api/tasks] Dados recebidos:`, JSON.stringify(body));
    
    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }
    
    // Verificar e usar o campo due_date conforme foi recebido
    const dueDateValue = body.due_date || null;
    console.log(`[POST /api/tasks] Data para uso: ${dueDateValue}`);
    
    // Verificar e usar o campo project_id conforme foi recebido
    const projectIdValue = body.project_id || null;
    console.log(`[POST /api/tasks] Project ID para uso: ${projectIdValue}`);
    
    // Verificar e usar o campo attachments conforme foi recebido
    const attachmentsValue = body.attachments || [];
    console.log(`[POST /api/tasks] Anexos para uso:`, JSON.stringify(attachmentsValue));

    try {
      const task = await createTask({
        userId: session.user.id,
        title: body.title,
        description: body.description,
        dueDate: dueDateValue,
        priority: body.priority || 4,
        projectId: projectIdValue,
        kanbanColumn: body.kanban_column || null,
        points: body.points || 3,
        attachments: attachmentsValue,
        estimatedTime: body.estimated_time || null,
      });

      console.log(`[POST /api/tasks] Tarefa criada com sucesso. ID: ${task.id}, Data: ${task.due_date}`);
      console.log(`[POST /api/tasks] Anexos da tarefa:`, task.attachments);
      
      return NextResponse.json({ 
        success: true, 
        task: {
          ...task,
          attachments: task.attachments || []
        }
      });
    } catch (createError) {
      console.error(`[POST /api/tasks] Erro ao criar tarefa:`, createError);
      return NextResponse.json(
        { error: `Erro ao criar tarefa: ${createError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

