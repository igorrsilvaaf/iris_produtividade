"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { RegisterForm } from "@/components/register-form";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { AuthFooter } from "@/components/auth-footer";

export function RegisterContent() {
  const { t } = useTranslation();

  useEffect(() => {
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
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <Link href="/" className="inline-flex items-center gap-2">
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
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ModeToggle />
            <div className="hidden sm:flex gap-4">
              <Link href="/login">
                <Button variant="default">{t("Login")}</Button>
              </Link>
            </div>
            <div className="sm:hidden">
              <Link href="/login">
                <Button size="sm" variant="default">{t("Login")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 md:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("Create an account")}</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              {t("Sign up to get started with To-Do")}
            </p>
          </div>
          <div className="bg-card p-6 rounded-lg border shadow-sm">
            <RegisterForm />
          </div>
          <div className="text-center text-sm">
            <p>
              {t("Already have an account?")}{" "}
              <a
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                {t("Sign in")}
              </a>
            </p>
          </div>
        </div>
      </main>
      <AuthFooter />
    </div>
  );
} 