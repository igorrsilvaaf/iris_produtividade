import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attachmentId = parseInt(resolvedParams.id, 10);

    if (isNaN(attachmentId)) {
      return NextResponse.json(
        { error: "Invalid attachment ID" },
        { status: 400 }
      );
    }

    const attachment = await prisma.attachments.findFirst({
      where: {
        id: attachmentId,
        user_id: session.user.id,
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    if (
      attachment.file_path.startsWith("http://") ||
      attachment.file_path.startsWith("https://")
    ) {
      return NextResponse.redirect(attachment.file_path);
    }

    // Data URL armazenado no banco
    if (attachment.file_path.startsWith("data:")) {
      try {
        const match = attachment.file_path.match(/^data:([^;]+);base64,(.*)$/);
        if (!match) {
          return NextResponse.json(
            { error: "Invalid data URL" },
            { status: 400 }
          );
        }
        const mime = match[1];
        const base64Data = match[2];
        const buffer = Buffer.from(base64Data, "base64");

        const headers = new Headers();
        headers.set(
          "Content-Type",
          mime || attachment.mime_type || "application/octet-stream"
        );
        headers.set(
          "Content-Disposition",
          `attachment; filename="${attachment.original_name}"`
        );
        headers.set("Content-Length", buffer.length.toString());

        return new NextResponse(buffer, { status: 200, headers });
      } catch (e) {
        return NextResponse.json(
          { error: "Failed to decode data URL" },
          { status: 500 }
        );
      }
    }

    // Caminho local relativo dentro de public/
    try {
      const fs = require("fs").promises;
      const path = require("path");
      const filePath = path.isAbsolute(attachment.file_path)
        ? attachment.file_path
        : path.join(process.cwd(), "public", attachment.file_path);
      const buffer = await fs.readFile(filePath);
      const headers = new Headers();
      headers.set(
        "Content-Type",
        attachment.mime_type || "application/octet-stream"
      );
      headers.set(
        "Content-Disposition",
        `attachment; filename="${attachment.original_name}"`
      );
      headers.set("Content-Length", buffer.length.toString());
      return new NextResponse(buffer, { status: 200, headers });
    } catch (fileError) {
      return NextResponse.json(
        { error: "File not found on server" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
