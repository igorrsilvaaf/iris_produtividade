import { NextResponse } from "next/server"
import { logout } from "@/lib/auth"

export async function POST() {
  try {
    await logout()
    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    return NextResponse.json({ message: "Failed to logout" }, { status: 500 })
  }
}

