import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { toggleTaskCompletion } from "@/lib/todos"

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = parseInt(resolvedParams.id, 10)

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const updatedTask = await toggleTaskCompletion(taskId, session.user.id)

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, task: updatedTask })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 500 })
  }
}

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = parseInt(resolvedParams.id, 10)

    if (isNaN(taskId)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 })
    }

    const task = await toggleTaskCompletion(taskId, session.user.id)

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ task })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 500 })
  }
} 