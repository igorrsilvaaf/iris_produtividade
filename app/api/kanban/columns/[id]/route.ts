import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { KanbanColumnData } from '@/lib/types/kanban'

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Buscar coluna específica
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const column = await prisma.kanban_columns.findFirst({
      where: {
        id: params.id,
        user_id: session.user.id
      }
    })

    if (!column) {
      return NextResponse.json(
        { error: 'Coluna não encontrada' },
        { status: 404 }
      )
    }

    const columnData: KanbanColumnData = {
      id: column.id,
      title: column.title,
      taskIds: [], // Será preenchido pelo frontend
      order: column.order,
      color: column.color || undefined,
      isDefault: column.is_default,
      lastUpdated: column.updated_at
    }

    return NextResponse.json(columnData)
  } catch (error) {
    console.error('Erro ao buscar coluna:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar coluna específica
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, color } = body

    // Verificar se a coluna existe e pertence ao usuário
    const existingColumn = await prisma.kanban_columns.findFirst({
      where: {
        id: params.id,
        user_id: session.user.id
      }
    })

    if (!existingColumn) {
      return NextResponse.json(
        { error: 'Coluna não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se é uma coluna padrão (não pode ser editada)
    if (existingColumn.is_default) {
      return NextResponse.json(
        { error: 'Colunas padrão não podem ser editadas' },
        { status: 400 }
      )
    }

    // Verificar se já existe outra coluna com o mesmo título
    if (title && title.trim() !== existingColumn.title) {
      const duplicateColumn = await prisma.kanban_columns.findFirst({
        where: {
          user_id: session.user.id,
          title: title.trim(),
          id: { not: params.id }
        }
      })

      if (duplicateColumn) {
        return NextResponse.json(
          { error: 'Já existe uma coluna com esse título' },
          { status: 400 }
        )
      }
    }

    // Atualizar coluna
    const updatedColumn = await prisma.kanban_columns.update({
      where: {
        id: params.id
      },
      data: {
        ...(title && { title: title.trim() }),
        ...(color !== undefined && { color: color || null })
      }
    })

    const columnData: KanbanColumnData = {
      id: updatedColumn.id,
      title: updatedColumn.title,
      taskIds: [], // Será preenchido pelo frontend
      order: updatedColumn.order,
      color: updatedColumn.color || undefined,
      isDefault: updatedColumn.is_default,
      lastUpdated: updatedColumn.updated_at
    }

    return NextResponse.json(columnData)
  } catch (error) {
    console.error('Erro ao atualizar coluna:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar coluna específica
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se a coluna existe e pertence ao usuário
    const existingColumn = await prisma.kanban_columns.findFirst({
      where: {
        id: params.id,
        user_id: session.user.id
      }
    })

    if (!existingColumn) {
      return NextResponse.json(
        { error: 'Coluna não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se é uma coluna padrão (não pode ser deletada)
    if (existingColumn.is_default) {
      return NextResponse.json(
        { error: 'Colunas padrão não podem ser deletadas' },
        { status: 400 }
      )
    }

    // Verificar se há tarefas na coluna
    const tasksInColumn = await prisma.todos.count({
      where: {
        user_id: session.user.id,
        kanban_column: params.id
      }
    })

    if (tasksInColumn > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar uma coluna que contém tarefas. Mova as tarefas para outra coluna primeiro.' },
        { status: 400 }
      )
    }

    // Deletar coluna
    await prisma.kanban_columns.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar coluna:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}