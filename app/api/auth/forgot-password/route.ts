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
        
        console.log(`[Recuperação de senha] Token criado: ${resetToken} para ${email}`);
        console.log(`[Recuperação de senha] URL de recuperação: ${resetUrl}`);
        
        try {
          // Enviar email
          const emailHtml = createPasswordResetEmailHtml(resetUrl, userName);
          const emailResult = await sendEmail({
            to: email,
            subject: 'Redefinição de Senha - To-Do-Ist',
            html: emailHtml,
          });
          
          console.log(`[Recuperação de senha] Email enviado com sucesso: ${JSON.stringify(emailResult)}`);
          
          if (emailResult.previewUrl) {
            console.log(`[Recuperação de senha] LINK PARA VISUALIZAR O EMAIL: ${emailResult.previewUrl}`);
          }
        } catch (emailError) {
          console.error(`[Recuperação de senha] Erro ao enviar email:`, emailError);
          // Não propagamos o erro para evitar vazamento de informações
        }
      } else {
        console.log(`[Recuperação de senha] Nenhum token criado para ${email} (usuário provavelmente não existe)`);
      }

      // Sempre retornar sucesso, mesmo se o email não existir, para evitar vazamento de informações
      return NextResponse.json(
        { 
          success: true, 
          message: "If your email exists in our system, you will receive a password reset link." 
        },
        { status: 200 }
      )
    } catch (tokenError) {
      console.error("[ForgotPassword] Erro ao criar token:", tokenError);
      throw new Error("Error creating password reset token");
    }
  } catch (error) {
    console.error("[ForgotPassword] Erro na solicitação:", error);
    return NextResponse.json(
      { message: "Failed to process password reset request" },
      { status: 500 }
    )
  }
} 