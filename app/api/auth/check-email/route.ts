import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

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
    const result = await sql`
      SELECT COUNT(*) as count
      FROM users
      WHERE email = ${email}
    `

    const emailExists = result[0].count > 0
    
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