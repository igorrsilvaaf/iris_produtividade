import { NextRequest, NextResponse } from "next/server"
import { verifyPasswordResetToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get("token")
    
    if (!token) {
      console.log("[VerifyResetToken] Token não fornecido na requisição");
      return NextResponse.json(
        { message: "Token é obrigatório" },
        { status: 400 }
      )
    }

    console.log(`[VerifyResetToken] Verificando token: ${token.substring(0, 8)}...`);
    
    const userId = await verifyPasswordResetToken(token)
    
    if (userId) {
      console.log(`[VerifyResetToken] Token válido para usuário ID: ${userId}`);
    } else {
      console.log(`[VerifyResetToken] Token inválido ou expirado`);
    }
    
    return NextResponse.json(
      { 
        valid: !!userId,
        message: userId ? "Token válido" : "Token inválido ou expirado"
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[VerifyResetToken] Erro ao verificar token:", error)
    return NextResponse.json(
      { valid: false, message: "Falha ao verificar token" },
      { status: 500 }
    )
  }
} 