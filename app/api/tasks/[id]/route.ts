import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const taskId = params.id;

    // Fetch task
    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
        user_id: userId,
      },
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
    });

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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const taskId = params.id;
    const body = await request.json();

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
        user_id: userId,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: body.title !== undefined ? body.title : existingTask.title,
        description: body.description !== undefined ? body.description : existingTask.description,
        due_date: body.due_date !== undefined ? new Date(body.due_date) : existingTask.due_date,
        priority: body.priority !== undefined ? body.priority : existingTask.priority,
        completed: body.completed !== undefined ? body.completed : existingTask.completed,
        project_id: body.project_id !== undefined ? body.project_id : existingTask.project_id,
      },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const taskId = params.id;

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
        user_id: userId,
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Delete task
    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

