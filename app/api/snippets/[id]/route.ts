import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const snippet = await prisma.snippets.findFirst({
      where: { id: parseInt(id, 10), user_id: session.user.id },
    });
    if (!snippet)
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ snippet });
  } catch (error: any) {
    console.error("[snippets/:id][GET]", error);
    return NextResponse.json(
      { message: error?.message || "Failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const title =
      typeof body.title === "string" ? body.title.trim() : undefined;
    const content = typeof body.content === "string" ? body.content : undefined;
    const language =
      typeof body.language === "string" ? body.language.trim() : undefined;
    const projectId =
      body.projectId != null ? parseInt(String(body.projectId), 10) : undefined;
    const tags = Array.isArray(body.tags) ? body.tags : undefined;

    const updated = await prisma.snippets.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(language !== undefined ? { language } : {}),
        ...(projectId !== undefined ? { project_id: projectId } : {}),
        ...(tags !== undefined ? { tags: tags as any } : {}),
        updated_at: new Date(),
      },
    });
    return NextResponse.json({ snippet: updated });
  } catch (error: any) {
    console.error("[snippets/:id][PATCH]", error);
    return NextResponse.json(
      { message: error?.message || "Failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await prisma.snippets.delete({ where: { id: parseInt(id, 10) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[snippets/:id][DELETE]", error);
    return NextResponse.json(
      { message: error?.message || "Failed" },
      { status: 500 }
    );
  }
}
