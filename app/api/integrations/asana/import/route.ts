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
    const projectId = url.searchParams.get("projectId");
    if (!projectId)
      return NextResponse.json(
        { error: "projectId é obrigatório" },
        { status: 400 }
      );
    const integ = await prisma.user_integrations.findUnique({
      where: { user_id: session.user.id },
    });
    if (!integ?.asana_pat)
      return NextResponse.json(
        { error: "Token Asana não configurado" },
        { status: 400 }
      );
    const resp = await fetch(
      `https://app.asana.com/api/1.0/projects/${projectId}/tasks?completed_since=now&limit=50`,
      {
        headers: { Authorization: `Bearer ${integ.asana_pat}` },
        cache: "no-store",
      }
    );
    if (!resp.ok)
      return NextResponse.json(
        { error: `Asana: ${resp.statusText}` },
        { status: resp.status }
      );
    const data = await resp.json();
    return NextResponse.json({ tasks: data?.data || [] });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao importar do Asana" },
      { status: 500 }
    );
  }
}
