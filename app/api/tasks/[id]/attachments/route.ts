import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = parseInt(params.id, 10);
    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const task = await prisma.todos.findUnique({
      where: { id: taskId },
      select: { 
        id: true,
        user_id: true,
        attachments: true
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let attachments = [];
    try {
      if (task.attachments && Array.isArray(task.attachments)) {
        attachments = task.attachments;
      } else if (typeof task.attachments === 'string') {
        attachments = JSON.parse(task.attachments);
      }
    } catch (error) {
      console.error('Error parsing attachments:', error);
    }

    return NextResponse.json({ 
      taskId: task.id,
      attachments: attachments.map((a: any, i: number) => ({
        index: i,
        type: a.type,
        name: a.name || `attachment-${i}`,
        size: a.size || 'N/A',
        keys: Object.keys(a)
      }))
    });
  } catch (error) {
    console.error('Error getting task attachments:', error);
    return NextResponse.json(
      { error: "Failed to get task attachments" },
      { status: 500 }
    );
  }
}
