"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useTranslation } from "@/lib/i18n";
import { AuthFooter } from "@/components/auth-footer";
import { Logo } from "@/components/logo";
import { Check, Clock, Calendar, List, Moon, Bell, Star } from "lucide-react";

export default function LandingPage() {
  const { t, language, setLanguage } = useTranslation();
  const [isClient, setIsClient] = useState(false);

  // Detectar quando está no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  return (
    <div className="flex min-h-screen flex-col bg-background" data-testid="landing-page">
      <header className="w-full border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10" data-testid="landing-header">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Logo />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ModeToggle />
            <div className="hidden sm:flex gap-4">
              <Link href="/login">
                <Button variant="outline" data-testid="landing-login-button-desktop">
                  {t("Entrar")}
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-testid="landing-register-button-desktop"
                >
                  {t("Cadastrar")}
                </Button>
              </Link>
            </div>
            <div className="flex sm:hidden gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm" data-testid="landing-login-button-mobile">
                  {t("Entrar")}
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-testid="landing-register-button-mobile"
                >
                  {t("Cadastrar")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1" data-testid="landing-main">
        <section className="w-full py-8 sm:py-16 md:py-24 lg:py-32 overflow-hidden relative border-b" data-testid="landing-hero">
          <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10 bg-repeat"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-20 items-center max-w-[1920px] mx-auto">
              <div className="flex flex-col justify-center space-y-5 max-w-3xl">
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl xl:text-6xl" data-testid="landing-hero-title">
                    {t("Organize suas tarefas com facilidade")}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-[600px]" data-testid="landing-hero-description">
                    {t("Mantenha-se organizado e produtivo com nosso gerenciador de tarefas Íris. Inclui temporizador Pomodoro, notificações, modo escuro e muito mais.")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-muted-foreground" data-testid="landing-hero-features">
                  <div className="flex items-center">
                    <Check className="text-primary h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                    {t("Gratuito")}
                  </div>
                  <div className="flex items-center">
                    <Check className="text-primary h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                    {t("Fácil de usar")}
                  </div>
                  <div className="flex items-center">
                    <Check className="text-primary h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                    {t("Seguro")}
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                  <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                  <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                  <div className="relative"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 sm:py-16 md:py-24 lg:py-32 bg-muted/30 relative" data-testid="landing-features">
          <div className="absolute inset-0 bg-muted/20 opacity-50"></div>
          <div className="container px-4 md:px-6 mx-auto relative">
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 text-center mb-8 sm:mb-12">
              <div className="space-y-2 max-w-3xl">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl" data-testid="landing-features-title">
                  {t("Recursos avançados de produtividade")}
                </h2>
                <p className="max-w-[900px] text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed" data-testid="landing-features-description">
                  {t("Tudo o que você precisa para se manter organizado e produtivo em um só lugar")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:gap-6 md:gap-8 py-4 sm:py-8 sm:grid-cols-2 lg:grid-cols-3" data-testid="landing-features-grid">
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10" data-testid="landing-feature-pomodoro">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t("Temporizador Pomodoro")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("Mantenha o foco com temporizador Pomodoro integrado para aumentar sua produtividade e gerenciar períodos de trabalho e descanso.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10" data-testid="landing-feature-tasks">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <List className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t("Gerenciamento de Tarefas")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("Organize tarefas com projetos personalizados, níveis de prioridade e datas de vencimento para manter seu fluxo de trabalho organizado.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10" data-testid="landing-feature-calendar">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t("Calendário Integrado")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("Visualize suas tarefas e prazos em um calendário intuitivo, facilitando o planejamento e o gerenciamento do seu tempo.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10" data-testid="landing-feature-notifications">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t("Notificações Inteligentes")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("Receba lembretes personalizados sobre tarefas importantes e prazos próximos para nunca perder um compromisso.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10" data-testid="landing-feature-themes">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t("Temas Personalizáveis")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("Escolha entre temas claro e escuro, ou configure automaticamente baseado nas suas preferências do sistema.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10" data-testid="landing-feature-collaboration">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t("Favoritos e Organização")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("Marque projetos como favoritos e organize suas tarefas com etiquetas personalizadas para acesso rápido e fácil.")}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 sm:py-16 md:py-24 lg:py-32 bg-background" data-testid="landing-cta">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl" data-testid="landing-cta-title">
                {t("Comece a usar hoje")}
              </h2>
              <p className="max-w-[600px] text-sm sm:text-base text-muted-foreground sm:text-lg md:text-xl/relaxed" data-testid="landing-cta-description">
                {t("Registre-se gratuitamente e comece a organizar suas tarefas e aumentar sua produtividade")}
              </p>
              <div className="flex flex-row gap-3 sm:gap-4 mt-3 sm:mt-4" data-testid="landing-cta-buttons">
                <Link href="/register">
                  <Button size="default" className="px-4 sm:px-8 bg-primary hover:bg-primary/90 text-primary-foreground" data-testid="landing-cta-register">
                    {t("Criar conta grátis")}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="default" variant="outline" className="px-4 sm:px-8" data-testid="landing-cta-login">
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

