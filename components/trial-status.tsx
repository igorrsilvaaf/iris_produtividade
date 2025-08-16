'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, AlertTriangle, Crown, Zap } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface TrialStatus {
  isActive: boolean
  daysRemaining: number
  expiresAt: Date | null
  isExpired: boolean
}

interface TrialStatusProps {
  className?: string
  variant?: 'card' | 'banner' | 'compact'
}

export function TrialStatus({ className, variant = 'card' }: TrialStatusProps) {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const fetchTrialStatus = async () => {
      try {
        // Verificar autenticação
        const authResponse = await fetch('/api/auth/me')
        if (!authResponse.ok) {
          setLoading(false)
          return
        }
        
        const authData = await authResponse.json()
        if (!authData.authenticated) {
          setLoading(false)
          return
        }
        
        setIsAuthenticated(true)

        // Buscar status do trial
        const response = await fetch('/api/trial/status')
        if (response.ok) {
          const data = await response.json()
          setTrialStatus(data)
        }
      } catch (error) {
        console.error('Erro ao buscar status do trial:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrialStatus()
  }, [])

  if (loading || !isAuthenticated || !trialStatus) {
    return null
  }

  const getStatusColor = () => {
    if (trialStatus.isExpired) return 'destructive'
    if (trialStatus.daysRemaining <= 3) return 'warning'
    return 'default'
  }

  const getStatusIcon = () => {
    if (trialStatus.isExpired) return <AlertTriangle className="w-4 h-4" />
    if (trialStatus.daysRemaining <= 3) return <Clock className="w-4 h-4" />
    return <Crown className="w-4 h-4" />
  }

  const getStatusMessage = () => {
    if (trialStatus.isExpired) {
      return 'Trial expirado'
    }
    if (trialStatus.daysRemaining === 0) {
      return 'Último dia do trial'
    }
    if (trialStatus.daysRemaining === 1) {
      return '1 dia restante'
    }
    return `${trialStatus.daysRemaining} dias restantes`
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
          {getStatusIcon()}
          <span className="text-xs">{getStatusMessage()}</span>
        </Badge>
        {(trialStatus.isExpired || trialStatus.daysRemaining <= 3) && (
          <Link href="/upgrade">
            <Button size="sm" variant="outline" className="h-6 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          </Link>
        )}
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div className={cn(
        'w-full p-3 border rounded-lg flex items-center justify-between',
        trialStatus.isExpired 
          ? 'bg-destructive/10 border-destructive/20 text-destructive'
          : trialStatus.daysRemaining <= 3
          ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
          : 'bg-primary/10 border-primary/20 text-primary',
        className
      )}>
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <p className="font-medium text-sm">
              {trialStatus.isExpired ? 'Seu trial expirou' : `Trial: ${getStatusMessage()}`}
            </p>
            {trialStatus.expiresAt && !trialStatus.isExpired && (
              <p className="text-xs opacity-75">
                Expira em {new Date(trialStatus.expiresAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>
        
        <Link href="/upgrade">
          <Button 
            size="sm" 
            variant={trialStatus.isExpired ? 'destructive' : 'default'}
            className="flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            {trialStatus.isExpired ? 'Renovar' : 'Upgrade'}
          </Button>
        </Link>
      </div>
    )
  }

  // Default card variant
  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              trialStatus.isExpired 
                ? 'bg-destructive/10 text-destructive'
                : trialStatus.daysRemaining <= 3
                ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600'
                : 'bg-primary/10 text-primary'
            )}>
              {getStatusIcon()}
            </div>
            
            <div>
              <h3 className="font-semibold text-sm">
                {trialStatus.isExpired ? 'Trial Expirado' : 'Período de Teste'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {getStatusMessage()}
              </p>
              {trialStatus.expiresAt && !trialStatus.isExpired && (
                <p className="text-xs text-muted-foreground">
                  Expira em {new Date(trialStatus.expiresAt).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          
          <Link href="/upgrade">
            <Button 
              size="sm" 
              variant={trialStatus.isExpired ? 'destructive' : 'default'}
              className="flex items-center gap-1"
            >
              <Zap className="w-4 h-4" />
              {trialStatus.isExpired ? 'Renovar Agora' : 'Fazer Upgrade'}
            </Button>
          </Link>
        </div>
        
        {!trialStatus.isExpired && trialStatus.daysRemaining <= 7 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              💡 Aproveite os últimos dias do seu trial e faça o upgrade para continuar usando todas as funcionalidades.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default TrialStatus