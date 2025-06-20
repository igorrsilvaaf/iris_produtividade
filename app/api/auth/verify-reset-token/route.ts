import { NextRequest, NextResponse } from "next/server"
import { verifyPasswordResetToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")
    
    if (!token) {
      return NextResponse.json(
        { message: "Token é obrigatório" },
        { status: 400 }
      )
    }

    const userId = await verifyPasswordResetToken(token)
    
    if (userId) {
    } else {
    }
    
    return NextResponse.json(
      { 
        valid: !!userId,
        message: userId ? "Token válido" : "Token inválido ou expirado"
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: "Falha ao verificar token" },
      { status: 500 }
    )
  }
} 