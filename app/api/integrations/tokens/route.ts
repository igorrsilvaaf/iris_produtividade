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
    const githubToken =
      typeof body.githubToken === "string" && body.githubToken.trim()
        ? body.githubToken.trim()
        : null;
    const jiraToken =
      typeof body.jiraToken === "string" && body.jiraToken.trim()
        ? body.jiraToken.trim()
        : null;
    const jiraDomain =
      typeof body.jiraDomain === "string" && body.jiraDomain.trim()
        ? body.jiraDomain.trim()
        : null;
    const asanaToken =
      typeof body.asanaToken === "string" && body.asanaToken.trim()
        ? body.asanaToken.trim()
        : null;
    await prisma.user_integrations.upsert({
      where: { user_id: session.user.id },
      update: {
        github_pat: githubToken,
        jira_token: jiraToken,
        jira_domain: jiraDomain,
        asana_pat: asanaToken,
        updated_at: new Date(),
      },
      create: {
        user_id: session.user.id,
        github_pat: githubToken,
        jira_token: jiraToken,
        jira_domain: jiraDomain,
        asana_pat: asanaToken,
      },
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao salvar tokens" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const integ = await prisma.user_integrations.findUnique({
      where: { user_id: session.user.id },
      select: {
        github_pat: true,
        jira_token: true,
        jira_domain: true,
        asana_pat: true,
      },
    });
    return NextResponse.json({
      github: { configured: Boolean(integ?.github_pat) },
      jira: {
        configured: Boolean(integ?.jira_token),
        domain: integ?.jira_domain || null,
      },
      asana: { configured: Boolean(integ?.asana_pat) },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao carregar integrações" },
      { status: 500 }
    );
  }
}
