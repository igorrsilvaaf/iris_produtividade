"use client";

import { useTranslation } from "@/lib/i18n";
import { LoginForm } from "@/components/login-form";
import { AuthHeader } from "@/components/auth-header";
import { AuthFooter } from "@/components/auth-footer";

export function LoginContent() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">{t("Welcome back")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("Sign in to your account to continue")}
            </p>
          </div>
          <LoginForm />
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