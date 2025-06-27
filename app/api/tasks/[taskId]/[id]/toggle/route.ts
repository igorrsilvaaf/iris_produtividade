import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { toggleTaskCompletion } from "@/lib/todos"

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)

    const task = await toggleTaskCompletion(taskId, session.user.id)

    return NextResponse.json({ task })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to toggle task completion" }, { status: 500 })
  }
}

