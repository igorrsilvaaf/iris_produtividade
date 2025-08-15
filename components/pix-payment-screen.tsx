'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Copy, Check, Clock, Smartphone, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'

interface PixPaymentScreenProps {
  selectedPlan: 'basic' | 'pro'
  customerData: {
    name: string
    email: string
    cpf: string
  }
  onBack: () => void
}

export function PixPaymentScreen({ selectedPlan, customerData, onBack }: PixPaymentScreenProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [pixCode, setPixCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutos
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'confirmed'>('pending')

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

  // Gerar código PIX simulado
  useEffect(() => {
    const generatePixCode = () => {
      // Simular geração de código PIX
      const transactionId = Math.random().toString(36).substring(2, 15)
      const pixPayload = `00020126580014br.gov.bcb.pix0136${transactionId}520400005303986540${currentPlan.priceValue.toFixed(2)}5802BR5925IRIS PRODUTIVIDADE LTDA6009SAO PAULO62070503***6304`
      
      // Calcular CRC16 simplificado (simulado)
      const crc = Math.random().toString(16).substring(2, 6).toUpperCase()
      const fullPixCode = pixPayload + crc
      
      setPixCode(fullPixCode)
      
      // Gerar QR Code
      QRCode.toDataURL(fullPixCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrCodeUrl(url)
      }).catch(err => {
        console.error('Erro ao gerar QR Code:', err)
      })
    }

    generatePixCode()
  }, [currentPlan.priceValue])

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && paymentStatus === 'pending') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, paymentStatus])

  // Simular verificação de pagamento
  useEffect(() => {
    if (paymentStatus === 'pending') {
      const checkPayment = setTimeout(() => {
        // Simular confirmação de pagamento após 30 segundos (para demo)
        if (Math.random() > 0.7) {
          setPaymentStatus('confirmed')
          setTimeout(() => {
            router.push('/app')
          }, 2000)
        }
      }, 30000)

      return () => clearTimeout(checkPayment)
    }
  }, [paymentStatus, router])

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar código PIX:', err)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (paymentStatus === 'confirmed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden flex items-center justify-center">
        <Card className="glass-effect border-2 max-w-md w-full mx-4 animate-fade-in-up">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Pagamento Confirmado!</h2>
            <p className="text-muted-foreground mb-6">
              Seu pagamento PIX foi processado com sucesso. Redirecionando para o aplicativo...
            </p>
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
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
          <h1 className="text-2xl font-bold">Pagamento PIX</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* QR Code */}
          <Card className="glass-effect border-2 animate-fade-in-up">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5" />
                QR Code PIX
              </CardTitle>
              <CardDescription>
                Escaneie o código com seu aplicativo bancário
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code PIX" 
                    className="border-2 border-muted rounded-lg"
                  />
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Expira em: {formatTime(timeLeft)}</span>
              </div>
              
              <Badge variant="secondary" className="text-xs">
                Aprovação instantânea
              </Badge>
            </CardContent>
          </Card>

          {/* Código PIX e Instruções */}
          <Card className="glass-effect border-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Código PIX
              </CardTitle>
              <CardDescription>
                Ou copie e cole o código no seu banco
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs font-mono break-all text-muted-foreground">
                  {pixCode}
                </p>
              </div>
              
              <Button 
                onClick={copyPixCode}
                variant="outline" 
                className="w-full"
                disabled={copied}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código PIX
                  </>
                )}
              </Button>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Como pagar:</h4>
                <ol className="text-sm text-muted-foreground space-y-2">
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">1</span>
                    Abra o aplicativo do seu banco
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">2</span>
                    Escaneie o QR Code ou cole o código PIX
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">3</span>
                    Confirme o pagamento de {currentPlan.price}
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">4</span>
                    Aguarde a confirmação automática
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  💡 O pagamento será confirmado automaticamente em alguns segundos após a transferência.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo do Pedido */}
        <Card className="glass-effect border-2 max-w-md mx-auto mt-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <CardHeader>
            <CardTitle className="text-center">Resumo do Pedido</CardTitle>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}