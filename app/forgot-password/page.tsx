import { Metadata } from "next"
import { getServerTranslation } from "@/lib/server-i18n"
import { cookies } from "next/headers"
import { ForgotPasswordContent } from "@/components/forgot-password-content"

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get("user-language")
  let lang = "pt" // Default to PT if no cookie

  if (languageCookie?.value === "en" || languageCookie?.value === "pt") {
    lang = languageCookie.value
  }

  const title = getServerTranslation("Forgot Password", lang as "en" | "pt");

  return {
    title,
  }
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordContent />
} 