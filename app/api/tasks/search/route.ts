import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { searchTasks } from "@/lib/todos"

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  console.log("API de busca iniciada");
  
  try {
    const session = await getSession();
    console.log("Resultado da sessão:", session ? `Usuário ID: ${session.user.id}` : "Sem sessão");
    
    if (!session) {
      console.log("Erro de autenticação: usuário não está logado");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    console.log("Parâmetro de busca recebido:", query);

    if (!query) {
      console.log("Erro: parâmetro de busca não fornecido");
      return NextResponse.json({ message: "Search query is required" }, { status: 400 });
    }
    
    // Limitar o tamanho da consulta para evitar sobrecarga
    const trimmedQuery = query.trim().slice(0, 50);
    console.log("Consultando tarefas para o usuário", session.user.id, "com termo:", trimmedQuery);
    
    try {
      const tasks = await searchTasks(session.user.id, trimmedQuery);
      console.log("Busca completada, encontradas", tasks.length, "tarefas");
      
      // Verificar se o resultado é um array válido
      if (!Array.isArray(tasks)) {
        console.error("Erro: searchTasks não retornou um array válido");
        return NextResponse.json({ 
          tasks: [],
          message: "Formato de resposta inválido" 
        }, { status: 500 });
      }
      
      // Log detalhado do primeiro resultado (se houver)
      if (tasks.length > 0) {
        console.log("Exemplo do primeiro resultado:", JSON.stringify(tasks[0]));
      }
      
      // Definir cabeçalhos para evitar problemas de cache
      const response = NextResponse.json({ tasks }, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      return response;
    } catch (searchError) {
      console.error("Erro na função searchTasks:", searchError);
      throw searchError;
    }
  } catch (error: unknown) {
    console.error("Erro na API de busca:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to search tasks";
      
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

