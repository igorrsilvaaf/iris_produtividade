import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const { jql, domain } = await request.json();
    if (!jql || !domain)
      return NextResponse.json(
        { error: "jql e domain obrigatórios" },
        { status: 400 }
      );
    const integ = await prisma.user_integrations.findUnique({
      where: { user_id: session.user.id },
    });
    if (!integ?.jira_token)
      return NextResponse.json(
        { error: "Token Jira não configurado" },
        { status: 400 }
      );
    const url = `https://${domain}/rest/api/3/search`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`email:${integ.jira_token}`)}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jql, maxResults: 50 }),
    });
    if (!resp.ok)
      return NextResponse.json(
        { error: `Jira: ${resp.statusText}` },
        { status: resp.status }
      );
    const data = await resp.json();
    return NextResponse.json({ issues: data?.issues || [] });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao importar do Jira" },
      { status: 500 }
    );
  }
}
