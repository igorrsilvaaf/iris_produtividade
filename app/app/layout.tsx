"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { LanguageProvider } from "@/components/language-provider";
import { ChangelogNotification } from "@/components/changelog-notification";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { deduplicatedFetch } from "@/lib/request-deduplicator";

// Importar dinamicamente o SpotifyPlayerWrapper para evitar problemas de SSR
const SpotifyPlayerWrapper = dynamic(
  () => import("@/app/components/spotify-player-wrapper"),
  { ssr: false },
);

// Componente que renderiza o layout após a verificação de autenticação
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [initialLanguage, setInitialLanguage] = useState<"pt" | "en">("pt");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Verificar autenticação e obter dados do usuário
        const authResponse = await deduplicatedFetch("/api/auth/session");

        if (!authResponse.ok) {
          router.push("/login");
          return;
        }

        const authData = await authResponse.json();

        if (!authData || !authData.user) {
          router.push("/login");
          return;
        }

        setSession(authData);

        // Obter configurações do usuário
        const settingsResponse = await fetch("/api/settings");
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();

          if (settingsData && settingsData.settings) {
            setSettings(settingsData.settings);

            // Definir o idioma inicial
            let language = settingsData.settings.language as "pt" | "en";

            // Verificar se há um cookie de idioma
            const cookies = document.cookie.split(";");
            const langCookie = cookies.find((c) =>
              c.trim().startsWith("user-language="),
            );

            if (langCookie) {
              const cookieValue = langCookie.split("=")[1].trim();
              if (cookieValue === "en" || cookieValue === "pt") {
                language = cookieValue;
              }
            }

            setInitialLanguage(language);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        router.push("/login");
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
      <div className="flex min-h-screen flex-col md:flex-row md:overflow-hidden">
        <div className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r bg-background md:block hidden">
          {session?.user && <AppSidebar user={session.user} />}
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          {session?.user && <AppHeader user={session.user} />}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <ChangelogNotification />
            {children}
          </main>
        </div>

        {/* Adicionar o player do Spotify aqui */}
        {settings?.enable_spotify && <SpotifyPlayerWrapper />}
      </div>
    </LanguageProvider>
  );
}
