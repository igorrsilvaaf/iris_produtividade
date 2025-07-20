import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import prisma from "../../../../lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    if (!start || !end) {
      return NextResponse.json({ message: "Start and end dates are required" }, { status: 400 })
    }

    const startDate = new Date(start)
    const endDate = new Date(end)

    const tasks = await prisma.todos.findMany({
      where: {
        user_id: session.user.id,
        due_date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        todo_projects: {
          include: {
            projects: true
          }
        }
      },
      orderBy: [
        { due_date: 'asc' },
        { priority: 'asc' }
      ]
    })

    const formattedTasks = tasks.map(task => ({
      ...task,
      created_at: task.created_at.toISOString(),
      updated_at: task.updated_at?.toISOString() || null,
      due_date: task.due_date?.toISOString() || null,
      project_id: task.todo_projects[0]?.projects?.id || null,
      project_name: task.todo_projects[0]?.projects?.name || undefined,
      project_color: task.todo_projects[0]?.projects?.color || undefined,
      attachments: task.attachments as any[]
    }))

    return NextResponse.json({ tasks: formattedTasks })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch tasks" }, { status: 500 })
  }
}
