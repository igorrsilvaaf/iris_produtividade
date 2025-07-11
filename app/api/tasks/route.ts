import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createTask, getCompletedTasks, getInboxTasks, getTasksForNotifications, searchTasks, getAllTasksForUser } from "@/lib/todos"
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
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
      tasks = await getAllTasksForUser(userId);
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }
    
    const dueDateValue = body.due_date || null;
    const projectIdValue = body.project_id || null;
    const attachmentsValue = body.attachments || [];
    const estimatedTimeValue = body.estimated_time || null;

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
        estimatedTime: estimatedTimeValue,
      });

      
      return NextResponse.json({ 
        success: true, 
        task: {
          ...task,
          attachments: task.attachments || []
        }
      });
    } catch (createError) {
      return NextResponse.json(
        { error: `Erro ao criar tarefa: ${createError instanceof Error ? createError.message : String(createError)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
