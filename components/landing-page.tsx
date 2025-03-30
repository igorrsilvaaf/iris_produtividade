"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useTranslation } from "@/lib/i18n";
import { AuthFooter } from "@/components/auth-footer";

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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-red-500"
            >
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>To-Do</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ModeToggle />
            <div className="hidden sm:flex gap-4">
              <Link href="/login">
                <Button variant="outline">{t("Login")}</Button>
              </Link>
              <Link href="/register">
                <Button>{t("Sign Up")}</Button>
              </Link>
            </div>
            <div className="sm:hidden">
              <Link href="/login">
                <Button>{t("Login")}</Button>
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
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl xl:text-7xl">{t("Organize your tasks with ease")}</h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-[600px]">
                    {t("Stay organized and productive with our To-Do task manager. Includes Pomodoro timer, dark mode, and more.")}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full px-8">
                      {t("Get Started")}
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full px-8">
                      {t("Login")}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden sm:block w-full mx-auto flex justify-center items-center lg:max-w-full">
                <div className="relative aspect-square w-full max-w-[600px] xl:max-w-[650px] 2xl:max-w-[700px] landing-reader mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-3xl"></div>
                  <div className="relative h-full w-full rounded-xl border bg-background p-4 md:p-6 lg:p-8 shadow-xl">
                    <div className="flex flex-col h-full justify-between">
                      <div className="space-y-5">
                        <div className="h-6 w-3/4 rounded bg-muted"></div>
                        <div className="space-y-3">
                          <div className="h-4 w-full rounded bg-muted"></div>
                          <div className="h-4 w-5/6 rounded bg-muted"></div>
                          <div className="h-4 w-4/6 rounded bg-muted"></div>
                        </div>
                        <div className="h-4 w-2/3 rounded bg-muted"></div>
                        <div className="space-y-3">
                          <div className="h-4 w-full rounded bg-muted"></div>
                          <div className="h-4 w-4/5 rounded bg-muted"></div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-auto pt-6">
                        <div className="h-8 w-24 rounded bg-muted"></div>
                        <div className="h-8 w-8 rounded-full bg-muted"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-8 sm:py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">
                  {t("Features")}
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("Everything you need to stay organized and productive")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-8 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-primary/10 p-2">
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
                    className="h-6 w-6 text-primary"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 14.25v-4.5L12 12l3-2.25v4.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">{t("Pomodoro Timer")}</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {t(
                    "Stay focused with built-in Pomodoro timer to boost your productivity"
                  )}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-primary/10 p-2">
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
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">{t("Task Management")}</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {t("Organize tasks with projects, priorities, and due dates")}
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg p-4">
                <div className="rounded-full bg-primary/10 p-2">
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
                    className="h-6 w-6 text-primary"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <line x1="3" x2="21" y1="9" y2="9" />
                    <line x1="9" x2="9" y1="21" y2="9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">{t("Calendar View")}</h3>
                <p className="text-sm text-muted-foreground text-center">
                  {t(
                    "See your tasks in a calendar view to plan your week effectively"
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
