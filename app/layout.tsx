import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/components/language-provider";
import { LanguageInitializer } from "@/components/language-initializer";
import { SyncLanguage } from "@/components/sync-language";
import { AppLoading } from "@/components/app-loading";
import { TranslationsLoader } from "@/components/translations-loader";
import { ThemeInitializer } from "@/components/theme-initializer";
import { AppWrapper } from "@/components/app-wrapper";
import { metadata, viewport } from "./metadata";
import { PomodoroProvider } from "@/lib/pomodoro-context";
import { getUserSettings } from "@/lib/settings";
import { getSession } from "@/lib/auth";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { TaskProvider } from "@/contexts/task-context";
import { ProjectsLabelsProvider } from "@/contexts/projects-labels-context";
import { AIHelpChat } from "@/components/ai-help-chat";
import { FeedbackDialog } from "@/components/feedback-dialog";


import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true
});

export { metadata, viewport };

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userLanguageCookie = cookieStore.get("user-language");

  let initialLanguage = "pt" as "pt" | "en";

  const session = await getSession();
  const settings = session ? await getUserSettings(session.user.id) : null;

  if (
    settings &&
    settings.language &&
    (settings.language === "en" || settings.language === "pt")
  ) {
    initialLanguage = settings.language as "pt" | "en";
  } else if (userLanguageCookie) {
    const cookieValue = userLanguageCookie.value;
    if (cookieValue === "en" || cookieValue === "pt") {
      initialLanguage = cookieValue;
    }
  } else {
    const legacyCookie = cookieStore.get("language-storage");
    if (legacyCookie) {
      try {
        const parsedData = JSON.parse(legacyCookie.value);
        if (parsedData.state && parsedData.state.language) {
          initialLanguage = parsedData.state.language as "pt" | "en";
        }
      } catch (e) {
        // Silently fail
      }
    }
  }

  const pomodoroSettings = settings ? {
    pomodoro_work_minutes: settings.pomodoro_work_minutes,
    pomodoro_break_minutes: settings.pomodoro_break_minutes,
    pomodoro_long_break_minutes: settings.pomodoro_long_break_minutes,
    pomodoro_cycles: settings.pomodoro_cycles,
    enable_sound: settings.enable_sound,
    notification_sound: settings.notification_sound,
    enable_desktop_notifications: settings.enable_desktop_notifications,
  } : null;

  return (
    <html
      lang={initialLanguage === "en" ? "en" : "pt-BR"}
      suppressHydrationWarning
      data-language={initialLanguage}
    >
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <LanguageProvider initialLanguage={initialLanguage}>
            <LanguageInitializer initialLanguage={initialLanguage} />
            <SyncLanguage initialLanguage={initialLanguage} />
            <AppLoading>
              <AppWrapper>
                <TranslationsLoader requiredKeys={["Create New Project"]}>
                  <ThemeInitializer>
                    <ProjectsLabelsProvider>
                      <TaskProvider>
                        {pomodoroSettings ? (
                          <PomodoroProvider initialSettings={pomodoroSettings}>
                            <ServiceWorkerRegistration />
                            <div className="flex-1">{children}</div>
                          </PomodoroProvider>
                        ) : (
                          <>
                            <ServiceWorkerRegistration />
                            <div className="flex-1">{children}</div>
                          </>
                        )}
                      </TaskProvider>
                      <Toaster />
                      {session?.user && (
                        <>
                          <div className="fixed bottom-24 right-4 z-50">
                            <FeedbackDialog />
                          </div>
                          <AIHelpChat />
                        </>
                      )}
                    </ProjectsLabelsProvider>
                  </ThemeInitializer>
                </TranslationsLoader>
              </AppWrapper>
            </AppLoading>
            </LanguageProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
