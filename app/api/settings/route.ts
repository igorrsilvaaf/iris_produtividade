import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { updateUserSettings, getUserSettings } from "@/lib/settings"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    try {
      const settings = await getUserSettings(session.user.id)
      return NextResponse.json({ settings, success: true })
    } catch (dbError: any) {
      return NextResponse.json(
        { message: "Database error: " + dbError.message, success: false }, 
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to get settings", success: false }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const settings = await request.json()

    if (settings.language) {
    }

    try {
      const updatedSettings = await updateUserSettings(session.user.id, settings)

      if (settings.language) {
        const cookieHeader = `user-language=${settings.language}; Path=/; Max-Age=31536000; SameSite=Strict`;
        
        return NextResponse.json(
          { settings: updatedSettings, success: true },
          { 
            status: 200,
            headers: { 'Set-Cookie': cookieHeader }
          }
        );
      }

      return NextResponse.json({ settings: updatedSettings, success: true })
    } catch (dbError: any) {
      return NextResponse.json(
        { message: "Database error: " + dbError.message, success: false }, 
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update settings", success: false }, 
      { status: 500 }
    )
  }
}
