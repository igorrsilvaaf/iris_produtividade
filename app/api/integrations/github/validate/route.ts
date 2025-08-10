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
    if (!integ?.github_pat) {
      return NextResponse.json(
        { error: "Token GitHub não configurado" },
        { status: 400 }
      );
    }

    const resp = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${integ.github_pat}`,
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    });

    if (!resp.ok) {
      return NextResponse.json(
        { ok: false, provider: "github", status: resp.status },
        { status: 200 }
      );
    }

    const data = await resp.json();
    return NextResponse.json({
      ok: true,
      provider: "github",
      user: { id: data.id, login: data.login },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao validar GitHub" },
      { status: 500 }
    );
  }
}
