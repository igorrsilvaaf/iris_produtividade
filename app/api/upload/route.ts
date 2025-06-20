import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const taskId = formData.get("taskId") as string

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      )
    }

    // Converter o arquivo para base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    // Criar um objeto de anexo com o conteúdo em base64
    const newAttachment = {
      type: file.type.startsWith('image/') ? 'image' : 'file',
      url: `data:${file.type};base64,${base64}`,
      name: file.name
    }

    // Se tiver taskId, atualizar a task existente
    if (taskId) {
      // Primeiro, buscar os anexos existentes da task
      const result = await sql`
        SELECT attachments FROM todos WHERE id = ${taskId}
      `

      if (!result || result.length === 0) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        )
      }

      // Pegar os anexos existentes e adicionar o novo
      // Garantir que os anexos sejam um array válido, independente de como estão armazenados no banco
      let currentAttachments = [];
      try {
        if (result[0].attachments) {
          if (Array.isArray(result[0].attachments)) {
            currentAttachments = result[0].attachments;
          } else if (typeof result[0].attachments === 'string') {
            // Tentar fazer parse se for uma string JSON
            currentAttachments = JSON.parse(result[0].attachments);
          }
        }
      } catch (error) {
        currentAttachments = [];
      }

      const updatedAttachments = [...currentAttachments, newAttachment]

      // Atualizar a task com o novo array de anexos
      await sql`
        UPDATE todos 
        SET attachments = ${JSON.stringify(updatedAttachments)}
        WHERE id = ${taskId}
      `
    }

    return NextResponse.json(newAttachment)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
} 