import { NextRequest, NextResponse } from "next/server"
import { createPasswordResetToken } from "@/lib/auth"
import { sendEmail, createPasswordResetEmailHtml } from "@/lib/email"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Verificar o ambiente (desenvolvimento ou produção)
const isDevelopment = process.env.NODE_ENV === 'development';

export async function POST(request: NextRequest) {
  console.log(`[ForgotPassword] Iniciando POST. NODE_ENV: ${process.env.NODE_ENV}, isDevelopment: ${isDevelopment}`);
  try {
    const data = await request.json()
    const { email } = data

    if (!email) {
      console.log("[ForgotPassword] Email não fornecido");
      return NextResponse.json(
        { message: "Email é obrigatório" },
        { status: 400 }
      )
    }

    console.log(`[ForgotPassword] Solicitação de recuperação de senha para: ${email}`);

    // Verificar variáveis de ambiente necessárias
    let emailConfigComplete = true;
    if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_PORT || 
        !process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.error('[ForgotPassword] Configuração de e-mail incompleta');
      emailConfigComplete = false;
      if (!isDevelopment) {
        return NextResponse.json(
          { message: "Erro de configuração do servidor" },
          { status: 500 }
        );
      } else {
        console.log('[ForgotPassword] Ambiente de desenvolvimento - O envio de e-mail real será pulado.');
      }
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
        
        // Em ambiente de desenvolvimento, mostrar o token e a URL para facilitar testes
        if (isDevelopment) {
          console.log('=========== INFORMAÇÕES DE RECUPERAÇÃO DE SENHA (APENAS DEV) ===========');
          console.log('Token:', resetToken);
          console.log('URL de recuperação:', resetUrl);
          console.log('======================================================================');
        }
        
        // Tentar enviar o e-mail apenas se a configuração estiver completa
        if (emailConfigComplete) {
          try {
            // Enviar email
            const emailHtml = createPasswordResetEmailHtml(resetUrl, userName);
            
            const emailResult = await sendEmail({
              to: email,
              subject: 'Redefinição de Senha - Íris',
              html: emailHtml,
            });
            
            if (emailResult.success) {
              console.log(`[Recuperação de senha] Email enviado com sucesso para: ${email}`);
            } else if (isDevelopment && emailResult.isDevelopment) {
              // Este caso pode ocorrer se o sendEmail tiver sua própria lógica de simulação para dev
              console.log(`[Recuperação de senha] Email simulado em ambiente de desenvolvimento pela função sendEmail`);
            }
          } catch (emailError) {
            console.error(`[Recuperação de senha] Erro ao enviar email:`, emailError);
            // Em produção, se chegou aqui com config completa mas falhou, é um erro real de envio.
            // Em desenvolvimento, mesmo com config completa, pode falhar (ex: servidor de email de teste offline).
            // O importante é não travar o fluxo em dev se o problema for só o envio.
            if (!isDevelopment) {
              // Repropagar o erro para ser pego pelo catch mais externo e retornar 500.
              // Não queremos que o usuário veja uma mensagem de sucesso se o email não pôde ser enviado em produção.
              throw emailError;
            } else {
              console.log('[ForgotPassword] Ambiente de desenvolvimento - continuando mesmo com erro no envio de email (configuração estava completa).');
            }
          }
        } else if (isDevelopment) {
          // Se a configuração de email não estava completa e estamos em desenvolvimento,
          // logamos que o envio foi pulado. O token já foi logado acima.
          console.log('[ForgotPassword] Ambiente de desenvolvimento - Envio de email pulado devido à configuração de email incompleta.');
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