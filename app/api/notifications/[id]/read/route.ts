import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { markNotificationAsRead } from "@/lib/notifications"

export async function PATCH(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const notificationId = Number.parseInt(params.id)

    await markNotificationAsRead(notificationId, session.user.id)

    return NextResponse.json({ message: "Notification marked as read successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to mark notification as read" }, { status: 500 })
  }
}
