import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { updateUserSettings } from "@/lib/settings"

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      console.log("[API Settings] Tentativa de atualização sem sessão ativa");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Obter os dados da requisição
    const settings = await request.json()
    console.log(`[API Settings] Atualizando configurações para o usuário ${session.user.id}:`, settings);
    console.log(`[API Settings] Dias de notificação recebidos:`, settings.task_notification_days, "tipo:", typeof settings.task_notification_days);

    // Verificar se há alterações no idioma
    if (settings.language) {
      console.log(`[API Settings] Alteração de idioma solicitada para: ${settings.language}`);
    }

    try {
      const updatedSettings = await updateUserSettings(session.user.id, settings)
      console.log(`[API Settings] Configurações atualizadas com sucesso:`, updatedSettings);
      console.log(`[API Settings] Dias de notificação salvos:`, updatedSettings.task_notification_days, "tipo:", typeof updatedSettings.task_notification_days);

      // Definir cookie de idioma no lado do servidor (apenas para consistência)
      if (settings.language) {
        const cookieHeader = `user-language=${settings.language}; Path=/; Max-Age=31536000; SameSite=Strict`;
        
        // Retornar resposta com cookie atualizado
        return NextResponse.json(
          { settings: updatedSettings, success: true },
          { 
            status: 200,
            headers: { 'Set-Cookie': cookieHeader }
          }
        );
      }

      return NextResponse.json({ settings: updatedSettings, success: true })
    } catch (dbError: any) {
      console.error("[API Settings] Erro ao atualizar configurações no banco:", dbError);
      return NextResponse.json(
        { message: "Database error: " + dbError.message, success: false }, 
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("[API Settings] Erro não tratado:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update settings", success: false }, 
      { status: 500 }
    )
  }
}

