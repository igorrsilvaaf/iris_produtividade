import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { toggleProjectFavorite } from "@/lib/projects"

export async function PATCH(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const projectId = Number.parseInt(resolvedParams.id)

    const project = await toggleProjectFavorite(projectId, session.user.id)

    return NextResponse.json({ project })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to toggle project favorite status" }, { status: 500 })
  }
}

