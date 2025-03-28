import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getProjects, createProject } from "@/lib/projects"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const projects = await getProjects(session.user.id)

    return NextResponse.json({ projects })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, color, isFavorite } = await request.json()

    if (!name) {
      return NextResponse.json({ message: "Project name is required" }, { status: 400 })
    }

    const project = await createProject(session.user.id, name, color, isFavorite)

    return NextResponse.json({ project }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create project" }, { status: 500 })
  }
}

