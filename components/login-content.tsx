"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { LoginForm } from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function LoginContent() {
  const { t } = useTranslation();

  useEffect(() => {
    const handleResize = () => {
      const isVeryLargeScreen = window.innerWidth >= 1920;
      document.body.classList.toggle('very-large-screen', isVeryLargeScreen);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col" data-testid="login-content">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" data-testid="header">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold" data-testid="logo-container">
            <Logo />
          </div>

          <div className="flex items-center gap-2 sm:gap-4" data-testid="actions-container">
            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6 md:py-8 lg:py-10" data-testid="main-content">
        <div className="mx-auto w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl" data-testid="welcome-back-title">{t("Welcome back")}</h1>
            <p className="text-sm text-muted-foreground sm:text-base" data-testid="sign-in-subtitle">
              {t("Sign in to your account to continue")}
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border shadow-sm" data-testid="login-form-container">
            <LoginForm />
          </div>

        </div>
      </main>
    </div>
  );
}