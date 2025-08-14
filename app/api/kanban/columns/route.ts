import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { KanbanColumnData, DEFAULT_COLUMNS } from '@/lib/types/kanban'

// GET - Buscar todas as colunas do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar colunas customizadas do usuário
    const customColumns = await prisma.kanban_columns.findMany({
      where: {
        user_id: session.user.id
      },
      orderBy: {
        order: 'asc'
      }
    })

    // Se não há colunas customizadas, retornar as padrão
    if (customColumns.length === 0) {
      return NextResponse.json({
        columns: DEFAULT_COLUMNS,
        columnOrder: DEFAULT_COLUMNS.map(col => col.id)
      })
    }

    // Converter para formato KanbanColumnData
    const columns = customColumns.map(col => ({
      id: col.id,
      title: col.title,
      taskIds: [], // Será preenchido pelo frontend
      order: col.order,
      color: col.color || undefined,
      isDefault: col.is_default,
      lastUpdated: col.updated_at.getTime()
    }))

    return NextResponse.json({
      columns,
      columnOrder: columns.map(col => col.id)
    })
  } catch (error) {
    console.error('Erro ao buscar colunas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova coluna
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, color, order } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Título é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma coluna com esse título
    const existingColumn = await prisma.kanban_columns.findFirst({
      where: {
        user_id: session.user.id,
        title: title.trim()
      }
    })

    if (existingColumn) {
      return NextResponse.json(
        { error: 'Já existe uma coluna com esse título' },
        { status: 400 }
      )
    }

    // Determinar a ordem se não fornecida
    let columnOrder = order
    if (columnOrder === undefined) {
      const maxOrder = await prisma.kanban_columns.findFirst({
        where: { user_id: session.user.id },
        orderBy: { order: 'desc' }
      })
      columnOrder = (maxOrder?.order || 0) + 1
    }

    // Criar nova coluna
    const newColumn = await prisma.kanban_columns.create({
      data: {
        id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        color: color || null,
        order: columnOrder,
        is_default: false,
        user_id: session.user.id
      }
    })

    const columnData: KanbanColumnData = {
      id: newColumn.id,
      title: newColumn.title,
      taskIds: [],
      order: newColumn.order,
      color: newColumn.color || undefined,
      isDefault: newColumn.is_default,
      lastUpdated: newColumn.updated_at.getTime()
    }

    return NextResponse.json(columnData, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar coluna:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar ordem das colunas
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { columnOrder } = body

    if (!Array.isArray(columnOrder)) {
      return NextResponse.json(
        { error: 'columnOrder deve ser um array' },
        { status: 400 }
      )
    }

    // Atualizar ordem das colunas usando transação para melhor performance
    await prisma.$transaction(
      columnOrder.map((columnId: string, index: number) =>
        prisma.kanban_columns.updateMany({
          where: {
            id: columnId,
            user_id: session.user.id
          },
          data: {
            order: index
          }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao reordenar colunas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}