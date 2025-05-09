import { NextRequest, NextResponse } from "next/server"
import { verifyPasswordResetToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")
    
    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      )
    }

    const userId = await verifyPasswordResetToken(token)
    
    return NextResponse.json(
      { 
        valid: !!userId,
        message: userId ? "Token is valid" : "Token is invalid or expired"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error verifying reset token:", error)
    return NextResponse.json(
      { valid: false, message: "Failed to verify token" },
      { status: 500 }
    )
  }
} 