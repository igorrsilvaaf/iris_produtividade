import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const taskId = formData.get("taskId") as string;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Verificar se a tarefa existe e pertence ao usuário
    const task = await prisma.todos.findFirst({
      where: {
        id: parseInt(taskId),
        user_id: session.user.id,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Converter o arquivo para base64 (por enquanto)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");

    // Criar anexo na nova tabela
    const attachment = await prisma.attachments.create({
      data: {
        user_id: session.user.id,
        entity_type: "task",
        entity_id: parseInt(taskId),
        file_name: file.name,
        original_name: file.name,
        file_path: `data:${file.type};base64,${base64}`,
        file_size: BigInt(file.size),
        mime_type: file.type,
        alt_text: null,
        description: null,
      },
    });

    // Sincronizar também no JSON de anexos da tarefa para o frontend
    try {
      const existingAttachmentsRaw = task.attachments;
      let existingAttachments: any[] = [];
      if (Array.isArray(existingAttachmentsRaw)) {
        existingAttachments = existingAttachmentsRaw as any[];
      } else if (typeof existingAttachmentsRaw === "string") {
        try {
          existingAttachments = JSON.parse(
            existingAttachmentsRaw as unknown as string
          );
        } catch {
          existingAttachments = [];
        }
      }

      const newAttachmentForTask = {
        id: attachment.id,
        type: file.type.startsWith("image/") ? "image" : "file",
        url: attachment.file_path,
        name: attachment.file_name,
        size: Number(attachment.file_size),
      };

      const updatedAttachments = [...existingAttachments, newAttachmentForTask];

      await prisma.todos.update({
        where: { id: parseInt(taskId) },
        data: { attachments: updatedAttachments, updated_at: new Date() },
      });
    } catch (syncError) {
      console.error("Error syncing attachment to task JSON:", syncError);
    }

    return NextResponse.json({
      id: attachment.id,
      type: file.type.startsWith("image/") ? "image" : "file",
      url: attachment.file_path,
      name: attachment.file_name,
      size: Number(attachment.file_size),
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
