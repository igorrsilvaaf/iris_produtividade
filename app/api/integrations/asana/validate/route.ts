import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const integ = await prisma.user_integrations.findUnique({
      where: { user_id: session.user.id },
    });
    if (!integ?.asana_pat) {
      return NextResponse.json(
        { error: "Token Asana não configurado" },
        { status: 400 }
      );
    }

    const resp = await fetch("https://app.asana.com/api/1.0/users/me", {
      headers: { Authorization: `Bearer ${integ.asana_pat}` },
      cache: "no-store",
    });

    if (!resp.ok) {
      return NextResponse.json(
        { ok: false, provider: "asana", status: resp.status },
        { status: 200 }
      );
    }
    const data = await resp.json();
    return NextResponse.json({
      ok: true,
      provider: "asana",
      user: { gid: data?.data?.gid, name: data?.data?.name },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao validar Asana" },
      { status: 500 }
    );
  }
}
