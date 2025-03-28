import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getProjectTasks } from "@/lib/projects"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const projectId = Number.parseInt(params.id)
    const tasks = await getProjectTasks(projectId, session.user.id)

    return NextResponse.json({ tasks })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch project tasks" }, { status: 500 })
  }
}

