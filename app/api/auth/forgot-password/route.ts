import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "@/lib/auth";
import { sendEmail, createPasswordResetEmailHtml } from "@/lib/email";
import prisma from "../../../../lib/prisma";

const isDevelopment = process.env.NODE_ENV === "development";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email } = data;

    if (!email) {
      return NextResponse.json(
        { message: "Email é obrigatório" },
        { status: 400 }
      );
    }

    let emailConfigComplete = true;
    if (
      !process.env.EMAIL_SERVER_HOST ||
      !process.env.EMAIL_SERVER_PORT ||
      !process.env.EMAIL_SERVER_USER ||
      !process.env.EMAIL_SERVER_PASSWORD
    ) {
      emailConfigComplete = false;
      if (!isDevelopment) {
        return NextResponse.json(
          { message: "Erro de configuração do servidor" },
          { status: 500 }
        );
      }
    }

    const user = await prisma.users.findUnique({
      where: { email },
      select: { name: true, id: true },
    });

    const userName = user?.name || "Usuário";

    if (!user) {
      return NextResponse.json(
        { message: "Se o email existir, um link de redefinição será enviado" },
        { status: 200 }
      );
    }

    const token = await createPasswordResetToken(email);
    const baseUrl = process.env.NEXT_PUBLIC_URL || request.nextUrl.origin;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    if (emailConfigComplete) {
      const emailHtml = createPasswordResetEmailHtml(resetLink, userName);

      await sendEmail({
        to: email,
        subject: "Redefinição de senha - Iris Produtividade",
        html: emailHtml,
      });
    } else {
      console.log(
        "Email não configurado. Link para redefinição de senha:",
        resetLink
      );
    }

    return NextResponse.json(
      { message: "Se o email existir, um link de redefinição será enviado" },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Erro ao processar solicitação de redefinição de senha:",
      error
    );
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
