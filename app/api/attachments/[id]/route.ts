import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const attachment = await prisma.attachment.findUnique({
      where: { id: Number(resolvedParams.id) },
      include: { task: true },
    })

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 })
    }

    if (attachment.task.user_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    if (attachment.type === 'text/uri-list' || attachment.type === 'text/plain') {
      const url = attachment.content;
      return NextResponse.redirect(url);
    }

    if (attachment.type === 'text/uri-list' || attachment.type === 'text/plain') {
      const url = attachment.content;
      return NextResponse.redirect(url);
    }

    const buffer = Buffer.from(attachment.content!, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': attachment.type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${attachment.name}"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to serve attachment" },
      { status: 500 }
    )
  }
}
