'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Download, Printer, FileText, Clock, Building, Copy, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Label } from '@/components/ui/label'

interface BoletoPaymentScreenProps {
  selectedPlan: 'basic' | 'pro'
  customerData: {
    name: string
    email: string
    cpf: string
  }
  onBack: () => void
}

export function BoletoPaymentScreen({ selectedPlan, customerData, onBack }: BoletoPaymentScreenProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [boletoData, setBoletoData] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(true)

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

  // Estabilizar a referência do customerData para evitar re-execuções desnecessárias
  const stableCustomerData = useMemo(() => ({
    name: customerData.name,
    cpf: customerData.cpf,
    email: customerData.email
  }), [customerData.name, customerData.cpf, customerData.email])

  // Gerar dados do boleto simulado
  useEffect(() => {
    const generateBoleto = async () => {
      setIsGenerating(true)
      
      // Simular tempo de geração
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const today = new Date()
      const dueDate = new Date(today)
      dueDate.setDate(today.getDate() + 3) // Vencimento em 3 dias
      
      const boletoNumber = Math.random().toString().substring(2, 15)
      const barCode = `34191${Math.random().toString().substring(2, 15)}${Math.random().toString().substring(2, 15)}`
      const digitableLine = barCode.replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})/, '$1.$2 $3.$4 $5.$6 $7 $8')
      
      setBoletoData({
        number: boletoNumber,
        barCode,
        digitableLine,
        dueDate: dueDate.toLocaleDateString('pt-BR'),
        amount: currentPlan.priceValue,
        recipient: {
          name: 'IRIS PRODUTIVIDADE LTDA',
          cnpj: '12.345.678/0001-90',
          address: 'Rua das Flores, 123 - São Paulo/SP'
        },
        payer: {
          name: stableCustomerData.name,
          cpf: stableCustomerData.cpf,
          email: stableCustomerData.email
        },
        instructions: [
          'Não receber após o vencimento',
          'Multa de 2% após o vencimento',
          'Juros de 1% ao mês',
          'Em caso de dúvidas, entre em contato conosco'
        ]
      })
      
      setIsGenerating(false)
    }

    generateBoleto()
  }, [currentPlan.priceValue, stableCustomerData])

  const copyDigitableLine = async () => {
    if (!boletoData) return
    
    try {
      await navigator.clipboard.writeText(boletoData.digitableLine)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar linha digitável:', err)
    }
  }

  const downloadBoleto = () => {
    // Simular download do boleto
    const element = document.createElement('a')
    const file = new Blob([generateBoletoHTML()], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = `boleto-${boletoData.number}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const printBoleto = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(generateBoletoHTML())
      printWindow.document.close()
      printWindow.print()
    }
  }

  const generateBoletoHTML = () => {
    if (!boletoData) return ''
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Boleto Bancário - ${boletoData.number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .boleto { border: 2px solid #000; padding: 20px; max-width: 800px; }
        .header { text-align: center; margin-bottom: 20px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .field { margin-bottom: 10px; }
        .barcode { font-family: monospace; font-size: 12px; letter-spacing: 2px; }
        .instructions { margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="boleto">
        <div class="header">
          <h2>BOLETO BANCÁRIO</h2>
          <p><strong>Banco: 341 - Itaú Unibanco S.A.</strong></p>
        </div>
        
        <div class="row">
          <div><strong>Beneficiário:</strong> ${boletoData.recipient.name}</div>
          <div><strong>CNPJ:</strong> ${boletoData.recipient.cnpj}</div>
        </div>
        
        <div class="field">
          <strong>Endereço:</strong> ${boletoData.recipient.address}
        </div>
        
        <div class="row">
          <div><strong>Pagador:</strong> ${boletoData.payer.name}</div>
          <div><strong>CPF:</strong> ${boletoData.payer.cpf}</div>
        </div>
        
        <div class="row">
          <div><strong>Vencimento:</strong> ${boletoData.dueDate}</div>
          <div><strong>Valor:</strong> R$ ${boletoData.amount.toFixed(2)}</div>
        </div>
        
        <div class="field">
          <strong>Número do Documento:</strong> ${boletoData.number}
        </div>
        
        <div class="field">
          <strong>Linha Digitável:</strong><br>
          <span class="barcode">${boletoData.digitableLine}</span>
        </div>
        
        <div class="instructions">
          <strong>Instruções:</strong>
          <ul>
            ${boletoData.instructions.map((instruction: string) => `<li>${instruction}</li>`).join('')}
          </ul>
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px;">
          <p>Este boleto foi gerado automaticamente pelo sistema Iris Produtividade</p>
        </div>
      </div>
    </body>
    </html>
    `
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden flex items-center justify-center">
        <Card className="glass-effect border-2 max-w-md w-full mx-4 animate-fade-in-up">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Gerando Boleto</h2>
            <p className="text-muted-foreground">
              Aguarde enquanto preparamos seu boleto bancário...
            </p>
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
          <h1 className="text-2xl font-bold">Boleto Bancário</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Dados do Boleto */}
          <Card className="glass-effect border-2 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Dados do Boleto
              </CardTitle>
              <CardDescription>
                Informações para pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {boletoData && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Vencimento</Label>
                      <p className="font-semibold">{boletoData.dueDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Valor</Label>
                      <p className="font-semibold text-lg text-primary">{currentPlan.price}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Número do Documento</Label>
                    <p className="font-mono text-sm">{boletoData.number}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Beneficiário</Label>
                    <p className="font-semibold">{boletoData.recipient.name}</p>
                    <p className="text-sm text-muted-foreground">CNPJ: {boletoData.recipient.cnpj}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Linha Digitável</Label>
                    <div className="p-3 bg-muted/30 rounded-lg mt-2">
                      <p className="font-mono text-sm break-all">{boletoData.digitableLine}</p>
                    </div>
                    <Button 
                      onClick={copyDigitableLine}
                      variant="outline" 
                      size="sm"
                      className="mt-2 w-full"
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
                          Copiar Linha Digitável
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Ações e Instruções */}
          <Card className="glass-effect border-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Como Pagar
              </CardTitle>
              <CardDescription>
                Opções de pagamento do boleto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={downloadBoleto} className="h-12">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Boleto
                </Button>
                <Button onClick={printBoleto} variant="outline" className="h-12">
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Vencimento: {boletoData?.dueDate}</span>
              </div>
              
              <Badge variant="outline" className="w-full justify-center">
                Confirmação em 1-2 dias úteis
              </Badge>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="font-medium">Onde pagar:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">1</span>
                    Qualquer agência bancária
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">2</span>
                    Casas lotéricas
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">3</span>
                    Internet Banking
                  </li>
                  <li className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">4</span>
                    Aplicativo do seu banco
                  </li>
                </ul>
              </div>
              
              {boletoData && (
                <div className="space-y-2">
                  <h4 className="font-medium">Instruções importantes:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {boletoData.instructions.map((instruction: string, index: number) => (
                      <li key={index}>• {instruction}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  ⚠️ Não pague após o vencimento. Em caso de dúvidas, entre em contato conosco.
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