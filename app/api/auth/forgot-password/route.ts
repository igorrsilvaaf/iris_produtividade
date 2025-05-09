import { NextRequest, NextResponse } from "next/server"
import { createPasswordResetToken } from "@/lib/auth"
import { sendEmail, createPasswordResetEmailHtml } from "@/lib/email"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email } = data

    if (!email) {
      console.log("[ForgotPassword] Email não fornecido");
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      )
    }

    console.log(`[ForgotPassword] Solicitação de recuperação de senha para: ${email}`);

    // Verificar variáveis de ambiente necessárias
    if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_PORT || 
        !process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.error('[ForgotPassword] Configuração de e-mail incompleta');
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      )
    }
    
    // Buscar o nome do usuário
    const users = await sql`SELECT name FROM users WHERE email = ${email}`;
    const userName = users.length > 0 ? users[0].name : 'Usuário';

    // Criar token de reset de senha
    try {
      const resetToken = await createPasswordResetToken(email)
      
      // Se o token for criado (email existe), enviar email
      if (resetToken) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
        
        try {
          // Enviar email
          const emailHtml = createPasswordResetEmailHtml(resetUrl, userName);
          
          const emailResult = await sendEmail({
            to: email,
            subject: 'Redefinição de Senha - Íris',
            html: emailHtml,
          });
          
          console.log(`[Recuperação de senha] Email enviado com sucesso para: ${email}`);
        } catch (emailError) {
          console.error(`[Recuperação de senha] Erro ao enviar email:`, emailError);
          throw emailError;
        }
      } else {
        console.log(`[Recuperação de senha] Email não encontrado no banco de dados: ${email}`);
      }

      // Sempre retornar sucesso, mesmo se o email não existir, para evitar vazamento de informações
      return NextResponse.json(
        { 
          success: true, 
          message: "Se seu email existir em nosso sistema, você receberá um link para redefinição de senha." 
        },
        { status: 200 }
      )
    } catch (tokenError) {
      console.error("[ForgotPassword] Erro ao criar token ou enviar email:", tokenError);
      return NextResponse.json(
        { message: "Falha ao processar a solicitação de redefinição de senha" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[ForgotPassword] Erro na solicitação:", error);
    return NextResponse.json(
      { message: "Falha ao processar a solicitação de redefinição de senha" },
      { status: 500 }
    )
  }
} 