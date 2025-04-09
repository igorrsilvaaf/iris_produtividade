import Link from "next/link"
import { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { getServerTranslation } from "@/lib/server-i18n"
import { cookies } from "next/headers"

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
  return (
    <div className="w-full max-w-md mx-auto space-y-6 py-12">
      <div className="flex flex-col space-y-2 text-center">
        <Link href="/" className="mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-10 w-10 text-red-500"
          >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </Link>
      </div>
      <div className="bg-card text-card-foreground shadow-lg rounded-lg p-8 border">
        <ForgotPasswordForm />
      </div>
    </div>
  )
} 