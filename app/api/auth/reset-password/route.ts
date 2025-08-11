import { NextRequest, NextResponse } from "next/server";
import { resetPassword, verifyPasswordResetToken } from "@/lib/auth";

// Verificar se o token é válido
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      );
    }

    const userId = await verifyPasswordResetToken(token);

    return NextResponse.json(
      {
        valid: !!userId,
        message: userId ? "Token válido" : "Token inválido ou expirado",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: "Failed to verify token" },
      { status: 500 }
    );
  }
}

// Redefinir a senha
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { token, password } = data;

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 }
      );
    }

    const success = await resetPassword(token, password);

    if (!success) {
      return NextResponse.json(
        { message: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Senha redefinida com sucesso",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Falha ao redefinir senha" },
      { status: 500 }
    );
  }
}
