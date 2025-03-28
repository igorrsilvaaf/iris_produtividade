import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { updateUserSettings } from "@/lib/settings"

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const settings = await request.json()

    const updatedSettings = await updateUserSettings(session.user.id, settings)

    return NextResponse.json({ settings: updatedSettings })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update settings" }, { status: 500 })
  }
}

