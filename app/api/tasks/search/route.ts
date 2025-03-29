import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { searchTasks } from "@/lib/todos"

export async function GET(request: NextRequest) {
  try {
    console.log("👉 API de pesquisa recebeu uma solicitação");
    
    const session = await getSession()
    
    if (!session) {
      console.log("❌ Acesso não autorizado: sem sessão");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }
    
    console.log("✅ Sessão válida:", session.user.id);

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query) {
      console.log("❌ Termo de busca não fornecido");
      return NextResponse.json({ message: "Search query is required" }, { status: 400 })
    }
    
    console.log("🔍 Pesquisando por:", query);

    const tasks = await searchTasks(session.user.id, query)
    
    console.log(`✅ Pesquisa concluída. Encontradas ${tasks?.length || 0} tarefas`);

    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error("❌ Erro na API de pesquisa:", error);
    return NextResponse.json({ message: error.message || "Failed to search tasks" }, { status: 500 })
  }
}

