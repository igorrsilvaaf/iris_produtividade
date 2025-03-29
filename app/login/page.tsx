import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/components/language-provider";
import { translations } from "@/lib/i18n";
import { AuthHeader } from "@/components/auth-header";
import { AuthFooter } from "@/components/auth-footer";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/app");
  }

  const cookieStore = await cookies();
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

  const t = (key: string) =>
    translations[key]?.[initialLanguage as "en" | "pt"] || key;

  return (
    <LanguageProvider initialLanguage={initialLanguage}>
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
    </LanguageProvider>
  );
}
