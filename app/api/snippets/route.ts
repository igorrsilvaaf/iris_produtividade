import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    const language = url.searchParams.get("language");
    const search = url.searchParams.get("q");

    const where: any = { user_id: session.user.id };
    if (projectId) where.project_id = parseInt(projectId);
    if (language) where.language = language;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const snippets = await prisma.snippets.findMany({
      where,
      orderBy: { created_at: "desc" },
    });
    return NextResponse.json({ snippets });
  } catch (error: any) {
    console.error("[snippets][GET]", error);
    return NextResponse.json(
      { message: error?.message || "Failed to fetch snippets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content : "";
    const language =
      typeof body.language === "string" ? body.language.trim() : null;
    const projectId =
      body.projectId != null ? parseInt(String(body.projectId), 10) : null;
    const tags = Array.isArray(body.tags) ? body.tags : undefined;

    if (!title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }
    if (!content) {
      return NextResponse.json(
        { message: "Content is required" },
        { status: 400 }
      );
    }

    const snippet = await prisma.snippets.create({
      data: {
        user_id: session.user.id,
        title,
        content,
        language: language || undefined,
        project_id: projectId || undefined,
        tags: tags as any,
      },
    });

    return NextResponse.json({ snippet }, { status: 201 });
  } catch (error: any) {
    console.error("[snippets][POST]", error);
    return NextResponse.json(
      { message: error?.message || "Failed to create snippet" },
      { status: 500 }
    );
  }
}
