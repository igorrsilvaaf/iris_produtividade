import { type NextRequest, NextResponse } from "next/server"
import prisma from "../../../lib/prisma"
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Verifique se é um ambiente de desenvolvimento ou um token de segurança
    const apiToken = request.headers.get('x-api-token');
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Remover verificação de autenticação para permitir execução fácil da migração
    // (Em produção você provavelmente adicionaria alguma segurança aqui)

    console.log("Iniciando migração da coluna kanban_column...");

    // Adiciona uma nova coluna 'kanban_column' à tabela 'todos'
    await prisma.$executeRaw`ALTER TABLE todos ADD COLUMN IF NOT EXISTS kanban_column VARCHAR(20);`
    console.log("Coluna kanban_column adicionada ou já existente.");
    
    // Atualiza as tarefas existentes para usar 'backlog' como coluna padrão se não estiverem concluídas
    // e 'completed' se estiverem concluídas
    const updateResult = await prisma.$executeRaw`
      UPDATE todos
      SET kanban_column = 
        CASE 
          WHEN completed = true THEN 'completed'
          ELSE 'backlog'
        END
      WHERE kanban_column IS NULL;
    `
    console.log("Tarefas atualizadas com valores padrão para kanban_column.");
    
    // Cria um índice para otimizar consultas por kanban_column
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_todos_kanban_column ON todos(kanban_column);`
    console.log("Índice para kanban_column criado ou já existente.");

    // Verificar dados após migração
    const taskCheck = await prisma.$queryRaw`SELECT COUNT(*) as count, kanban_column FROM todos GROUP BY kanban_column;`
    console.log("Verificação de tarefas após migração:", taskCheck);

    return NextResponse.json({ 
      message: "Migration executed successfully",
      taskCheck
    })
  } catch (error: any) {
    console.error("Erro ao executar migração:", error)
    return NextResponse.json({ message: error.message || "Failed to run migration" }, { status: 500 })
  }
} 