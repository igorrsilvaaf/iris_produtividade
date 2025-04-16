import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { updateTask, deleteTask } from "@/lib/todos"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)

    const task = await updateTask(taskId, session.user.id, {})

    return NextResponse.json({ task })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to get task" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)
    const updates = await request.json()

    // Validar a data se fornecida
    if (updates.dueDate !== undefined) {
      console.log(`[PATCH /api/tasks/${taskId}] Data recebida para atualização: ${updates.dueDate}`);
      
      if (updates.dueDate !== null) {
        try {
          const dateObj = new Date(updates.dueDate);
          console.log(`[PATCH /api/tasks/${taskId}] Data convertida: ${dateObj.toString()}`);
          
          // Verificar se a data é válida
          if (isNaN(dateObj.getTime())) {
            console.error(`[PATCH /api/tasks/${taskId}] Erro: Data inválida ${updates.dueDate}`);
            return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
          }
        } catch (error) {
          console.error(`[PATCH /api/tasks/${taskId}] Erro ao processar data: ${error}`);
          return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
        }
      } else {
        console.log(`[PATCH /api/tasks/${taskId}] Removendo data da tarefa`);
      }
    }

    const task = await updateTask(taskId, session.user.id, updates)

    return NextResponse.json({ task })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = Number.parseInt(resolvedParams.id)

    await deleteTask(taskId, session.user.id)

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to delete task" }, { status: 500 })
  }
}

