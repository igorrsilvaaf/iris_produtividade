import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { searchTasks } from "@/lib/todos";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { message: "Search query is required" },
        { status: 400 },
      );
    }

    const trimmedQuery = query.trim().slice(0, 50);

    try {
      const tasks = await searchTasks(session.user.id, trimmedQuery);

      if (!Array.isArray(tasks)) {
        return NextResponse.json(
          {
            tasks: [],
            message: "Formato de resposta inválido",
          },
          { status: 500 },
        );
      }

      if (tasks.length > 0) {
        console.log("Exemplo do primeiro resultado:", JSON.stringify(tasks[0]));
      }

      const response = NextResponse.json(
        { tasks },
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      );

      return response;
    } catch (searchError) {
      console.error("Erro na função searchTasks:", searchError);
      throw searchError;
    }
  } catch (error: unknown) {
    console.error("Erro na API de busca:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to search tasks";

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
