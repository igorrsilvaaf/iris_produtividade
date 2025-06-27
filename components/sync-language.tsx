"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/lib/i18n";

interface SyncLanguageProps {
  initialLanguage: "pt" | "en";
}

export function SyncLanguage({ initialLanguage }: SyncLanguageProps) {
  const { language, setLanguage } = useLanguageStore();

  useEffect(() => {
    console.log("SyncLanguage - Initial sync:", {
      initialLanguage,
      currentLanguage: language,
    });

    if (language !== initialLanguage) {
      console.log(
        `SyncLanguage - Syncing language from '${language}' to '${initialLanguage}'`
      );
      setLanguage(initialLanguage);

      document.cookie = `user-language=${initialLanguage}; path=/; max-age=31536000; SameSite=Strict`;

      document.documentElement.lang = initialLanguage === "en" ? "en" : "pt-BR";
      document.documentElement.setAttribute("data-language", initialLanguage);
    }
  }, [initialLanguage, language, setLanguage]);

  return null;
}
