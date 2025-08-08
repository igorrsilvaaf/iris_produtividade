import { type NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }
    const { taskId } = await params;

    const all = await prisma.task_comments.findMany({
      where: { task_id: parseInt(taskId) },
      include: {
        user: { select: { name: true, avatar_url: true } },
      },
      orderBy: { created_at: "asc" },
    });

    const nodes = all.map((c) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at as unknown as string,
      updated_at: c.updated_at as unknown as string,
      user_id: c.user_id,
      parent_id: c.parent_id,
      author_name: c.user.name,
      author_avatar: c.user.avatar_url,
      likes_count: (c as any).likes_count,
      is_liked: (c as any).is_liked,
      replies: [] as any[],
    }));

    const byId = new Map<number, any>();
    nodes.forEach((n) => byId.set(n.id, n));
    const roots: any[] = [];
    nodes.forEach((n) => {
      if (n.parent_id) {
        const parent = byId.get(n.parent_id);
        if (parent) parent.replies.push(n);
        else roots.push(n);
      } else {
        roots.push(n);
      }
    });

    return NextResponse.json(roots);
  } catch (error) {
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }
    const userId = session.user.id;

    const { taskId } = await params;
    const { content, parent_id } = await request.json();

    if (!content || typeof content !== "string" || content.trim() === "") {
      return new NextResponse("Conteúdo do comentário é obrigatório", {
        status: 400,
      });
    }

    const newComment = await prisma.task_comments.create({
      data: {
        task_id: parseInt(taskId),
        user_id: userId,
        content: content.trim(),
        ...(parent_id && { parent_id: parseInt(parent_id) }),
      },
      include: {
        user: {
          select: {
            name: true,
            avatar_url: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...newComment,
        author_name: newComment.user.name,
        author_avatar: newComment.user.avatar_url,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
