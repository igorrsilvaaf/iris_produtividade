"use client"

import Link from "next/link"
import { useTranslation } from "@/lib/i18n"

export function AuthFooter() {
  const { t } = useTranslation()

  return (
    <footer className="w-full border-t py-6">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Todoist Clone. {t("All rights reserved.")}
        </p>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            {t("Terms")}
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            {t("Privacy")}
          </Link>
        </div>
      </div>
    </footer>
  )
}

