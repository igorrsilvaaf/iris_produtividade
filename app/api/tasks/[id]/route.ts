import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { updateTask, deleteTask } from "@/lib/todos"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)

    const task = await updateTask(taskId, session.user.id, {})

    return NextResponse.json({ task })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to get task" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)
    const updates = await request.json()

    const task = await updateTask(taskId, session.user.id, updates)

    return NextResponse.json({ task })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)

    await deleteTask(taskId, session.user.id)

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete task" }, { status: 500 })
  }
}

