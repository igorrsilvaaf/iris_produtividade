import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getTodayTasks } from "@/lib/todos"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const tasks = await getTodayTasks(session.user.id)

    return NextResponse.json({ tasks })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch today's tasks" }, { status: 500 })
  }
} 