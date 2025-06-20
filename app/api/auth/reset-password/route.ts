import { NextRequest, NextResponse } from "next/server"
import { resetPassword, verifyPasswordResetToken } from "@/lib/auth"

// Verificar se o token é válido
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
    return NextResponse.json(
      { valid: false, message: "Failed to verify token" },
      { status: 500 }
    )
  }
}

// Redefinir a senha
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { token, password } = data

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const success = await resetPassword(token, password)
    
    if (!success) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        message: "Password has been reset successfully" 
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 }
    )
  }
}