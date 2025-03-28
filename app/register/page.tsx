import { RegisterForm } from "@/components/register-form"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function RegisterPage() {
  const session = await getSession()

  if (session) {
    redirect("/app")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-red-500"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Igão To-Do-List</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign up to get started with Igão To-Do-List</p>
        </div>
        <RegisterForm />
        <div className="text-center text-sm">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

