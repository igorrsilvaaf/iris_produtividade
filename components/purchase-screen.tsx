'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, FileText, Smartphone, Shield, Check, Crown, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PixPaymentScreen } from '@/components/pix-payment-screen'
import { BoletoPaymentScreen } from '@/components/boleto-payment-screen'
import { CreditCardPaymentScreen } from '@/components/credit-card-payment-screen'

interface PurchaseScreenProps {
  selectedPlan?: 'basic' | 'pro'
  onBack?: () => void
}

export function PurchaseScreen({ selectedPlan = 'basic', onBack }: PurchaseScreenProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState('credit-card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentScreen, setCurrentScreen] = useState<'form' | 'pix' | 'boleto' | 'credit'>('form')
  interface FormData {
    name: string
    email: string
    phone: string
    cpf: string
    cardNumber: string
    cardName: string
    cardExpiry: string
    cardCvv: string
    address: string
    city: string
    state: string
    zipCode: string
  }

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  })

  const plans = {
    basic: {
      name: 'Plano Básico',
      price: 'R$ 5,00',
      priceValue: 5.00,
      features: [
        'Kanban Board Básico',
        'Até 3 projetos',
        'Pomodoro Timer',
        'Suporte por email'
      ],
      icon: Star,
      color: 'blue'
    },
    pro: {
      name: 'Plano Pro',
      price: 'R$ 10,00',
      priceValue: 10.00,
      features: [
        'Kanban Board Avançado',
        'Projetos ilimitados',
        'Pomodoro Timer + Analytics',
        'Calendário integrado',
        'Notificações inteligentes',
        'Suporte prioritário',
        'Relatórios avançados'
      ],
      icon: Crown,
      color: 'primary'
    }
  }

  const currentPlan = plans[selectedPlan]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value
    setFormData(prev => ({ ...prev, [name]: formattedValue }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validar dados obrigatórios
    if (!formData.name.trim() || !formData.email.trim() || !formData.cpf.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    
    // Redirecionar baseado no método de pagamento
    const customerData = {
      name: formData.name,
      email: formData.email,
      cpf: formData.cpf
    }
    
    switch (paymentMethod) {
      case 'pix':
        setCurrentScreen('pix')
        break
      case 'boleto':
        setCurrentScreen('boleto')
        break
      case 'credit-card':
        setCurrentScreen('credit')
        break
      default:
        console.error('Método de pagamento não reconhecido:', paymentMethod)
    }
  }
  
  const handleBackToForm = () => {
    setCurrentScreen('form')
  }

  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }

  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').substr(0, 5)
  }

  const formatCPF = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').substr(0, 14)
  }

  // Renderizar telas específicas de pagamento
  if (currentScreen === 'pix') {
    return (
      <PixPaymentScreen 
        selectedPlan={selectedPlan}
        customerData={{
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf
        }}
        onBack={handleBackToForm}
      />
    )
  }
  
  if (currentScreen === 'boleto') {
    return (
      <BoletoPaymentScreen 
        selectedPlan={selectedPlan}
        customerData={{
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf
        }}
        onBack={handleBackToForm}
      />
    )
  }
  
  if (currentScreen === 'credit') {
    return (
      <CreditCardPaymentScreen 
        selectedPlan={selectedPlan}
        customerData={{
          name: formData.name,
          email: formData.email,
          cpf: formData.cpf
        }}
        onBack={handleBackToForm}
      />
    )
  }
  
  // Tela principal do formulário
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
            onClick={onBack || (() => router.back())}
            className="mr-4 hover:bg-muted/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Finalizar Compra</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Resumo do Plano */}
          <Card className="glass-effect border-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <currentPlan.icon className="w-5 h-5" />
                Resumo do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">{currentPlan.name}</h3>
                  <p className="text-sm text-muted-foreground">Assinatura mensal</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{currentPlan.price}</p>
                  <p className="text-sm text-muted-foreground">/mês</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recursos inclusos:</h4>
                <ul className="space-y-1">
                  {currentPlan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />
              
              <div className="flex items-center justify-between font-semibold text-lg">
                <span>Total:</span>
                <span className="text-primary">{currentPlan.price}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                Pagamento 100% seguro e criptografado
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Pagamento */}
          <Card className="glass-effect border-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <CardTitle>Informações de Pagamento</CardTitle>
              <CardDescription>
                Escolha sua forma de pagamento preferida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="font-medium">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      value={formData.cpf}
                      onChange={(e) => {
                        const formatted = formatCPF(e.target.value)
                        setFormData(prev => ({ ...prev, cpf: formatted }))
                      }}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
                    />
                  </div>
                </div>

                <Separator />

                {/* Método de Pagamento */}
                <div className="space-y-4">
                  <h3 className="font-medium">Método de Pagamento</h3>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <RadioGroupItem value="credit-card" id="credit-card" />
                      <Label htmlFor="credit-card" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="w-4 h-4" />
                        Cartão de Crédito
                        <Badge variant="secondary" className="ml-auto">Aprovação instantânea</Badge>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="w-4 h-4" />
                        PIX
                        <Badge variant="secondary" className="ml-auto">Aprovação instantânea</Badge>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      <RadioGroupItem value="boleto" id="boleto" />
                      <Label htmlFor="boleto" className="flex items-center gap-2 cursor-pointer flex-1">
                        <FileText className="w-4 h-4" />
                        Boleto Bancário
                        <Badge variant="outline" className="ml-auto">1-2 dias úteis</Badge>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Campos específicos do método de pagamento */}
                {paymentMethod === 'credit-card' && (
                  <div className="space-y-4 animate-fade-in-up">
                    <h4 className="font-medium">Dados do Cartão</h4>
                    <div>
                      <Label htmlFor="cardNumber">Número do Cartão</Label>
                      <Input
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value)
                            setFormData(prev => ({ ...prev, cardNumber: formatted }))
                          }}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Validade</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={(e) => {
                            const formatted = formatExpiryDate(e.target.value)
                            setFormData(prev => ({ ...prev, expiryDate: formatted }))
                          }}
                          placeholder="MM/AA"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={(e) => {
                            const formatted = e.target.value.replace(/\D/g, '')
                            setFormData(prev => ({ ...prev, cvv: formatted }))
                          }}
                          placeholder="000"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'pix' && (
                  <div className="space-y-4 animate-fade-in-up">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2">Como funciona o PIX:</h4>
                      <ol className="text-sm text-muted-foreground space-y-1">
                        <li>1. Clique em "Finalizar Compra"</li>
                        <li>2. Escaneie o QR Code ou copie o código PIX</li>
                        <li>3. Faça o pagamento no seu banco</li>
                        <li>4. Aprovação instantânea após confirmação</li>
                      </ol>
                    </div>
                  </div>
                )}

                {paymentMethod === 'boleto' && (
                  <div className="space-y-4 animate-fade-in-up">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-2">Como funciona o Boleto:</h4>
                      <ol className="text-sm text-muted-foreground space-y-1">
                        <li>1. Clique em "Finalizar Compra"</li>
                        <li>2. Baixe ou imprima o boleto</li>
                        <li>3. Pague em qualquer banco ou lotérica</li>
                        <li>4. Aprovação em 1-2 dias úteis</li>
                      </ol>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg hover-lift"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processando...
                    </div>
                  ) : (
                    `Finalizar Compra - ${currentPlan.price}`
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Ao finalizar a compra, você concorda com nossos{' '}
                  <a href="#" className="text-primary hover:underline">Termos de Uso</a>{' '}
                  e{' '}
                  <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}