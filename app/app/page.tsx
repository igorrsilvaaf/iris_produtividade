import { Suspense } from "react"
import { getTodayTasks } from "@/lib/todos"
import { getUserSettings } from "@/lib/settings"
import { requireAuth } from "@/lib/auth"
import { TaskList } from "@/components/task-list"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { cookies } from "next/headers"
import { getServerTranslation } from "@/lib/server-i18n"
import { Metadata } from "next"

// Define a metadata para forçar o idioma para esta página
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get("user-language")
  let lang = "pt" // Default to PT if no cookie

  if (languageCookie?.value === "en" || languageCookie?.value === "pt") {
    lang = languageCookie.value
  }

  // Usar a função getServerTranslation para traduzir o título
  const title = getServerTranslation("today", lang as "en" | "pt");

  return {
    title,
  }
}

export default async function AppPage() {
  const session = await requireAuth()
  const settings = await getUserSettings(session.user.id)

  const cookieStore = await cookies()
  const languageCookie = cookieStore.get("user-language")
  let initialLanguage = "pt"

  if (languageCookie?.value === "en" || languageCookie?.value === "pt") {
    initialLanguage = languageCookie.value
  }

  console.log("[page.tsx] Idioma do cookie:", initialLanguage);

  // Obter a tradução diretamente usando getServerTranslation
  const translatedTitle = getServerTranslation("today", initialLanguage as "en" | "pt");
  console.log("[page.tsx] Título traduzido:", translatedTitle);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{translatedTitle}</h1>
        <AddTaskDialog initialLanguage={initialLanguage}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {getServerTranslation("addTask", initialLanguage as "en" | "pt")}
          </Button>
        </AddTaskDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2">
          <Suspense
            fallback={
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-5 w-5 rounded-sm" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-full max-w-[70%]" />
                        <div className="flex gap-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            }
          >
            <TaskListWrapper userId={session.user.id} />
          </Suspense>
        </div>
        <div>
          <PomodoroTimer
            initialSettings={{
              pomodoro_work_minutes: settings.pomodoro_work_minutes,
              pomodoro_break_minutes: settings.pomodoro_break_minutes,
              pomodoro_long_break_minutes: settings.pomodoro_long_break_minutes,
              pomodoro_cycles: settings.pomodoro_cycles,
              enable_sound: settings.enable_sound,
              notification_sound: settings.notification_sound,
              enable_desktop_notifications: settings.enable_desktop_notifications,
            }}
          />
        </div>
      </div>
    </div>
  )
}

async function TaskListWrapper({ userId }: { userId: number }) {
  const tasks = await getTodayTasks(userId)
  return <TaskList tasks={tasks} />
}

