import { NextRequest, NextResponse } from "next/server"
import prisma from "../../../../lib/prisma"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get("email")
  
  if (!email) {
    return NextResponse.json(
      { message: "Email parameter is required" },
      { status: 400 }
    )
  }

  try {
    const existingUser = await prisma.users.findUnique({
      where: { email }
    })

    const emailExists = !!existingUser
    
    return NextResponse.json(
      { available: !emailExists },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to check email availability", available: true },
      { status: 500 }
    )
  }
} 