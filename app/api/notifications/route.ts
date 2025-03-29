import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getNotifications, createNotification } from "@/lib/notifications"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const notifications = await getNotifications(session.user.id)

    return NextResponse.json({ notifications })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, message } = await request.json()

    if (!title || !message) {
      return NextResponse.json({ message: "Title and message are required" }, { status: 400 })
    }

    const notification = await createNotification(session.user.id, title, message)

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create notification" }, { status: 500 })
  }
}
