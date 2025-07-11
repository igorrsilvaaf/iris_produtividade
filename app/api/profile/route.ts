import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import prisma from "../../../lib/prisma"

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

    const existingUser = await prisma.users.findFirst({
      where: {
        email: email,
        id: { not: session.user.id }
      }
    })

    if (existingUser) {
      return NextResponse.json({ message: "Email is already in use" }, { status: 400 })
    }

    const updatedUser = await prisma.users.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
        avatar_url,
        updated_at: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true
      }
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update profile" }, { status: 500 })
  }
}
