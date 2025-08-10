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
    const { repo, title, body: issueBody } = body || {};
    if (!repo || !title)
      return NextResponse.json(
        { error: "repo e title são obrigatórios" },
        { status: 400 }
      );
    const integ = await prisma.user_integrations.findUnique({
      where: { user_id: session.user.id },
    });
    if (!integ?.github_pat)
      return NextResponse.json(
        { error: "Token GitHub não configurado" },
        { status: 400 }
      );
    const resp = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integ.github_pat}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, body: issueBody || "" }),
    });
    if (!resp.ok)
      return NextResponse.json(
        { error: `GitHub: ${resp.statusText}` },
        { status: resp.status }
      );
    const data = await resp.json();
    return NextResponse.json({ issue: data });
  } catch (e) {
    return NextResponse.json({ error: "Erro ao criar issue" }, { status: 500 });
  }
}
