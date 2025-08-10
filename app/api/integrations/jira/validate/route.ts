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
    const email = (url.searchParams.get("email") || "").trim();

    const integ = await prisma.user_integrations.findUnique({
      where: { user_id: session.user.id },
    });
    if (!integ?.jira_token) {
      return NextResponse.json(
        { error: "Token Jira não configurado" },
        { status: 400 }
      );
    }
    const domain = (integ?.jira_domain || "").trim();
    if (!domain) {
      return NextResponse.json(
        { error: "Domínio Jira não configurado" },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });
    }

    const resp = await fetch(`https://${domain}/rest/api/3/myself`, {
      headers: {
        Authorization: `Basic ${btoa(`${email}:${integ.jira_token}`)}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!resp.ok) {
      return NextResponse.json(
        { ok: false, provider: "jira", status: resp.status },
        { status: 200 }
      );
    }
    const data = await resp.json();
    return NextResponse.json({
      ok: true,
      provider: "jira",
      user: { accountId: data.accountId, displayName: data.displayName },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao validar Jira" },
      { status: 500 }
    );
  }
}
