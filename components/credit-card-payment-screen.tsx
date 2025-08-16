'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, CreditCard, Shield, Lock, Check, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface CreditCardPaymentScreenProps {
  selectedPlan: 'basic' | 'pro'
  customerData: {
    name: string
    email: string
    cpf: string
  }
  onBack: () => void
}

export function CreditCardPaymentScreen({ selectedPlan, customerData, onBack }: CreditCardPaymentScreenProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'form' | 'processing' | 'success' | 'error'>('form')
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const plans = {
    basic: {
      name: 'Plano Básico',
      price: 'R$ 5,00',
      priceValue: 5.00
    },
    pro: {
      name: 'Plano Pro',
      price: 'R$ 10,00',
      priceValue: 10.00
    }
  }

  const currentPlan = plans[selectedPlan]

  // Formatação do número do cartão
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  // Formatação da data de expiração
  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  // Validação do cartão
  const validateCard = () => {
    const newErrors: Record<string, string> = {}

    // Validar número do cartão (Luhn algorithm simplificado)
    const cardNumber = cardData.number.replace(/\s/g, '')
    if (!cardNumber || cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.number = 'Número do cartão inválido'
    }

    // Validar nome
    if (!cardData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    // Validar data de expiração
    const expiry = cardData.expiry.replace('/', '')
    if (!expiry || expiry.length !== 4) {
      newErrors.expiry = 'Data de expiração inválida'
    } else {
      const month = parseInt(expiry.substring(0, 2))
      const year = parseInt('20' + expiry.substring(2, 4))
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      
      if (month < 1 || month > 12) {
        newErrors.expiry = 'Mês inválido'
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = 'Cartão expirado'
      }
    }

    // Validar CVV
    if (!cardData.cvv || cardData.cvv.length < 3 || cardData.cvv.length > 4) {
      newErrors.cvv = 'CVV inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Detectar bandeira do cartão
  const getCardBrand = (number: string) => {
    const cleanNumber = number.replace(/\s/g, '')
    if (cleanNumber.startsWith('4')) return 'Visa'
    if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) return 'Mastercard'
    if (cleanNumber.startsWith('3')) return 'American Express'
    if (cleanNumber.startsWith('6')) return 'Elo'
    return 'Cartão'
  }

  // Processar pagamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateCard()) {
      return
    }

    setIsProcessing(true)
    setPaymentStatus('processing')

    try {
      // Simular processamento do pagamento
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Simular sucesso (90% de chance)
      const success = Math.random() > 0.1
      
      if (success) {
        setPaymentStatus('success')
        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push('/app')
        }, 2000)
      } else {
        setPaymentStatus('error')
        setIsProcessing(false)
      }
    } catch (error) {
      setPaymentStatus('error')
      setIsProcessing(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value)
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4)
    } else if (field === 'name') {
      formattedValue = value.toUpperCase()
    }
    
    setCardData(prev => ({ ...prev, [field]: formattedValue }))
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Tela de processamento
  if (paymentStatus === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden flex items-center justify-center">
        <Card className="glass-effect border-2 max-w-md w-full mx-4 animate-fade-in-up">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processando Pagamento</h2>
            <p className="text-muted-foreground">
              Aguarde enquanto processamos seu cartão de crédito...
            </p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Transação 100% segura</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tela de sucesso
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden flex items-center justify-center">
        <Card className="glass-effect border-2 max-w-md w-full mx-4 animate-fade-in-up">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Pagamento Aprovado!</h2>
            <p className="text-muted-foreground mb-4">
              Seu pagamento foi processado com sucesso.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Plano:</span>
                <span className="font-semibold">{currentPlan.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor:</span>
                <span className="font-semibold">{currentPlan.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Cartão:</span>
                <span className="font-semibold">****{cardData.number.slice(-4)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Redirecionando para o aplicativo...
            </p>
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mt-4"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Tela de erro
  if (paymentStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden flex items-center justify-center">
        <Card className="glass-effect border-2 max-w-md w-full mx-4 animate-fade-in-up">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Pagamento Recusado</h2>
            <p className="text-muted-foreground mb-6">
              Não foi possível processar seu pagamento. Verifique os dados do cartão e tente novamente.
            </p>
            <div className="space-y-2">
              <Button onClick={() => setPaymentStatus('form')} className="w-full">
                Tentar Novamente
              </Button>
              <Button onClick={onBack} variant="outline" className="w-full">
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Efeitos de fundo acrílico */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-muted/20 to-background/95 backdrop-blur-sm"></div>
      <div className="absolute top-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center mb-8 animate-fade-in-up">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mr-4 hover:bg-muted/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Pagamento com Cartão</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Formulário do Cartão */}
          <Card className="glass-effect border-2 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Dados do Cartão
              </CardTitle>
              <CardDescription>
                Insira as informações do seu cartão de crédito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Número do Cartão */}
                <div>
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={(e) => handleInputChange('number', e.target.value)}
                      maxLength={19}
                      className={errors.number ? 'border-red-500' : ''}
                    />
                    {cardData.number && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Badge variant="outline" className="text-xs">
                          {getCardBrand(cardData.number)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {errors.number && (
                    <p className="text-red-500 text-sm mt-1">{errors.number}</p>
                  )}
                </div>

                {/* Nome no Cartão */}
                <div>
                  <Label htmlFor="cardName">Nome no Cartão</Label>
                  <Input
                    id="cardName"
                    placeholder="NOME COMO ESTÁ NO CARTÃO"
                    value={cardData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Data de Expiração e CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Validade</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/AA"
                      value={cardData.expiry}
                      onChange={(e) => handleInputChange('expiry', e.target.value)}
                      maxLength={5}
                      className={errors.expiry ? 'border-red-500' : ''}
                    />
                    {errors.expiry && (
                      <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      maxLength={4}
                      type="password"
                      className={errors.cvv ? 'border-red-500' : ''}
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Parcelamento */}
                <div>
                  <Label htmlFor="installments">Parcelamento</Label>
                  <select
                    id="installments"
                    value={cardData.installments}
                    onChange={(e) => handleInputChange('installments', e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="1">1x de {currentPlan.price} (sem juros)</option>
                    <option value="2">2x de R$ {(currentPlan.priceValue / 2).toFixed(2)} (sem juros)</option>
                    <option value="3">3x de R$ {(currentPlan.priceValue / 3).toFixed(2)} (sem juros)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4" />
                  <span>Seus dados estão protegidos com criptografia SSL</span>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12" 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Finalizar Pagamento
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Resumo e Segurança */}
          <div className="space-y-6">
            {/* Resumo do Pedido */}
            <Card className="glass-effect border-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>{currentPlan.name}</span>
                  <span className="font-semibold">{currentPlan.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cliente:</span>
                  <span className="text-sm">{customerData.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">CPF:</span>
                  <span className="text-sm">{customerData.cpf}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total:</span>
                  <span className="text-primary">{currentPlan.price}</span>
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  Aprovação instantânea
                </Badge>
              </CardContent>
            </Card>

            {/* Informações de Segurança */}
            <Card className="glass-effect border-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Criptografia SSL 256-bits</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Dados protegidos PCI DSS</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Não armazenamos dados do cartão</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Processamento seguro</span>
                </div>
                
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mt-4">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    🔒 Seus dados estão completamente seguros. Utilizamos os mais altos padrões de segurança da indústria.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}