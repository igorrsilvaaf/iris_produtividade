import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    const idNum = Number(id);
    if (!idNum || Number.isNaN(idNum))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const vote = await prisma.feedback_votes.findUnique({
      where: {
        feedback_id_user_id: { feedback_id: idNum, user_id: session.user.id },
      },
    });
    if (vote) {
      return NextResponse.json({ ok: true });
    }

    await prisma.$transaction([
      prisma.feedback_votes.create({
        data: { feedback_id: idNum, user_id: session.user.id },
      }),
      prisma.feedback.update({
        where: { id: idNum },
        data: { upvotes: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to upvote" }, { status: 500 });
  }
}
