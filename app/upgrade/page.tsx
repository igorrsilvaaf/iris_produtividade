'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, X, Shield, Zap, TrendingUp, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 5,
    description: 'Ideal para uso pessoal',
    features: [
      'Kanban ilimitado',
      'Até 3 projetos',
      'Suporte por email',
      'Backup automático'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 10,
    description: 'Para profissionais e equipes',
    features: [
      'Tudo do plano Básico',
      'Projetos ilimitados',
      'Colaboração em equipe',
      'Relatórios avançados',
      'Integrações premium',
      'Suporte prioritário'
    ],
    popular: true
  }
]

export default function UpgradePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [reason, setReason] = useState<string | null>(null)

  useEffect(() => {
    setReason(searchParams.get('reason'))
  }, [searchParams])

  const handlePlanSelect = (planId: string) => {
    router.push(`/purchase?plan=${planId}`)
  }

  const getReasonMessage = () => {
    switch (reason) {
      case 'trial_expired':
        return {
          title: 'Seu período de teste expirou',
          description: 'Você utilizou todos os 14 dias do seu teste gratuito. Continue aproveitando todas as funcionalidades escolhendo um plano.',
          icon: <Clock className="w-6 h-6 text-orange-500" />
        }
      default:
        return {
          title: 'Desbloqueie todo o potencial do Iris',
          description: 'Escolha um plano para continuar usando todas as funcionalidades premium.',
          icon: <Zap className="w-6 h-6 text-primary" />
        }
    }
  }

  const reasonMessage = getReasonMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            {reasonMessage.icon}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {reasonMessage.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {reasonMessage.description}
          </p>
          
          {reason === 'trial_expired' && (
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg max-w-md mx-auto">
              <div className="flex items-center justify-center text-orange-700 dark:text-orange-300">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span className="font-medium">Trial de 14 dias finalizado</span>
              </div>
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative border-2 transition-all duration-300 hover:shadow-lg ${
                plan.popular 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">R$ {plan.price}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  size="lg"
                >
                  {plan.popular ? (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Escolher Pro
                    </>
                  ) : (
                    'Escolher Básico'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold mb-6">Por que escolher o Iris?</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium mb-2">14 dias grátis</h4>
              <p className="text-sm text-muted-foreground">Teste todas as funcionalidades</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Cancele quando quiser</h4>
              <p className="text-sm text-muted-foreground">Sem compromisso de longo prazo</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium mb-2">Aumento de produtividade</h4>
              <p className="text-sm text-muted-foreground">Até 200% mais eficiência</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Tem dúvidas? Entre em contato conosco
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="outline">
                Voltar ao início
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost">
                Falar com suporte
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}