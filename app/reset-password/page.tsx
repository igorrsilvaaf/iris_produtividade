import { Metadata } from "next"
import { getServerTranslation } from "@/lib/server-i18n"
import { cookies } from "next/headers"
import { ResetPasswordContent } from "@/components/reset-password-content"

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get("user-language")
  let lang = "pt" // Default to PT if no cookie

  if (languageCookie?.value === "en" || languageCookie?.value === "pt") {
    lang = languageCookie.value
  }

  const title = getServerTranslation("Reset Password", lang as "en" | "pt");

  return {
    title,
  }
}

interface ResetPasswordPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams.token as string || "";
  
  return <ResetPasswordContent token={token} />
} 