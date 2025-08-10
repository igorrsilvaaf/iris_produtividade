import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const body = await request.json();
    const { taskId, url } = body || {};
    if (!taskId || !url)
      return NextResponse.json(
        { error: "taskId e url são obrigatórios" },
        { status: 400 }
      );
    const task = await prisma.todos.findFirst({
      where: { id: Number(taskId), user_id: session.user.id },
    });
    if (!task)
      return NextResponse.json(
        { error: "Tarefa não encontrada" },
        { status: 404 }
      );
    const links = Array.isArray(task.external_links)
      ? (task.external_links as any[])
      : [];
    if (!links.includes(url)) links.push(url);
    await prisma.todos.update({
      where: { id: task.id },
      data: { external_links: links, updated_at: new Date() },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao vincular" }, { status: 500 });
  }
}
