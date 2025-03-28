import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createTask } from "@/lib/todos"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, description, dueDate, priority, projectId } = await request.json()

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    const task = await createTask(session.user.id, title, description, dueDate, priority, projectId)

    return NextResponse.json({ task }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create task" }, { status: 500 })
  }
}

