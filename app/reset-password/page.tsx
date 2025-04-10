import Link from "next/link"
import { Metadata } from "next"
import { ResetPasswordForm } from "@/components/reset-password-form"
import { getServerTranslation } from "@/lib/server-i18n"
import { cookies } from "next/headers"
import { Logo } from "@/components/logo"

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
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0d10] py-12 px-4">
      <div className="flex flex-col space-y-4 text-center">
        <Logo className="mx-auto" />
      </div>
      <div className="w-full max-w-md mx-auto mt-8">
        <div className="bg-[#151821] shadow-lg rounded-lg p-8 border border-[#20232b] text-white">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  )
} 