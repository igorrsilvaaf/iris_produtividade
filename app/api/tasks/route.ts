import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createTask, getCompletedTasks, getInboxTasks, getTasksForNotifications } from "@/lib/todos"
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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const priority = searchParams.get("priority");
    const project = searchParams.get("project");
    
    // Build where clause for filtering
    const where: any = {
      user_id: userId,
    };
    
    // Apply filters
    if (completed !== null) {
      where.completed = completed === "true";
    }
    
    if (overdue === "true") {
      where.due_date = {
        lt: new Date(),
      };
      where.completed = false;
    }
    
    if (startDate) {
      where.due_date = {
        ...where.due_date,
        gte: new Date(startDate),
      };
    }
    
    if (endDate) {
      where.due_date = {
        ...where.due_date,
        lte: new Date(endDate),
      };
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    if (project) {
      where.project_id = project;
    }

    // Fetch tasks with filters
    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { due_date: "asc" },
        { priority: "desc" },
        { created_at: "desc" },
      ],
    });

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

    // Create new task
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        due_date: body.due_date ? new Date(body.due_date) : null,
        priority: body.priority || "LOW",
        completed: body.completed || false,
        user_id: userId,
        project_id: body.project_id || null,
        points: body.points || 3,
      },
    });

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

