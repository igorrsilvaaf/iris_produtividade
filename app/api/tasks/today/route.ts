import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getTodayTasks } from "@/lib/todos"


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}


export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { 
        status: 401,
        headers: corsHeaders
      })
    }

    const tasks = await getTodayTasks(session.user.id)

    return NextResponse.json({ tasks }, { headers: corsHeaders })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to fetch today's tasks" }, { 
      status: 500,
      headers: corsHeaders
    })
  }
} 