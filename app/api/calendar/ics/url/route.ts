import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const url = `${base}/api/calendar/ics`;
  return NextResponse.json({ url });
}
