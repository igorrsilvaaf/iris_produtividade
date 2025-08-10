import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const q = searchParams.get("q") || undefined;
    const take = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const skip = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (q)
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];

    const [items, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: [{ upvotes: "desc" }, { created_at: "desc" }],
        take,
        skip,
      }),
      prisma.feedback.count({ where }),
    ]);

    return NextResponse.json({ items, total });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: any = null;
    try {
      body = await req.json();
    } catch (e: any) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const type = typeof body?.type === "string" ? body.type : "suggestion";
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description =
      typeof body?.description === "string" ? body.description.trim() : "";
    const severity =
      typeof body?.severity === "string" ? body.severity : "medium";

    if (!title || !description) {
      return NextResponse.json(
        { error: "Missing title or description" },
        { status: 400 }
      );
    }

    let created;
    try {
      created = await prisma.feedback.create({
        data: {
          user_id: session.user.id,
          type,
          title,
          description,
          severity,
        },
      });
    } catch (dbErr: any) {
      console.error(
        "Prisma create feedback error:",
        dbErr?.code,
        dbErr?.message
      );
      if (dbErr?.code === "P2003") {
        return NextResponse.json(
          { error: "User not found for feedback" },
          { status: 400 }
        );
      }
      throw dbErr;
    }

    try {
      await sendEmail({
        to: process.env.FEEDBACK_EMAIL_TO || "iristodo6@gmail.com",
        subject: `[Íris] Novo feedback (${created.type}/${created.severity})`,
        html: `<h3>Nova entrada de feedback</h3>
<p><b>Título:</b> ${created.title}</p>
<p><b>Descrição:</b> ${created.description}</p>
<p><b>Tipo:</b> ${created.type} • <b>Impacto:</b> ${created.severity}</p>
<p><b>ID:</b> ${created.id} • <b>Status:</b> ${created.status} • <b>Upvotes:</b> ${created.upvotes}</p>`,
      });
    } catch (mailErr) {
      console.error("Feedback email send error", mailErr);
    }

    return NextResponse.json({ feedback: created });
  } catch (e) {
    console.error("POST /api/feedback error:", e);
    const message = (e as any)?.message || "Failed to create feedback";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
