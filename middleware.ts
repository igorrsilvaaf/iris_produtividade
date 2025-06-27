import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
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
    '/app/:path*'
  ]
} 