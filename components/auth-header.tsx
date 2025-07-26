"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Logo } from "@/components/logo";

export function AuthHeader() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <Link href="/" className="inline-flex items-center gap-2">
            <Logo asLink={false} />
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ModeToggle data-testid="auth-header-mode-toggle" />
          <div className="hidden sm:flex gap-4">
            {isLoginPage && (
              <Link href="/register" data-testid="auth-header-register-link">
                <Button>{t("Sign Up")}</Button>
              </Link>
            )}
            {isRegisterPage && (
              <Link href="/login" data-testid="auth-header-login-link">
                <Button variant="default">{t("Login")}</Button>
              </Link>
            )}
            {!isLoginPage && !isRegisterPage && (
              <>
                <Link href="/login" data-testid="auth-header-login-link">
                  <Button variant="outline">{t("Login")}</Button>
                </Link>
                <Link href="/register" data-testid="auth-header-register-link">
                  <Button>{t("Sign Up")}</Button>
                </Link>
              </>
            )}
          </div>
          <div className="sm:hidden">
            {isLoginPage && (
              <Link href="/register" data-testid="auth-header-register-link-mobile">
                <Button size="sm">{t("Sign Up")}</Button>
              </Link>
            )}
            {isRegisterPage && (
              <Link href="/login" data-testid="auth-header-login-link-mobile">
                <Button size="sm" variant="default">{t("Login")}</Button>
              </Link>
            )}
            {!isLoginPage && !isRegisterPage && (
              <Link href="/login" data-testid="auth-header-login-link-mobile">
                <Button size="sm">{t("Login")}</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
