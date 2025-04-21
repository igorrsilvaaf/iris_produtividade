import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file received." },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filename = file.name.replace(/\.[^/.]+$/, "") + '-' + uniqueSuffix + extname(file.name)
    
    // Save to public/uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    try {
      await writeFile(join(uploadDir, filename), buffer)
    } catch (error) {
      console.error('Error saving file:', error)
      // If directory doesn't exist, create it and try again
      await mkdir(uploadDir, { recursive: true })
      await writeFile(join(uploadDir, filename), buffer)
    }

    return NextResponse.json({ 
      url: `/uploads/${filename}`,
      name: file.name
    })
  } catch (error) {
    console.error('Error handling file upload:', error)
    return NextResponse.json(
      { error: "Error uploading file." },
      { status: 500 }
    )
  }
} 