"use client";

import { useEffect } from "react";
import { rehydrateLanguageStore, useTranslation } from "@/lib/i18n";

interface SyncLanguageProps {
  initialLanguage?: string;
}

export function SyncLanguage({ initialLanguage }: SyncLanguageProps) {
  const { language, isHydrated, setLanguage } = useTranslation();

  useEffect(() => {
    if (!isHydrated) {
      rehydrateLanguageStore();
    }

    if (initialLanguage && initialLanguage !== language && isHydrated) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage, language, isHydrated, setLanguage]);

  return null;
}
