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
    console.error("Error fetching task project:", error);
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
    
    console.log("Task project update request:", { taskId, projectId, body });

    // Verificar se o projectId é válido (null ou número)
    if (projectId !== null && (isNaN(Number(projectId)) || Number(projectId) <= 0)) {
      return NextResponse.json({ message: "Invalid project ID format" }, { status: 400 })
    }
    
    // Convertendo para number ou permanecendo null
    const projectIdValue = projectId === null ? null : Number(projectId);
    
    console.log("Calling setTaskProject with:", { taskId, projectIdValue });
    await setTaskProject(taskId, projectIdValue)

    return NextResponse.json({ 
      message: "Task project updated successfully", 
      data: { taskId, projectId: projectIdValue } 
    })
  } catch (error: any) {
    console.error("Error updating task project:", error);
    return NextResponse.json({ 
      message: error.message || "Failed to update task project",
      error: error.toString()
    }, { status: 500 })
  }
}

