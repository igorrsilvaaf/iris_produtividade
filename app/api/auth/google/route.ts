import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { createSession } from '@/lib/auth'
import crypto from 'crypto'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/google` : 'http://localhost:3000/api/auth/google'

// Redireciona para Google OAuth
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Se há erro na autenticação
  if (error) {
    return NextResponse.redirect(new URL('/register?error=google_auth_failed', request.url))
  }

  // Se não há código, redireciona para Google
  if (!code) {
    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Google OAuth não configurado' },
        { status: 500 }
      )
    }

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
    googleAuthUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI)
    googleAuthUrl.searchParams.set('response_type', 'code')
    googleAuthUrl.searchParams.set('scope', 'openid email profile')
    googleAuthUrl.searchParams.set('access_type', 'offline')
    googleAuthUrl.searchParams.set('prompt', 'consent')

    return NextResponse.redirect(googleAuthUrl.toString())
  }

  // Processa o callback do Google
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error('Credenciais do Google não configuradas')
    }

    // Troca o código por token de acesso
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Falha ao obter token do Google')
    }

    const tokenData = await tokenResponse.json()
    const { access_token } = tokenData

    // Obtém informações do usuário do Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Falha ao obter dados do usuário do Google')
    }

    const googleUser = await userResponse.json()
    const { email, name, picture } = googleUser

    if (!email) {
      throw new Error('Email não fornecido pelo Google')
    }

    // Verifica se o usuário já existe
    let user = await prisma.users.findUnique({
      where: { email }
    })

    // Se não existe, cria novo usuário com trial
    if (!user) {
      user = await prisma.users.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: crypto.randomBytes(32).toString('hex'), // Senha aleatória para OAuth
          trial_start_date: new Date(),
          trial_expired: false,
          avatar_url: picture || null
        }
      })
    } else {
      // Atualiza avatar se necessário
      if (picture && !user.avatar_url) {
        await prisma.users.update({
          where: { id: user.id },
          data: {
            avatar_url: picture
          }
        })
      }
    }

    // Cria sessão usando o sistema existente
    await createSession(user.id, true) // true para lembrar por 30 dias

    // Redireciona para o app
    return NextResponse.redirect(new URL('/app', request.url))

  } catch (error) {
    console.error('Erro no login com Google:', error)
    return NextResponse.redirect(new URL('/register?error=google_auth_failed', request.url))
  }
}

// Método POST para iniciar autenticação (chamado pelo frontend)
export async function POST() {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Google OAuth não configurado' },
      { status: 500 }
    )
  }

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
  googleAuthUrl.searchParams.set('redirect_uri', GOOGLE_REDIRECT_URI)
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('access_type', 'offline')
  googleAuthUrl.searchParams.set('prompt', 'consent')

  return NextResponse.json({ url: googleAuthUrl.toString() })
}