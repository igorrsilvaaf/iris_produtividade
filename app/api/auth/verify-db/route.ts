import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("[VerifyDB] Verificando tabela password_reset_tokens");
    
    // Verificar se a tabela password_reset_tokens existe
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
      ) as exists;
    `;

    if (!tableExists[0].exists) {
      console.log("[VerifyDB] Tabela password_reset_tokens não existe, criando...");
      
      // Criar a tabela
      await sql`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token VARCHAR(255) NOT NULL UNIQUE,
          expires TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      // Criar índices
      await sql`
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
      `;
      
      await sql`
        CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
      `;
      
      console.log("[VerifyDB] Tabela password_reset_tokens criada com sucesso");
      
      return NextResponse.json({ 
        message: "Password reset tokens table created", 
        created: true 
      });
    }
    
    console.log("[VerifyDB] Tabela password_reset_tokens já existe");
    return NextResponse.json({ 
      message: "Password reset tokens table already exists", 
      created: false 
    });
  } catch (error) {
    console.error("[VerifyDB] Erro ao verificar tabela:", error);
    return NextResponse.json(
      { message: "Failed to verify database structure" },
      { status: 500 }
    );
  }
} 