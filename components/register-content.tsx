"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { RegisterForm } from "@/components/register-form";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export function RegisterContent() {
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
              {t("Sign up to get started with Íris")}
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
    </div>
  );
} 