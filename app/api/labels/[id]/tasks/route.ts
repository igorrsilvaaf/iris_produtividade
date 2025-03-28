import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getLabelTasks } from "@/lib/labels"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const labelId = Number.parseInt(params.id)
    const tasks = await getLabelTasks(labelId, session.user.id)

    return NextResponse.json({ tasks })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch label tasks" }, { status: 500 })
  }
}

