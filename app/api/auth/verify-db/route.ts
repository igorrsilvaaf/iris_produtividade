import { NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Verificar se a tabela password_reset_tokens existe
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
      ) as exists;
    `;

    if (!tableExists[0].exists) {
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
      
      return NextResponse.json({ 
        message: "Password reset tokens table created", 
        created: true 
      });
    }
    
    return NextResponse.json({ 
      message: "Password reset tokens table already exists", 
      created: false 
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to verify database structure" },
      { status: 500 }
    );
  }
} 