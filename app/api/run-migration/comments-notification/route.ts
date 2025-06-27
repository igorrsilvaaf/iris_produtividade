import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("Iniciando migração de notificação do sistema de comentários...");

    // Buscar todos os usuários ativos
    const users = await sql`SELECT id FROM users;`
    console.log(`Encontrados ${users.length} usuários.`);

    // Título e mensagem da notificação
    const title = "🎉 Nova Funcionalidade: Sistema de Comentários";
    const message = "Agora você pode adicionar comentários nas suas tarefas! Acesse os detalhes de qualquer tarefa para experimentar o novo sistema de comentários, similar ao Trello. Você pode criar, editar e deletar seus próprios comentários.";

    // Verificar se a notificação já foi enviada (evitar duplicatas)
    const existingNotifications = await sql`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE title = ${title}
    `;

    if (existingNotifications[0].count > 0) {
      return NextResponse.json({ 
        message: "Notification already sent to users",
        usersCount: users.length,
        existingNotifications: existingNotifications[0].count
      });
    }

    // Criar notificação para cada usuário
    let notificationsCreated = 0;
    for (const user of users) {
      try {
        await sql`
          INSERT INTO notifications (user_id, title, message, is_read, created_at)
          VALUES (${user.id}, ${title}, ${message}, false, NOW())
        `;
        notificationsCreated++;
      } catch (error) {
        console.error(`Erro ao criar notificação para usuário ${user.id}:`, error);
      }
    }

    console.log(`Notificações criadas: ${notificationsCreated}/${users.length}`);

    return NextResponse.json({ 
      message: "Comments notification migration executed successfully",
      usersCount: users.length,
      notificationsCreated
    });
  } catch (error: any) {
    console.error("Erro ao executar migração de notificação:", error);
    return NextResponse.json({ 
      message: error.message || "Failed to run comments notification migration" 
    }, { status: 500 });
  }
} 