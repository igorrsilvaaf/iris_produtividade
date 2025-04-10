"use client";

import { useTranslation } from "@/lib/i18n";
import Link from "next/link";

export function AuthFooter() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t py-2 bg-background">
      <div className="container flex flex-col items-center justify-between gap-2 md:h-10 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {currentYear} Íris. {t("All rights reserved.")}
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/terms"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {t("Terms")}
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {t("Privacy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
