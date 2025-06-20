import nodemailer from 'nodemailer';

// Definir a interface para opções de e-mail
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Verificar o ambiente (desenvolvimento ou produção)
const isDevelopment = process.env.NODE_ENV === 'development';

// Configurar o transporte de e-mail
const createTransporter = async () => {
  try {
    // Verificar se estamos em ambiente de desenvolvimento
    if (isDevelopment) {

      
      // Em desenvolvimento, verificar se temos configurações SMTP
      const hasSmtpConfig = process.env.EMAIL_SERVER_HOST && 
                           process.env.EMAIL_SERVER_PORT && 
                           process.env.EMAIL_SERVER_USER && 
                           process.env.EMAIL_SERVER_PASSWORD;
      
      if (!hasSmtpConfig) {

        
        // Em desenvolvimento sem configuração SMTP, criar um transportador que apenas loga
        return {
          sendMail: (mailOptions: any) => {

            return Promise.resolve({ messageId: 'test-message-id' });
          }
        };
      }
    }
    
    // Configuração para produção ou desenvolvimento com SMTP configurado
    const host = process.env.EMAIL_SERVER_HOST;
    const port = process.env.EMAIL_SERVER_PORT;
    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;
    
    if (!host || !port || !user || !pass) {
      console.error('[Email] Configurações de e-mail incompletas:',
        { host: !!host, port: !!port, user: !!user, pass: !!pass });
      throw new Error('Email server configuration is incomplete');
    }
    

    
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: { user, pass },
    });
  } catch (error) {
    console.error('[Email] Erro ao criar transportador de email:', error);
    throw error;
  }
};

// Função para enviar e-mail
export const sendEmail = async (options: EmailOptions) => {
  const { to, subject, html, from = process.env.EMAIL_FROM || 'noreply@todolist.com' } = options;

  try {

    
    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });


    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('[Email] Erro ao enviar email:', error);
    
    // Em desenvolvimento, permitir que o fluxo continue mesmo com erro de email
    if (isDevelopment) {

      return {
        success: false,
        error: error.message,
        isDevelopment: true
      };
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Template para e-mail de redefinição de senha
export const createPasswordResetEmailHtml = (resetUrl: string, userName: string = 'Usuário') => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #d31e25; margin: 0;">Íris</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e9ecef; border-radius: 0 0 10px 10px; background-color: #ffffff;">
        <h2 style="color: #343a40;">Redefinição de Senha</h2>
        
        <p>Olá ${userName},</p>
        
        <p>Recebemos uma solicitação para redefinir sua senha do Íris. 
           Se você não solicitou esta alteração, por favor ignore este e-mail.</p>
        
        <p>Para redefinir sua senha, clique no botão abaixo:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #d31e25; 
                    color: white; 
                    padding: 12px 24px; 
                    text-decoration: none; 
                    border-radius: 4px;
                    font-weight: bold;
                    display: inline-block;">
            Redefinir Senha
          </a>
        </div>
        
        <p>Ou acesse este link: <a href="${resetUrl}">${resetUrl}</a></p>
        
        <p>Este link expirará em 1 hora.</p>
        
        <p>Caso você não tenha solicitado esta alteração, por favor ignore este e-mail.</p>
        
        <p style="margin-top: 30px; font-size: 0.9em; color: #6c757d;">
          Atenciosamente,<br>
          Equipe Íris
        </p>
      </div>
      
      <div style="text-align: center; padding: 20px; font-size: 0.8em; color: #6c757d;">
        <p>© ${new Date().getFullYear()} Íris. Todos os direitos reservados.</p>
      </div>
    </div>
  `;
}; 