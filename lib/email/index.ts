import nodemailer from 'nodemailer';

// Definir a interface para opções de e-mail
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Verificar o ambiente (desenvolvimento ou produção)
const isDevelopment = process.env.NODE_ENV !== 'production';

// Configurar o transporte de e-mail
const createTransporter = async () => {
  if (isDevelopment) {
    // Para ambiente de desenvolvimento, usamos o Ethereal (serviço de testes)
    const testAccount = await nodemailer.createTestAccount();
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    // Para produção, usamos as configurações do .env
    // Você pode usar qualquer serviço de e-mail como SendGrid, Mailgun, Gmail, etc.
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
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

    if (isDevelopment) {
      // No ambiente de desenvolvimento, exibimos o URL de preview
      console.log(`[Email] Mensagem enviada: ${info.messageId}`);
      console.log(`[Email] URL de visualização: ${nodemailer.getTestMessageUrl(info)}`);
      return {
        success: true,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
      };
    }

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('[Email] Erro ao enviar email:', error);
    throw new Error('Failed to send email');
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