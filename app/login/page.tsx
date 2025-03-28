import { LoginForm } from "@/components/login-form"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function LoginPage() {
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
            <span>Todoist Clone</span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account to continue</p>
        </div>
        <LoginForm />
        <div className="text-center text-sm">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

