import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getProject, updateProject, deleteProject } from "@/lib/projects"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const projectId = Number.parseInt(resolvedParams.id)
    const project = await getProject(projectId, session.user.id)

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch project" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const projectId = Number.parseInt(resolvedParams.id)
    const updates = await request.json()

    const project = await updateProject(projectId, session.user.id, updates)

    return NextResponse.json({ project })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const projectId = Number.parseInt(resolvedParams.id)

    await deleteProject(projectId, session.user.id)

    return NextResponse.json({ message: "Project deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete project" }, { status: 500 })
  }
}

