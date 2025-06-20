import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getTaskProject, setTaskProject } from "@/lib/todos"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)
    const projectId = await getTaskProject(taskId, userId)

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
    
    if (isNaN(taskId) || taskId <= 0) {
      return NextResponse.json({ message: "Invalid task ID" }, { status: 400 })
    }
    
    const body = await request.json()
    const { projectId } = body
    

    if (projectId !== null && (isNaN(Number(projectId)) || Number(projectId) <= 0)) {
      return NextResponse.json({ message: "Invalid project ID format" }, { status: 400 })
    }
    

    const projectIdValue = projectId === null ? null : Number(projectId);
    const userId = session.user.id;
    
    await setTaskProject(taskId, userId, projectIdValue)

    return NextResponse.json({ 
      message: "Task project updated successfully", 
      data: { taskId, projectId: projectIdValue } 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      message: error.message || "Failed to update task project",
      error: error.toString()
    }, { status: 500 })
  }
}
