import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { searchTasks } from "@/lib/todos"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ message: "Search query is required" }, { status: 400 })
    }

    const tasks = await searchTasks(session.user.id, query)

    return NextResponse.json({ tasks })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to search tasks" }, { status: 500 })
  }
}

