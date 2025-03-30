import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getTaskProject, setTaskProject } from "@/lib/todos"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)
    const projectId = await getTaskProject(taskId)

    return NextResponse.json({ projectId })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch task project" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)
    const { projectId } = await request.json()

    await setTaskProject(taskId, projectId)

    return NextResponse.json({ message: "Task project updated successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update task project" }, { status: 500 })
  }
}

