import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: params.id },
      include: { task: true },
    })

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 })
    }

    // Verificar se o usuário tem acesso à task
    if (attachment.task.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Converter o conteúdo base64 de volta para buffer
    const buffer = Buffer.from(attachment.content!, 'base64')

    // Retornar o arquivo com o tipo MIME correto
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': attachment.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${attachment.name}"`,
      },
    })
  } catch (error) {
    console.error("Error serving attachment:", error)
    return NextResponse.json(
      { error: "Failed to serve attachment" },
      { status: 500 }
    )
  }
} 