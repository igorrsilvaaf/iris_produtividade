"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { LoginForm } from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { AuthFooter } from "@/components/auth-footer";
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
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Logo />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ModeToggle />
            <div className="hidden sm:flex gap-4">
              <Link href="/register">
                <Button>{t("Sign Up")}</Button>
              </Link>
            </div>
            <div className="sm:hidden">
              <Link href="/register">
                <Button size="sm">{t("Sign Up")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("Welcome back")}</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t("Sign in to your account to continue")}
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <LoginForm />
          </div>
          <div className="text-center text-sm">
            <p>
              {t("Don't have an account?")}{" "}
              <a
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                {t("Sign Up")}
              </a>
            </p>
          </div>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
} 