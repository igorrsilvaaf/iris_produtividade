import { type NextRequest, NextResponse } from "next/server"
import { login, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    const user = await login(email, password)
    await createSession(user.id)

    return NextResponse.json({ user }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Login failed" }, { status: 401 })
  }
}

