import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { getTrialStatus, expireTrial } from './lib/trial'

export async function middleware(request: NextRequest) {
  // Verificação de variáveis de ambiente em produção
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

  // Verificação de trial para rotas protegidas
  const protectedPaths = ['/app', '/api/tasks', '/api/kanban']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath) {
    try {
      // Verificar sessão customizada através do cookie
      const sessionToken = request.cookies.get('session_token')?.value
      
      if (sessionToken) {
        // Para verificação de trial, precisaríamos fazer uma consulta ao banco
        // Por enquanto, vamos permitir o acesso e deixar a verificação para as rotas individuais
        // TODO: Implementar verificação de trial no middleware usando sistema customizado
      }
    } catch (error) {
      console.error('Erro na verificação de trial:', error)
      // Em caso de erro, permite o acesso para não quebrar a aplicação
    }
  }
  
  const response = NextResponse.next()

  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  const sessionToken = request.cookies.get('session_token')
  if (sessionToken) {
    response.cookies.set('session_token', sessionToken.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })
  }

  return response
}

export const config = {
  matcher: [
    '/api/tasks/:path*',
    '/api/auth/:path*',
    '/api/kanban/:path*',
    '/app/:path*'
  ]
}