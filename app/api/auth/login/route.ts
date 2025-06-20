import { type NextRequest, NextResponse } from "next/server"
import { login, createSession } from "@/lib/auth"
import { updateUserSettings } from "@/lib/settings"

export async function POST(request: NextRequest) {
  try {
    const { email, password, preferredLanguage, rememberMe } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    const user = await login(email, password)
    
    await createSession(user.id, rememberMe === true)

    if (preferredLanguage && (preferredLanguage === "en" || preferredLanguage === "pt")) {
      try {
        await updateUserSettings(user.id, { language: preferredLanguage })
      } catch (settingsError) {
        console.error("Erro ao atualizar o idioma do usuário:", settingsError)
      }
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Login failed";
    return NextResponse.json({ message: errorMessage }, { status: 401 })
  }
}

