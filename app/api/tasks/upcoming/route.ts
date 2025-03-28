import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getUpcomingTasks } from "@/lib/todos"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const tasks = await getUpcomingTasks(session.user.id)

    return NextResponse.json({ tasks })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch upcoming tasks" }, { status: 500 })
  }
}

