import { createClient } from '@supabase/supabase-js'
import { Pool } from 'pg'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

export const isAdminAvailable = () => {
  return supabaseAdmin !== null
}

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL não configurada! Verifique seu .env.local')
}

let pool: Pool | null = null

function createDatabaseConnection() {
  try {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL não configurada. Configure a connection string do PostgreSQL do Supabase em seu .env.local')
    }
    
    if (!pool) {
      pool = new Pool({
        connectionString: databaseUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        statement_timeout: 30000,
        query_timeout: 30000,
        ssl: {
          rejectUnauthorized: false 
        }
      })

      pool.on('error', (err) => {
        console.error('Erro no pool PostgreSQL:', err)
      })
    }
    
    return pool
  } catch (error) {
    console.error('Erro ao criar pool de conexões:', error)
    throw error
  }
}

function createSqlTemplate(pool: Pool) {
  return async function sql(strings: TemplateStringsArray, ...values: any[]) {
    let query = strings[0]
    for (let i = 1; i < strings.length; i++) {
      query += `$${i}` + strings[i]
    }
    
    try {
      const result = await pool.query(query, values)
      return result.rows
    } catch (error: any) {
      console.error('Erro na query:', error.message)
      console.error('Query que falhou:', query)
      throw error
    }
  }
}

const dbPool = createDatabaseConnection()
export const sql = createSqlTemplate(dbPool)

export const setCurrentUserId = async (userId: number) => {
  try {
    await sql`SELECT set_config('app.current_user_id', ${userId.toString()}, true)`
  } catch (error) {
    console.error('Erro ao definir user_id no contexto:', error)
  }
}

export const sqlWithUser = async (userId: number) => {
  await setCurrentUserId(userId)
  return sql
}

export const closePool = async () => {
  if (pool) {
    await pool.end()
    pool = null
  }
} 