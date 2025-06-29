import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { toggleTaskCompletion } from "@/lib/todos"

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ taskId: string; id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = parseInt(resolvedParams.taskId || resolvedParams.id, 10)

    if (isNaN(taskId)) {
      return NextResponse.json({ message: "Invalid task ID" }, { status: 400 })
    }

    const updatedTask = await toggleTaskCompletion(taskId, session.user.id)

    if (!updatedTask) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ task: updatedTask })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to complete task" }, { status: 500 })
  }
}