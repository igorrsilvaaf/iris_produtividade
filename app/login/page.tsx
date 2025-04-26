import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/language-provider";
import { LoginContent } from "@/components/login-content";
import { SpotifyCleanup } from "@/components/spotify-cleanup";

// Este é um componente de servidor (Server Component)
export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/app");
  }

  const cookieStore = cookies();
  const languageCookie = cookieStore.get("language-storage");
  let initialLanguage = "pt";

  if (languageCookie) {
    try {
      const parsedData = JSON.parse(languageCookie.value);
      if (parsedData.state && parsedData.state.language) {
        initialLanguage = parsedData.state.language;
      }
    } catch (e) {
      console.error("Error parsing language cookie:", e);
    }
  }

  // Envolvemos o conteúdo no componente SpotifyCleanup que vai limpar os dados do Spotify no cliente
  return (
    <SpotifyCleanup>
      <LanguageProvider initialLanguage={initialLanguage as "pt" | "en"}>
        <LoginContent />
      </LanguageProvider>
    </SpotifyCleanup>
  );
} 