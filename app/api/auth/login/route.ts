import { type NextRequest, NextResponse } from "next/server"
import { login, createSession } from "@/lib/auth"
import { updateUserSettings } from "@/lib/settings"

export async function POST(request: NextRequest) {
  try {
    const { email, password, preferredLanguage } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    const user = await login(email, password)
    await createSession(user.id)

    // Se o cliente enviou o idioma preferido, atualizamos as configurações do usuário
    if (preferredLanguage && (preferredLanguage === "en" || preferredLanguage === "pt")) {
      try {
        await updateUserSettings(user.id, { language: preferredLanguage })
        console.log(`Login: Idioma do usuário ${user.id} atualizado para ${preferredLanguage}`)
      } catch (settingsError) {
        console.error("Erro ao atualizar o idioma do usuário:", settingsError)
        // Não falharemos o login apenas por causa disso
      }
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Login failed" }, { status: 401 })
  }
}

