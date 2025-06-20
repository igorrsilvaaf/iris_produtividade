import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File
    
    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 })
    }
    
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: "Invalid file type. Please upload an image." }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File too large. Maximum size is 5MB." }, { status: 400 })
    }

    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `avatar-${session.user.id}-${uuidv4()}.${fileExtension}`

    const upload = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    })

    await sql`
      UPDATE users
      SET avatar_url = ${upload.url}
      WHERE id = ${session.user.id}
    `

    return NextResponse.json({ 
      message: "Avatar updated successfully", 
      avatar_url: upload.url 
    })
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to upload avatar" }, 
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
} 