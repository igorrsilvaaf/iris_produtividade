import { NextRequest, NextResponse } from "next/server"
import prisma from "../../../../lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Verificar se consegue acessar o banco de dados
    const count = await prisma.users.count()
    
    return NextResponse.json({ 
      message: "Database connection successful", 
      userCount: count 
    });
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      { message: "Failed to connect to database" },
      { status: 500 }
    );
  }
} 