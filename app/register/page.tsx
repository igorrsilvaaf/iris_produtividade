import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RegisterContent } from "@/components/register-content"

export default async function RegisterPage() {
  const session = await getSession()

  if (session) {
    redirect("/app")
  }

  return <RegisterContent />
}

