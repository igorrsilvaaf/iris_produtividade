"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/mode-toggle";
import { useTranslation } from "@/lib/i18n";
import { AuthFooter } from "@/components/auth-footer";
import { Logo } from "@/components/logo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PurchaseScreen } from "@/components/purchase-screen";
import {
  Check,
  Clock,
  Calendar,
  List,
  Moon,
  Bell,
  Star,
  ArrowRight,
  Crown,
  Rocket,
  Target,
  TrendingUp,
  Award,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  Zap,
  Shield,
  Users,
  CheckCircle,
  X,
  ChevronLeft,
  ChevronRight,
  LogIn,
  Play,
} from "lucide-react";

export default function LandingPage() {
  const { t, language, setLanguage } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [showPurchaseScreen, setShowPurchaseScreen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro'>('basic');
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);

  // Arrays de dados
  const basicFeatures = [
    t("Kanban básico com 3 colunas") || "Kanban básico com 3 colunas",
    t("Até 10 projetos") || "Até 10 projetos",
    t("Temporizador Pomodoro") || "Temporizador Pomodoro",
    t("Notificações básicas") || "Notificações básicas",
    t("Modo escuro") || "Modo escuro",
    t("Suporte por email") || "Suporte por email"
  ];

  const proFeatures = [
    t("Tudo do plano Básico") || "Tudo do plano Básico",
    t("Projetos ilimitados") || "Projetos ilimitados",
    t("Kanban avançado com colunas personalizadas") || "Kanban avançado com colunas personalizadas",
    t("Relatórios detalhados de produtividade") || "Relatórios detalhados de produtividade",
    t("Integração com calendário") || "Integração com calendário",
    t("Backup automático na nuvem") || "Backup automático na nuvem",
    t("Suporte prioritário") || "Suporte prioritário",
    t("Temas personalizados") || "Temas personalizados"
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Gerente de Projetos",
      content: "O Iris transformou completamente minha forma de trabalhar. Consegui aumentar minha produtividade em 150% e nunca mais perdi um prazo importante.",
      rating: 5
    },
    {
      name: "João Santos",
      role: "Desenvolvedor",
      content: "Finalmente encontrei uma ferramenta que realmente funciona. O sistema Kanban é intuitivo e o Pomodoro integrado é perfeito para manter o foco.",
      rating: 5
    },
    {
      name: "Ana Costa",
      role: "Designer UX",
      content: "A interface é linda e funcional. Uso todos os dias para organizar meus projetos e a sincronização entre dispositivos é impecável.",
      rating: 5
    },
    {
      name: "Carlos Oliveira",
      role: "Consultor",
      content: "Os relatórios de produtividade me ajudaram a identificar onde estava perdendo tempo. Agora sou muito mais eficiente.",
      rating: 5
    },
    {
      name: "Lucia Ferreira",
      role: "Arquiteta",
      content: "Perfeito para gerenciar múltiplos projetos. A visualização em calendário é exatamente o que eu precisava.",
      rating: 5
    },
    {
      name: "Pedro Almeida",
      role: "Empreendedor",
      content: "Desde que comecei a usar o Iris, minha empresa cresceu 40%. A organização faz toda a diferença.",
      rating: 5
    },
    {
      name: "Fernanda Lima",
      role: "Professora",
      content: "Uso para organizar minhas aulas e projetos acadêmicos. É simples, eficiente e me poupa muito tempo.",
      rating: 5
    },
    {
      name: "Roberto Souza",
      role: "Advogado",
      content: "O sistema de notificações me salvou várias vezes. Nunca mais esqueci de um prazo processual importante.",
      rating: 5
    }
  ];

  // Detectar quando está no cliente
  useEffect(() => {
    setIsClient(true);
    
    // Detectar tamanho da janela para responsividade
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Auto-play do carrossel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => 
        prev === testimonials.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  // Funções de navegação do carrossel
  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToTestimonial = (index: number) => {
    setCurrentTestimonialIndex(index);
  };

  // Calcular depoimentos visíveis baseado no tamanho da tela
  const getVisibleTestimonials = () => {
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;
    
    let visibleCount = 3; // desktop
    if (isMobile) visibleCount = 1;
    else if (isTablet) visibleCount = 2;
    
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentTestimonialIndex + i) % testimonials.length;
      visible.push(testimonials[index]);
    }
    return visible;
  };
  
  // Obter classes CSS responsivas para o grid
  const getGridClasses = () => {
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;
    
    if (isMobile) return "grid-cols-1";
    if (isTablet) return "grid-cols-2";
    return "grid-cols-3";
  };

  useEffect(() => {
    if (!isClient) return;
    
    const savedLanguage = localStorage.getItem("language-storage");
    if (savedLanguage) {
      try {
        const parsedData = JSON.parse(savedLanguage);
        if (parsedData.state && parsedData.state.language) {
          setLanguage(parsedData.state.language);
        }
      } catch (e) {
        console.error("Error parsing saved language:", e);
      }
    }
    
    const handleResize = () => {
      const isVeryLargeScreen = window.innerWidth >= 1920;
      document.body.classList.toggle('very-large-screen', isVeryLargeScreen);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setLanguage, isClient]);



  const faqs = [
    {
      question: t("Qual a diferença entre o plano Básico e Pro?") || "Qual a diferença entre o plano Básico e Pro?",
      answer: t("O plano Básico inclui todas as funcionalidades essenciais para gerenciamento de tarefas. O plano Pro adiciona recursos avançados como projetos ilimitados, Kanban avançado, relatórios detalhados e suporte prioritário.") || "O plano Básico inclui todas as funcionalidades essenciais para gerenciamento de tarefas. O plano Pro adiciona recursos avançados como projetos ilimitados, Kanban avançado, relatórios detalhados e suporte prioritário.",
    },
    {
      question: t("Posso cancelar minha assinatura a qualquer momento?") || "Posso cancelar minha assinatura a qualquer momento?",
      answer: t("Sim, você pode cancelar sua assinatura a qualquer momento. Não há taxas de cancelamento e você continuará tendo acesso aos recursos até o final do período pago.") || "Sim, você pode cancelar sua assinatura a qualquer momento. Não há taxas de cancelamento e você continuará tendo acesso aos recursos até o final do período pago.",
    },
    {
      question: t("Existe período de teste gratuito?") || "Existe período de teste gratuito?",
      answer: t("Sim! Você pode usar o plano Básico gratuitamente por tempo ilimitado. Para o plano Pro, oferecemos 14 dias de teste gratuito.") || "Sim! Você pode usar o plano Básico gratuitamente por tempo ilimitado. Para o plano Pro, oferecemos 14 dias de teste gratuito.",
    },
    {
      question: t("Meus dados estão seguros?") || "Meus dados estão seguros?",
      answer: t("Absolutamente. Utilizamos criptografia de ponta e seguimos as melhores práticas de segurança. Seus dados são armazenados de forma segura e nunca são compartilhados com terceiros.") || "Absolutamente. Utilizamos criptografia de ponta e seguimos as melhores práticas de segurança. Seus dados são armazenados de forma segura e nunca são compartilhados com terceiros.",
    },
    {
      question: t("Posso usar em múltiplos dispositivos?") || "Posso usar em múltiplos dispositivos?",
      answer: t("Sim! O Iris funciona perfeitamente em computadores, tablets e smartphones. Seus dados são sincronizados automaticamente entre todos os dispositivos.") || "Sim! O Iris funciona perfeitamente em computadores, tablets e smartphones. Seus dados são sincronizados automaticamente entre todos os dispositivos.",
    },
  ];

  const handlePlanSelect = (plan: 'basic' | 'pro') => {
    setSelectedPlan(plan);
    setShowPurchaseScreen(true);
  };

  const handleBackToLanding = () => {
    setShowPurchaseScreen(false);
  };

  if (showPurchaseScreen) {
    return (
      <PurchaseScreen 
        selectedPlan={selectedPlan} 
        onBack={handleBackToLanding}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background" data-testid="landing-page">
      <header className="w-full border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Logo />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ModeToggle />
            <div className="hidden sm:flex gap-4">
              <Link href="/login">
                <Button variant="outline" data-testid="landing-login-button">
                  <LogIn className="w-4 h-4 mr-2" />
                  {t("Entrar")}
                </Button>
              </Link>
            </div>
            <div className="flex sm:hidden gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm" data-testid="landing-login-button-mobile">
                  <LogIn className="w-4 h-4 mr-2" />
                  {t("Entrar")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-8 sm:py-16 md:py-24 lg:py-32 overflow-hidden relative border-b bg-gradient-to-br from-primary/5 via-background to-primary/10">
          {/* Efeito de fundo acrílico/vidro fosco */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-muted/20 to-background/95 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] backdrop-blur-md"></div>
          
          {/* Elementos flutuantes animados */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-blue-500/10 rounded-full blur-lg animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-500/10 rounded-full blur-lg animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
          <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10 bg-repeat"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-20 items-center max-w-[1920px] mx-auto">
              <div className="flex flex-col justify-center space-y-6 max-w-3xl animate-fade-in-up">
                <div className="space-y-4 sm:space-y-6">
                  <Badge className="w-fit bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    <Rocket className="w-3 h-3 mr-1" />
                    {t("Aumente sua produtividade em 200%") || "Aumente sua produtividade em 200%"}
                  </Badge>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl xl:text-6xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text animate-fade-in-up hover:scale-105 transition-transform duration-500" data-testid="landing-main-title" style={{animationDelay: '0.2s'}}>
                    {t("Transforme sua produtividade com o Iris") || "Transforme sua produtividade com o Iris"}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-[600px] leading-relaxed animate-fade-in-up" data-testid="landing-main-subtitle" style={{animationDelay: '0.4s'}}>
                    {t("O sistema de produtividade mais completo do Brasil. Kanban avançado, Pomodoro inteligente e relatórios que realmente importam.") || "O sistema de produtividade mais completo do Brasil. Kanban avançado, Pomodoro inteligente e relatórios que realmente importam."}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto px-8 py-3 hover:scale-105 hover:-translate-y-1 transition-all duration-300" data-testid="landing-trial-button">
                      <Rocket className="w-5 h-5 mr-2" />
                      {t("Comece de Graça") || "Comece de Graça"}
                    </Button>
                  </Link>
                  <Link href="#plans">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-3 border-2 hover:bg-muted/50 hover:scale-105 hover:-translate-y-1 transition-all duration-300">
                      <Star className="w-5 h-5 mr-2" />
                      {t("Ver Planos") || "Ver Planos"}
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground animate-fade-in-up" data-testid="landing-features-list" style={{animationDelay: '0.8s'}}>
                  <div className="flex items-center" data-testid="landing-feature-free">
                    <CheckCircle className="text-green-500 h-4 w-4 mr-2" />
                    {t("Teste grátis por 14 dias") || "Teste grátis por 14 dias"}
                  </div>
                  <div className="flex items-center" data-testid="landing-feature-easy">
                    <Shield className="text-blue-500 h-4 w-4 mr-2" />
                    {t("Dados 100% seguros") || "Dados 100% seguros"}
                  </div>
                  <div className="flex items-center" data-testid="landing-feature-secure">
                    <Users className="text-purple-500 h-4 w-4 mr-2" />
                    {t("Mais de 100 usuários") || "Mais de 100 usuários"}
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center w-full animate-fade-in-up" style={{animationDelay: '1s'}}>
                <div className="w-full max-w-[600px] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] xl:max-w-[1000px] mx-auto">
                  <img 
                    src="/iris_principal.png" 
                    alt="Interface do aplicativo Iris Produtividade" 
                    className="w-full h-auto object-contain transition-all duration-500 hover:scale-[1.05] hover:rotate-1 hover:shadow-2xl"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Seção de Planos */}
        <section id="plans" className="w-full py-12 sm:py-16 md:py-24 lg:py-32 bg-muted/30 relative overflow-hidden">
          {/* Efeito de fundo acrílico para seção de planos */}
          <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-muted/40 to-background/90 backdrop-blur-sm"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-20 left-10 w-24 h-24 bg-blue-500/5 rounded-full blur-xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 animate-fade-in-up">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Crown className="w-3 h-3 mr-1" />
                {t("Planos Especiais") || "Planos Especiais"}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
                {t("Escolha o plano ideal para você") || "Escolha o plano ideal para você"}
              </h2>
              <p className="max-w-[600px] text-muted-foreground text-base md:text-lg">
                {t("Comece gratuitamente e evolua conforme suas necessidades crescem") || "Comece gratuitamente e evolua conforme suas necessidades crescem"}
              </p>
            </div>
            
            <div className="grid gap-8 lg:gap-12 md:grid-cols-2 max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              {/* Plano Básico */}
              <Card className="relative border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:-translate-y-2 glass-effect">
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {t("Plano Básico") || "Plano Básico"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t("Perfeito para começar sua jornada de produtividade") || "Perfeito para começar sua jornada de produtividade"}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">R$ 5</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {basicFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="text-green-500 h-4 w-4 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Separator />
                  <div className="space-y-4">
                    <Button 
                      onClick={() => handlePlanSelect('basic')}
                      className="w-full hover:scale-105 transition-all duration-300"
                      data-testid="basic-plan-button"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      {t("Escolher Plano Básico") || "Escolher Plano Básico"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      {t("Teste grátis por 14 dias") || "Teste grátis por 14 dias"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Plano Pro */}
              <Card className="relative border-2 border-primary hover:border-primary/80 transition-all duration-300 hover:shadow-xl shadow-lg hover:scale-105 hover:-translate-y-2 glass-effect animate-glow">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Award className="w-3 h-3 mr-1" />
                    {t("Mais Popular") || "Mais Popular"}
                  </Badge>
                </div>
                <CardHeader className="text-center pb-8 pt-8">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {t("Plano Pro") || "Plano Pro"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t("Para profissionais que querem máxima produtividade") || "Para profissionais que querem máxima produtividade"}
                  </CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-primary">R$ 10</span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {proFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="text-green-500 h-4 w-4 mr-3 flex-shrink-0" />
                        <span className="text-sm font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Separator />
                  <div className="space-y-4">
                    <Button 
                      onClick={() => handlePlanSelect('pro')}
                      className="w-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300"
                      data-testid="pro-plan-button"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {t("Escolher Plano Pro") || "Escolher Plano Pro"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      {t("Teste grátis por 14 dias • Cancele quando quiser") || "Teste grátis por 14 dias • Cancele quando quiser"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Seção de Recursos */}
        <section className="w-full py-12 sm:py-16 md:py-24 lg:py-32 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-muted/20 opacity-50 backdrop-blur-sm"></div>
          <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-green-500/5 rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
          <div className="container px-4 md:px-6 mx-auto relative">
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 text-center mb-8 sm:mb-12 animate-fade-in-up">
              <div className="space-y-2 max-w-3xl">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl" data-testid="landing-features-title">
                  {t("Recursos avançados de produtividade")}
                </h2>
                <p className="max-w-[900px] text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed" data-testid="landing-features-subtitle">
                  {t("Tudo o que você precisa para se manter organizado e produtivo em um só lugar")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:gap-6 md:gap-8 py-4 sm:py-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-105 hover:-translate-y-1 animate-fade-in-up stagger-animation glass-effect" data-testid="landing-feature-pomodoro">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold" data-testid="landing-feature-pomodoro-title">{t("Temporizador Pomodoro")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground" data-testid="landing-feature-pomodoro-description">
                  {t("Mantenha o foco com temporizador Pomodoro integrado para aumentar sua produtividade e gerenciar períodos de trabalho e descanso.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-105 hover:-translate-y-1 animate-fade-in-up stagger-animation glass-effect" data-testid="landing-feature-tasks" style={{animationDelay: '0.1s'}}>
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <List className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold" data-testid="landing-feature-tasks-title">{t("Gerenciamento de Tarefas")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground" data-testid="landing-feature-tasks-description">
                  {t("Organize tarefas com projetos personalizados, níveis de prioridade e datas de vencimento para manter seu fluxo de trabalho organizado.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-105 hover:-translate-y-1 animate-fade-in-up stagger-animation glass-effect" data-testid="landing-feature-calendar" style={{animationDelay: '0.2s'}}>
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold" data-testid="landing-feature-calendar-title">{t("Visualização de Calendário")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground" data-testid="landing-feature-calendar-description">
                  {t("Veja suas tarefas em uma visualização de calendário para planejar sua semana com eficiência e nunca perder prazos importantes.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-105 hover:-translate-y-1 animate-fade-in-up stagger-animation glass-effect" data-testid="landing-feature-notifications" style={{animationDelay: '0.3s'}}>
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold" data-testid="landing-feature-notifications-title">{t("Sistema de Notificações")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground" data-testid="landing-feature-notifications-description">
                  {t("Receba avisos sobre tarefas próximas ao vencimento, atrasadas e eventos importantes para nunca perder um prazo.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-105 hover:-translate-y-1 animate-fade-in-up stagger-animation glass-effect" data-testid="landing-feature-dark-mode" style={{animationDelay: '0.4s'}}>
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold" data-testid="landing-feature-dark-mode-title">{t("Modo Escuro")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground" data-testid="landing-feature-dark-mode-description">
                  {t("Alterne entre temas claros e escuros para reduzir o cansaço visual e adaptar a interface às suas preferências.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:scale-105 hover:-translate-y-1 animate-fade-in-up stagger-animation glass-effect" data-testid="landing-feature-customization" style={{animationDelay: '0.5s'}}>
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold" data-testid="landing-feature-customization-title">{t("Personalização")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground" data-testid="landing-feature-customization-description">
                  {t("Adapte o aplicativo ao seu estilo com cores personalizáveis, diferentes sons de notificação e preferências de exibição.")}
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Seção de Depoimentos */}
        <section className="w-full py-12 sm:py-16 md:py-24 lg:py-32 bg-muted/20 relative overflow-hidden">
          {/* Efeito de fundo acrílico para depoimentos */}
          <div className="absolute inset-0 bg-gradient-to-tl from-background/95 via-muted/30 to-background/95 backdrop-blur-sm"></div>
          <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-yellow-500/5 rounded-full blur-2xl animate-float" style={{animationDelay: '1.5s'}}></div>
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 animate-fade-in-up">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <MessageCircle className="w-3 h-3 mr-1" />
                {t("Depoimentos") || "Depoimentos"}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
                {t("O que nossos usuários dizem") || "O que nossos usuários dizem"}
              </h2>
              <p className="max-w-[600px] text-muted-foreground text-base md:text-lg">
                {t("Mais de 100 profissionais já transformaram sua produtividade") || "Mais de 100 profissionais já transformaram sua produtividade"}
              </p>
            </div>
            
            {/* Carrossel de Depoimentos */}
            <div className="relative">
              {/* Container do carrossel */}
              <div 
                className="overflow-hidden rounded-2xl"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <div className={`grid gap-6 ${getGridClasses()} max-w-6xl mx-auto animate-fade-in-up transition-all duration-500`} style={{animationDelay: '0.2s'}}>
                  {getVisibleTestimonials().map((testimonial, index) => (
                    <Card 
                      key={`${currentTestimonialIndex}-${index}`} 
                      className="border-2 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:scale-105 hover:-translate-y-2 glass-effect animate-fade-in-up animate-in slide-in-from-right-5" 
                      style={{animationDelay: `${0.1 * (index + 1)}s`}}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                          "{testimonial.content}"
                        </p>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-semibold text-primary">
                              {testimonial.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{testimonial.name}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Botões de navegação */}
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background/80 backdrop-blur-sm border border-border rounded-full p-3 hover:bg-muted/50 transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Depoimento anterior"
              >
                <ChevronLeft className="h-6 w-6 text-foreground" />
              </button>
              
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background/80 backdrop-blur-sm border border-border rounded-full p-3 hover:bg-muted/50 transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="Próximo depoimento"
              >
                <ChevronRight className="h-6 w-6 text-foreground" />
              </button>

              {/* Indicadores */}
              <div className="flex justify-center mt-8 space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonialIndex
                        ? 'bg-primary scale-125'
                        : 'bg-muted hover:bg-muted-foreground/20'
                    }`}
                    aria-label={`Ir para depoimento ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Seção FAQ */}
        <section className="w-full py-12 sm:py-16 md:py-24 lg:py-32 bg-background relative overflow-hidden">
          {/* Efeito de fundo acrílico para FAQ */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted/20 via-background/90 to-muted/20 backdrop-blur-sm"></div>
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl animate-float" style={{animationDelay: '2.5s'}}></div>
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12 animate-fade-in-up">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <HelpCircle className="w-3 h-3 mr-1" />
                {t("FAQ") || "FAQ"}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
                {t("Perguntas Frequentes") || "Perguntas Frequentes"}
              </h2>
              <p className="max-w-[600px] text-muted-foreground text-base md:text-lg">
                {t("Tire suas dúvidas sobre nossos planos e funcionalidades") || "Tire suas dúvidas sobre nossos planos e funcionalidades"}
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b hover:bg-muted/30 transition-all duration-300 rounded-lg px-2 glass-effect">
                    <AccordionTrigger className="text-left hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>
        
        {/* CTA Final */}
        <section className="w-full py-12 sm:py-16 md:py-24 lg:py-32 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-t relative overflow-hidden">
          {/* Efeito de fundo acrílico para CTA final */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm"></div>
          <div className="absolute top-10 left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
          <div className="container px-4 md:px-6 mx-auto relative z-20">
            <div className="flex flex-col items-center justify-center space-y-6 text-center max-w-3xl mx-auto animate-fade-in-up">
              <Badge className="bg-primary/20 text-primary border-primary/30">
                <Rocket className="w-3 h-3 mr-1" />
                {t("Última Chance") || "Última Chance"}
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl" data-testid="landing-cta-title">
                {t("Pronto para transformar sua produtividade?") || "Pronto para transformar sua produtividade?"}
              </h2>
              <p className="max-w-[600px] text-base sm:text-lg text-muted-foreground leading-relaxed" data-testid="landing-cta-subtitle">
                {t("Junte-se a mais de 10.000 profissionais que já aumentaram sua produtividade em 200% com o Iris. Teste grátis por 14 dias.") || "Junte-se a mais de 10.000 profissionais que já aumentaram sua produtividade em 200% com o Iris. Teste grátis por 14 dias."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto px-8 py-4 hover:scale-105 transition-all duration-300" data-testid="landing-cta-trial-button">
                    {t("Comece de Graça") || "Comece de Graça"}
                  </Button>
                </Link>
                <Link href="#plans">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 border-2 hover:bg-muted/50">
                    {t("Ver Planos Novamente") || "Ver Planos Novamente"}
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mt-6">
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 h-4 w-4 mr-2" />
                  {t("14 dias grátis") || "14 dias grátis"}
                </div>
                <div className="flex items-center">
                  <X className="text-red-500 h-4 w-4 mr-2" />
                  {t("Sem cartão de crédito") || "Sem cartão de crédito"}
                </div>
                <div className="flex items-center">
                  <Shield className="text-blue-500 h-4 w-4 mr-2" />
                  {t("Cancele quando quiser") || "Cancele quando quiser"}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 sm:py-16 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl" data-testid="landing-cta-title">
                {t("Comece a usar hoje")}
              </h2>
              <p className="max-w-[600px] text-sm sm:text-base text-muted-foreground sm:text-lg md:text-xl/relaxed" data-testid="landing-cta-subtitle">
                {t("Registre-se gratuitamente e comece a organizar suas tarefas e aumentar sua produtividade")}
              </p>
              <div className="flex flex-row gap-3 sm:gap-4 mt-3 sm:mt-4">
                <Link href="/register">
                  <Button size="default" className="px-4 sm:px-8" data-testid="landing-final-trial-button">
                    {t("Comece de Graça") || "Comece de Graça"}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="default" variant="outline" className="px-4 sm:px-8" data-testid="landing-login-cta-button">
                    {t("Fazer login")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <AuthFooter />
    </div>
  );
}

