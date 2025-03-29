import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    if (!start || !end) {
      return NextResponse.json({ message: "Start and end dates are required" }, { status: 400 })
    }

    const tasks = await sql`
      SELECT t.*, p.name as project_name, p.color as project_color
      FROM todos t
      LEFT JOIN todo_projects tp ON t.id = tp.todo_id
      LEFT JOIN projects p ON tp.project_id = p.id
      WHERE t.user_id = ${session.user.id}
      AND t.due_date IS NOT NULL
      AND t.due_date >= ${start}
      AND t.due_date <= ${end}
      ORDER BY t.due_date ASC, t.priority ASC
    `

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error("Error fetching calendar tasks:", error)
    return NextResponse.json({ message: error.message || "Failed to fetch tasks" }, { status: 500 })
  }
}

