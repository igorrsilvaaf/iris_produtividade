import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { deleteNotification } from "@/lib/notifications"

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const notificationId = Number.parseInt(params.id)

    await deleteNotification(notificationId, session.user.id)

    return NextResponse.json({ message: "Notification deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete notification" }, { status: 500 })
  }
}
