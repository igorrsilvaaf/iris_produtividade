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
    
    const url = request.url;
    const urlParts = url.split('/');
    
    const lastSegment = urlParts.filter(part => part.length > 0).pop() || '';
    const idFromUrl = lastSegment.split('?')[0];
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

    const existingTask = await getTaskById(taskId, userId);

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await updateTask(taskId, userId, body);

    return NextResponse.json(updatedTask);
  } catch (error) {
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
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
