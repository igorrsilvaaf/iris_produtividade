"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useTranslation } from "@/lib/i18n";
import { AuthFooter } from "@/components/auth-footer";
import { Logo } from "@/components/logo";

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
    
    // Ajustar layout para telas muito grandes
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
    <div className="flex min-h-screen flex-col bg-[#0c0d10]">
      <header className="w-full border-b border-[#1a1c23] bg-[#0c0d10]">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Logo />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ModeToggle />
            <div className="hidden sm:flex gap-4">
              <Link href="/login">
                <Button variant="outline" className="border-[#2d3343] text-gray-200 hover:bg-[#202430] hover:text-white">
                  {t("Entrar")}
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#e11d48] hover:bg-[#be123c] text-white">
                  {t("Cadastrar")}
                </Button>
              </Link>
            </div>
            <div className="sm:hidden">
              <Link href="/login">
                <Button variant="outline" className="border-[#2d3343] text-gray-200 hover:bg-[#202430] hover:text-white">
                  {t("Entrar")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20 items-center max-w-[1920px] mx-auto">
              <div className="flex flex-col justify-center space-y-6 max-w-3xl">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl xl:text-7xl text-white">
                    {t("Organize suas tarefas com facilidade")}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-400 max-w-[600px]">
                    {t("Mantenha-se organizado e produtivo com nosso gerenciador de tarefas Íris. Inclui temporizador Pomodoro, modo escuro e muito mais.")}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full px-8 bg-[#e11d48] hover:bg-[#be123c] text-white">
                      {t("Começar")}
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full px-8 border-[#2d3343] text-gray-200 hover:bg-[#202430] hover:text-white">
                      {t("Entrar")}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden sm:block w-full mx-auto flex justify-center items-center lg:max-w-full">
                <div className="relative aspect-square w-full max-w-[600px] xl:max-w-[650px] 2xl:max-w-[700px] landing-reader mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-3xl"></div>
                  <div className="relative h-full w-full rounded-xl border bg-[#151821] border-[#20232b] p-4 md:p-6 lg:p-8 shadow-xl">
                    <div className="flex flex-col h-full justify-between">
                      <div className="space-y-5">
                        <div className="h-6 w-3/4 rounded bg-[#202430]"></div>
                        <div className="space-y-3">
                          <div className="h-4 w-full rounded bg-[#202430]"></div>
                          <div className="h-4 w-5/6 rounded bg-[#202430]"></div>
                          <div className="h-4 w-4/6 rounded bg-[#202430]"></div>
                        </div>
                        <div className="h-4 w-2/3 rounded bg-[#202430]"></div>
                        <div className="space-y-3">
                          <div className="h-4 w-full rounded bg-[#202430]"></div>
                          <div className="h-4 w-4/5 rounded bg-[#202430]"></div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-auto pt-6">
                        <div className="h-8 w-24 rounded bg-[#202430]"></div>
                        <div className="h-8 w-8 rounded-full bg-[#202430]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-[#151821]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter md:text-3xl text-white">
                  {t("Recursos")}
                </h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("Tudo o que você precisa para se manter organizado e produtivo")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-8 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-[#202430] p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-pink-500"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 14.25v-4.5L12 12l3-2.25v4.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">{t("Temporizador Pomodoro")}</h3>
                <p className="text-sm text-gray-400 text-center">
                  {t(
                    "Mantenha o foco com temporizador Pomodoro integrado para aumentar sua produtividade"
                  )}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-[#202430] p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-pink-500"
                  >
                    <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">{t("Gerenciamento de Tarefas")}</h3>
                <p className="text-sm text-gray-400 text-center">
                  {t("Organize tarefas com projetos, prioridades e datas de vencimento")}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-[#202430] p-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-pink-500"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <line x1="3" x2="21" y1="9" y2="9" />
                    <line x1="9" x2="9" y1="21" y2="9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">{t("Visualização de Calendário")}</h3>
                <p className="text-sm text-gray-400 text-center">
                  {t(
                    "Veja suas tarefas em uma visualização de calendário para planejar sua semana com eficiência"
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <AuthFooter />
    </div>
  );
}
