import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email
      }
    })
  } catch (error: any) {
    return NextResponse.json({ 
      authenticated: false,
      message: error.message || "Failed to check authentication" 
    }, { status: 500 })
  }
} 