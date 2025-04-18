"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useTranslation } from "@/lib/i18n";
import { AuthFooter } from "@/components/auth-footer";
import { Logo } from "@/components/logo";
import { Check, Clock, Calendar, List, Moon, Bell, Star } from "lucide-react";

export default function LandingPage() {
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
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
  }, [setLanguage]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="w-full border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Logo />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ModeToggle />
            <div className="hidden sm:flex gap-4">
              <Link href="/login">
                <Button variant="outline">
                  {t("Entrar")}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {t("Cadastrar")}
                </Button>
              </Link>
            </div>
            <div className="flex sm:hidden gap-3">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  {t("Entrar")}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {t("Cadastrar")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-8 sm:py-16 md:py-24 lg:py-32 overflow-hidden relative border-b">
          <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10 bg-repeat"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-20 items-center max-w-[1920px] mx-auto">
              <div className="flex flex-col justify-center space-y-5 max-w-3xl">
                <div className="space-y-3 sm:space-y-4">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl xl:text-6xl">
                    {t("Organize suas tarefas com facilidade")}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-[600px]">
                    {t("Mantenha-se organizado e produtivo com nosso gerenciador de tarefas Íris. Inclui temporizador Pomodoro, notificações, modo escuro e muito mais.")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
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
              <div className="block w-full mx-auto flex justify-center items-center lg:max-w-full">
                <div className="relative aspect-square w-full max-w-[320px] sm:max-w-[450px] md:max-w-[500px] xl:max-w-[650px] 2xl:max-w-[700px] landing-reader mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 rounded-full opacity-50 blur-3xl"></div>
                  <div className="relative h-full w-full rounded-xl border bg-card p-3 sm:p-4 md:p-6 lg:p-8 shadow-xl">
                    <div className="flex flex-col h-full justify-between">
                      <div className="space-y-3 sm:space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="h-4 sm:h-6 w-3/4 rounded bg-muted"></div>
                          <div className="h-4 sm:h-6 w-4 sm:w-6 rounded-full bg-primary"></div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="h-3 sm:h-4 w-full rounded bg-muted"></div>
                          <div className="h-3 sm:h-4 w-5/6 rounded bg-muted"></div>
                          <div className="h-3 sm:h-4 w-4/6 rounded bg-muted"></div>
                        </div>
                        <div className="h-3 sm:h-4 w-2/3 rounded bg-muted"></div>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="h-3 sm:h-4 w-full rounded bg-muted"></div>
                          <div className="h-3 sm:h-4 w-4/5 rounded bg-muted"></div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-auto pt-4 sm:pt-6">
                        <div className="h-6 sm:h-8 w-16 sm:w-24 rounded bg-muted"></div>
                        <div className="h-6 sm:h-8 w-6 sm:w-8 rounded-full bg-muted"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 sm:py-16 md:py-24 lg:py-32 bg-muted/30 relative">
          <div className="absolute inset-0 bg-muted/20 opacity-50"></div>
          <div className="container px-4 md:px-6 mx-auto relative">
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 text-center mb-8 sm:mb-12">
              <div className="space-y-2 max-w-3xl">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
                  {t("Recursos avançados de produtividade")}
                </h2>
                <p className="max-w-[900px] text-muted-foreground text-sm sm:text-base md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("Tudo o que você precisa para se manter organizado e produtivo em um só lugar")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:gap-6 md:gap-8 py-4 sm:py-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t("Temporizador Pomodoro")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("Mantenha o foco com temporizador Pomodoro integrado para aumentar sua produtividade e gerenciar períodos de trabalho e descanso.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <List className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t("Gerenciamento de Tarefas")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("Organize tarefas com projetos personalizados, níveis de prioridade e datas de vencimento para manter seu fluxo de trabalho organizado.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t("Visualização de Calendário")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("Veja suas tarefas em uma visualização de calendário para planejar sua semana com eficiência e nunca perder prazos importantes.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t("Sistema de Notificações")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("Receba avisos sobre tarefas próximas ao vencimento, atrasadas e eventos importantes para nunca perder um prazo.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t("Modo Escuro")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("Alterne entre temas claros e escuros para reduzir o cansaço visual e adaptar a interface às suas preferências.")}
                </p>
              </div>
              <div className="flex flex-col space-y-2 sm:space-y-3 rounded-xl p-4 sm:p-6 bg-card border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                <div className="rounded-full bg-primary/10 p-2 sm:p-3 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-1">
                  <Star className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold">{t("Personalização")}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t("Adapte o aplicativo ao seu estilo com cores personalizáveis, diferentes sons de notificação e preferências de exibição.")}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 sm:py-16 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
                {t("Comece a usar hoje")}
              </h2>
              <p className="max-w-[600px] text-sm sm:text-base text-muted-foreground sm:text-lg md:text-xl/relaxed">
                {t("Registre-se gratuitamente e comece a organizar suas tarefas e aumentar sua produtividade")}
              </p>
              <div className="flex flex-row gap-3 sm:gap-4 mt-3 sm:mt-4">
                <Link href="/register">
                  <Button size="default" className="px-4 sm:px-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                    {t("Criar conta grátis")}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="default" variant="outline" className="px-4 sm:px-8">
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

