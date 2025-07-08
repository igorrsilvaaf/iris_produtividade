import { NextResponse } from 'next/server';
import { sql } from '@/lib/supabase';

export async function GET() {
  try {
    
    const startTime = Date.now();
    
    // Verificar se as variáveis de ambiente estão configuradas
    const databaseUrl = process.env.DATABASE_URL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Mascarar a URL sensível para log
    const maskedUrl = databaseUrl ? 
      databaseUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://*****:*****@') : 
      'não configurada';
    
    
    try {
      // Testar a conexão com uma query simples
      const result = await sql`SELECT 1 as connection_test`;
      const endTime = Date.now();
      
      if (result && result.length > 0) {
        // Buscar informações do banco
        const dbInfo = await sql`
          SELECT current_database() as database_name,
                 current_user as current_user,
                 version() as version,
                 inet_server_addr() as server_address,
                 inet_server_port() as server_port
        `;
        
        // Verificar se tabelas principais existem
        const tables = await sql`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `;
        
        const tableNames = tables.map(t => t.table_name);
        
        // Contar usuários como teste adicional
        let userCount = 0;
        try {
          const userResult = await sql`SELECT COUNT(*) as count FROM users`;
          userCount = userResult[0]?.count || 0;
        } catch (error: any) {
          // ... existing code ...
        }
        
        return NextResponse.json({
          success: true,
          message: 'Conexão com banco de dados estabelecida com sucesso',
          connectionTime: `${endTime - startTime}ms`,
          database: dbInfo[0],
          tables: tableNames,
          userCount,
          environment: {
            databaseUrl: !!databaseUrl,
            supabaseUrl: !!supabaseUrl,
            supabaseKey: !!supabaseKey
          }
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Falha na query de teste'
        }, { status: 500 });
      }
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        message: 'Erro ao conectar com o banco de dados',
        error: error.message,
        details: error.stack
      }, { status: 500 });
    }
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    }, { status: 500 });
  }
} 