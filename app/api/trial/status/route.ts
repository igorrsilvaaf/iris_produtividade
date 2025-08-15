import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getTrialStatus } from '@/lib/trial'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar dados do usuário
    const user = await prisma.users.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar status do trial
    const trialStatus = await getTrialStatus(user.id)
    
    return NextResponse.json({
      isActive: trialStatus.isActive,
      daysRemaining: trialStatus.daysRemaining,
      expiresAt: trialStatus.expiresAt,
      isExpired: trialStatus.isExpired
    })
    
  } catch (error) {
    console.error('Erro ao verificar status do trial:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}