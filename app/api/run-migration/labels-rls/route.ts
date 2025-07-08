import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Verificar se é ambiente de desenvolvimento
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      return NextResponse.json({ message: "Esta rota só pode ser executada em desenvolvimento" }, { status: 403 })
    }

    // Primeiro, desabilitar RLS temporariamente para limpar políticas existentes
    await sql`ALTER TABLE labels DISABLE ROW LEVEL SECURITY`

    // Remover políticas existentes se houver
    await sql`DROP POLICY IF EXISTS "Users can read their own labels" ON public.labels`
    await sql`DROP POLICY IF EXISTS "Users can insert their own labels" ON public.labels`
    await sql`DROP POLICY IF EXISTS "Users can update their own labels" ON public.labels`
    await sql`DROP POLICY IF EXISTS "Users can delete their own labels" ON public.labels`

    // Criar função personalizada para pegar user_id do contexto
    await sql`
      CREATE OR REPLACE FUNCTION get_current_user_id()
      RETURNS INTEGER AS $$
      BEGIN
        -- Tenta pegar o user_id do contexto da sessão
        RETURN nullif(current_setting('app.current_user_id', true), '')::INTEGER;
      EXCEPTION
        WHEN others THEN
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    // Habilitar RLS na tabela labels
    await sql`ALTER TABLE labels ENABLE ROW LEVEL SECURITY`

    // Criar políticas RLS
    await sql`
      CREATE POLICY "Users can read their own labels" 
      ON public.labels
      FOR SELECT
      USING (user_id = get_current_user_id())
    `

    await sql`
      CREATE POLICY "Users can insert their own labels" 
      ON public.labels
      FOR INSERT
      WITH CHECK (user_id = get_current_user_id())
    `

    await sql`
      CREATE POLICY "Users can update their own labels" 
      ON public.labels
      FOR UPDATE
      USING (user_id = get_current_user_id())
      WITH CHECK (user_id = get_current_user_id())
    `

    await sql`
      CREATE POLICY "Users can delete their own labels" 
      ON public.labels
      FOR DELETE
      USING (user_id = get_current_user_id())
    `

    // Verificar se as políticas foram criadas corretamente
    const policies = await sql`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies
      WHERE tablename = 'labels'
    `

    return NextResponse.json({ 
      message: "Migração RLS executada com sucesso",
      policies: policies
    })
  } catch (error: any) {
    console.error("Erro ao executar migração RLS:", error)
    return NextResponse.json({ 
      message: error.message || "Falha ao executar migração RLS",
      error: error.toString()
    }, { status: 500 })
  }
} 