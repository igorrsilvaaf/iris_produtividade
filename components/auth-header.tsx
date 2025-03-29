"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

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
        <div className="flex items-center gap-2 justify-between">
          <ModeToggle />
          {isLoginPage && (
            <Link href="/register">
              <Button>{t("Sign Up")}</Button>
            </Link>
          )}
          {isRegisterPage && (
            <Link href="/login">
              <Button variant="outline">{t("Login")}</Button>
            </Link>
          )}
          {!isLoginPage && !isRegisterPage && (
            <>
              <Link href="/login">
                <Button variant="outline">{t("Login")}</Button>
              </Link>
              <Link href="/register">
                <Button>{t("Sign Up")}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
