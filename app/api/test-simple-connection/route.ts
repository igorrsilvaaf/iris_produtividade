import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  let client: Client | null = null;
  
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        message: 'DATABASE_URL não configurada'
      }, { status: 500 });
    }
    
    client = new Client({
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    const connectStart = Date.now();
    await client.connect();
    const connectTime = Date.now() - connectStart;
    
    const queryStart = Date.now();
    const result = await client.query('SELECT NOW() as current_time, 1 as test');
    const queryTime = Date.now() - queryStart;
    
    await client.end();
    
    return NextResponse.json({
      success: true,
      message: 'Conexão PostgreSQL simples funcionando!',
      metrics: {
        connectTime: `${connectTime}ms`,
        queryTime: `${queryTime}ms`,
        totalTime: `${connectTime + queryTime}ms`
      },
      result: result.rows[0]
    });
    
  } catch (error: any) {
    if (client) {
      try {
        await client.end();
      } catch (closeError) {
        console.error('Erro ao fechar conexão:', closeError);
      }
    }
    
    return NextResponse.json({
      success: false,
      message: 'Erro na conexão PostgreSQL simples',
      error: error.message
    }, { status: 500 });
  }
} 