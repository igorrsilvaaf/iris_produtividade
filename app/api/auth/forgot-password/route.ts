import { NextRequest, NextResponse } from "next/server"
import { createPasswordResetToken } from "@/lib/auth"
import { sendEmail, createPasswordResetEmailHtml } from "@/lib/email"
import { sql } from "../../../../lib/supabase"

const isDevelopment = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { email } = data

    if (!email) {
      return NextResponse.json(
        { message: "Email é obrigatório" },
        { status: 400 }
      )
    }

    let emailConfigComplete = true;
    if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_PORT || 
        !process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      emailConfigComplete = false;
      if (!isDevelopment) {
        return NextResponse.json(
          { message: "Erro de configuração do servidor" },
          { status: 500 }
        );
      }
    }
    
    const users = await sql`SELECT name FROM users WHERE email = ${email}`;
    const userName = users.length > 0 ? users[0].name : 'Usuário';

    try {
      const resetToken = await createPasswordResetToken(email)
      
      if (resetToken) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
        
        if (emailConfigComplete) {
          try {
            const emailHtml = createPasswordResetEmailHtml(resetUrl, userName);
            
            const emailResult = await sendEmail({
              to: email,
              subject: 'Redefinição de Senha - Íris',
              html: emailHtml,
            });
          } catch (emailError) {
            if (!isDevelopment) {
              throw emailError;
            }
          }
        }
        
        return NextResponse.json(
          { 
            success: true, 
            emailFound: true,
            message: "Um link de redefinição de senha foi enviado para o seu email." 
          },
          { status: 200 }
        )
      } else {
        return NextResponse.json(
          { 
            success: false, 
            emailFound: false,
            message: "Email não encontrado na base de dados Íris." 
          },
          { status: 200 } 
        )
      }
    } catch (tokenError) {
      return NextResponse.json(
        { message: "Falha ao processar a solicitação de redefinição de senha" },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Falha ao processar a solicitação de redefinição de senha" },
      { status: 500 }
    )
  }
} 