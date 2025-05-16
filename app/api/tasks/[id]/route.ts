import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTaskById, updateTask, deleteTask } from "@/lib/todos";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Extrair o ID da URL em vez de usar params.id
    const url = request.url;
    const urlParts = url.split('/');
    const idFromUrl = urlParts[urlParts.length - 1].split('?')[0]; // Pega o último segmento da URL e remove query params
    const taskId = parseInt(idFromUrl, 10);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const task = await getTaskById(taskId, userId);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const taskId = parseInt(params.id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const body = await request.json();

    const existingTask = await getTaskById(taskId, userId);

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await updateTask(taskId, userId, {
      title: body.title,
      description: body.description,
      due_date: body.due_date,
      priority: body.priority,
      completed: body.completed,
      kanban_column: body.kanban_column,
      points: body.points,
      attachments: body.attachments,
      estimated_time: body.estimated_time
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const taskId = parseInt(params.id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const body = await request.json();
    
    console.log(`[PATCH /api/tasks/${taskId}] Dados recebidos:`, JSON.stringify(body));
    console.log(`[PATCH /api/tasks/${taskId}] Tempo estimado recebido:`, body.estimated_time);
    
    if (body.dueDate) {
      console.log(`[PATCH /api/tasks/${taskId}] Data recebida (dueDate):`, body.dueDate);
      try {
        const date = new Date(body.dueDate);
        console.log(`[PATCH /api/tasks/${taskId}] Data convertida:`, date);
        console.log(`[PATCH /api/tasks/${taskId}] Hora da data:`, date.getHours(), ":", date.getMinutes());
      } catch (e) {
        console.error(`[PATCH /api/tasks/${taskId}] Erro ao analisar data:`, e);
      }
    } else if (body.due_date) {
      console.log(`[PATCH /api/tasks/${taskId}] Data recebida (due_date):`, body.due_date);
      try {
        const date = new Date(body.due_date);
        console.log(`[PATCH /api/tasks/${taskId}] Data convertida:`, date);
        console.log(`[PATCH /api/tasks/${taskId}] Hora da data:`, date.getHours(), ":", date.getMinutes());
      } catch (e) {
        console.error(`[PATCH /api/tasks/${taskId}] Erro ao analisar data:`, e);
      }
    } else {
      console.log(`[PATCH /api/tasks/${taskId}] Nenhuma data recebida`);
    }

    const existingTask = await getTaskById(taskId, userId);

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await updateTask(taskId, userId, body);

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const taskId = parseInt(params.id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const existingTask = await getTaskById(taskId, userId);

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await deleteTask(taskId, userId);

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

