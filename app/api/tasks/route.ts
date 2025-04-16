import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createTask } from "@/lib/todos"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { title, description, dueDate, priority, projectId, labelIds } = await request.json()

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 })
    }

    // Validar a data se fornecida
    if (dueDate) {
      try {
        const dateObj = new Date(dueDate);
        console.log(`[POST /api/tasks] Data recebida: ${dueDate}`);
        console.log(`[POST /api/tasks] Data convertida: ${dateObj.toString()}`);
        
        // Verificar se a data é válida
        if (isNaN(dateObj.getTime())) {
          console.error(`[POST /api/tasks] Erro: Data inválida ${dueDate}`);
          return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
        }
      } catch (error) {
        console.error(`[POST /api/tasks] Erro ao processar data: ${error}`);
        return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
      }
    }

    const task = await createTask(session.user.id, title, description, dueDate, priority, projectId)

    // Adicionar etiquetas à tarefa, se fornecidas
    if (labelIds && labelIds.length > 0) {
      for (const labelId of labelIds) {
        await sql`
          INSERT INTO todo_labels (todo_id, label_id)
          VALUES (${task.id}, ${labelId})
          ON CONFLICT (todo_id, label_id) DO NOTHING
        `
      }
    }

    return NextResponse.json({ task }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create task" }, { status: 500 })
  }
}

