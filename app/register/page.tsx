import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { LanguageProvider } from "@/components/language-provider"
import { RegisterContent } from "@/components/register-content"

export default async function RegisterPage() {
  const session = await getSession()

  if (session) {
    redirect("/app")
  }

  const cookieStore = await cookies()
  const languageCookie = cookieStore.get("language-storage")
  let initialLanguage = "pt"

  if (languageCookie) {
    try {
      const parsedData = JSON.parse(languageCookie.value)
      if (parsedData.state && parsedData.state.language) {
        initialLanguage = parsedData.state.language
      }
    } catch (e) {
      console.error("Error parsing language cookie:", e)
    }
  }

  return (
    <LanguageProvider initialLanguage={initialLanguage as "pt" | "en"}>
      <RegisterContent />
    </LanguageProvider>
  )
}

