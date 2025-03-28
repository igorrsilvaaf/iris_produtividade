import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { updateTask, deleteTask } from "@/lib/todos"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const taskId = Number.parseInt(params.id)
    const updates = await request.json()

    const task = await updateTask(taskId, session.user.id, updates)

    return NextResponse.json({ task })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const taskId = Number.parseInt(params.id)

    await deleteTask(taskId, session.user.id)

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete task" }, { status: 500 })
  }
}

