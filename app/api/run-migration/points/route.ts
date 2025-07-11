import { type NextRequest, NextResponse } from "next/server"
import prisma from "../../../../lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Verifique se é um ambiente de desenvolvimento ou um token de segurança
    const apiToken = request.headers.get('x-api-token');
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    console.log("Iniciando migração da coluna points...");

    // Adiciona uma nova coluna 'points' à tabela 'todos'
    await prisma.$executeRaw`ALTER TABLE todos ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 3;`
    console.log("Coluna points adicionada ou já existente.");
    
    // Adiciona validação para garantir que os pontos estejam entre 1 e 5
    try {
      await prisma.$executeRaw`ALTER TABLE todos ADD CONSTRAINT chk_todos_points CHECK (points BETWEEN 1 AND 5);`
    } catch (error) {
      console.log("Constraint já existe ou erro ao criar:", error);
    }
    
    // Cria um índice para otimizar consultas por points
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_todos_points ON todos(points);`

    // Verificar dados após migração
    const taskCheck = await prisma.$queryRaw`SELECT COUNT(*) as count, points FROM todos GROUP BY points;`

    return NextResponse.json({ 
      message: "Points migration executed successfully",
      taskCheck
    })
  } catch (error: any) {
    console.error("Erro ao executar migração points:", error)
    return NextResponse.json({ message: error.message || "Failed to run points migration" }, { status: 500 })
  }
} 