import { type NextRequest, NextResponse } from "next/server"
import { register } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    const user = await register(name, email, password)

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Registration failed" }, { status: 400 })
  }
}

