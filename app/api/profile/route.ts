import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "../../../lib/supabase"

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, email, avatar_url } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required" }, { status: 400 })
    }

    const existingUser = await sql`
      SELECT id FROM users
      WHERE email = ${email} AND id != ${session.user.id}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ message: "Email is already in use" }, { status: 400 })
    }

    const updatedUser = await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, avatar_url = ${avatar_url}
      WHERE id = ${session.user.id}
      RETURNING id, name, email, avatar_url
    `

    return NextResponse.json({ user: updatedUser[0] })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update profile" }, { status: 500 })
  }
}
