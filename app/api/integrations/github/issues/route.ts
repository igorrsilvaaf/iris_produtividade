import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const url = new URL(request.url);
    const repo = url.searchParams.get("repo");
    if (!repo)
      return NextResponse.json(
        { error: "repo é obrigatório (owner/repo)" },
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
    const resp = await fetch(
      `https://api.github.com/repos/${repo}/issues?state=open&per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${integ.github_pat}`,
          Accept: "application/vnd.github+json",
        },
        cache: "no-store",
      }
    );
    if (!resp.ok)
      return NextResponse.json(
        { error: `GitHub: ${resp.statusText}` },
        { status: resp.status }
      );
    const data = await resp.json();
    return NextResponse.json({ issues: data });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao listar issues" },
      { status: 500 }
    );
  }
}
