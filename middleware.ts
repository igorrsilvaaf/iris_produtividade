import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Verificar se está em produção
  if (process.env.NODE_ENV === 'production') {
    if (request.nextUrl.pathname === '/api/auth/forgot-password') {
      const requiredVars = [
        'EMAIL_SERVER_HOST',
        'EMAIL_SERVER_PORT',
        'EMAIL_SERVER_USER',
        'EMAIL_SERVER_PASSWORD',
        'EMAIL_FROM',
        'NEXT_PUBLIC_APP_URL'
      ]
      
      const missingVars = requiredVars.filter(varName => !process.env[varName])
      
      if (missingVars.length > 0) {
        console.error(`[Middleware] Variáveis de ambiente ausentes: ${missingVars.join(', ')}`)
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        )
      }
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/auth/forgot-password'],
} 