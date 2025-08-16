'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Lock, Zap } from 'lucide-react'
import Link from 'next/link'

interface TrialGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface TrialStatus {
  isActive: boolean
  daysRemaining: number
  expiresAt: Date | null
  isExpired: boolean
}

export function TrialGuard({ children, fallback }: TrialGuardProps) {
  const router = useRouter()
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuthAndTrialStatus = async () => {
      try {
        // Verificar autenticação primeiro
        const authResponse = await fetch('/api/auth/me')
        if (!authResponse.ok) {
          router.push('/login')
          return
        }
        
        const authData = await authResponse.json()
        if (!authData.authenticated) {
          router.push('/login')
          return
        }
        
        setAuthenticated(true)

        // Verificar status do trial
        const trialResponse = await fetch('/api/trial/status')
        if (trialResponse.ok) {
          const data = await trialResponse.json()
          setTrialStatus(data)
          setHasAccess(!data.isExpired)
          
          // Se o trial expirou, redirecionar para upgrade
          if (data.isExpired) {
            router.push('/upgrade?reason=trial_expired')
            return
          }
        } else {
          // Em caso de erro, assumir que não tem acesso
          setHasAccess(false)
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação e status do trial:', error)
        setHasAccess(false)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndTrialStatus()
  }, [router])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Se não tem acesso, mostrar fallback ou tela padrão
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-xl">Acesso Restrito</CardTitle>
            <CardDescription>
              {trialStatus?.isExpired 
                ? 'Seu período de teste de 14 dias expirou. Faça upgrade para continuar usando todas as funcionalidades.'
                : 'Você precisa de uma assinatura ativa para acessar esta funcionalidade.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {trialStatus?.isExpired && (
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center justify-center text-orange-700 dark:text-orange-300 text-sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  <span>Trial finalizado</span>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Link href="/upgrade">
                <Button className="w-full" size="lg">
                  <Zap className="w-4 h-4 mr-2" />
                  Fazer Upgrade Agora
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se tem acesso, renderizar o conteúdo
  return <>{children}</>
}

export default TrialGuard