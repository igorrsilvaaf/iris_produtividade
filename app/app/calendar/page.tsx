import { Suspense } from "react"
import { requireAuth } from "@/lib/auth"
import { CalendarView } from "@/components/calendar-view"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
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
  const title = getServerTranslation("calendar", lang as "en" | "pt");

  return {
    title,
  }
}

export default async function CalendarPage() {
  const session = await requireAuth()
  
  const cookieStore = await cookies()
  const languageCookie = cookieStore.get("user-language")
  let initialLanguage = "pt" // Default to PT if no cookie

  // Simplify the cookie value check
  if (languageCookie?.value === "en" || languageCookie?.value === "pt") {
    initialLanguage = languageCookie.value
  }

  console.log("[calendar.tsx] Idioma do cookie:", initialLanguage);
  
  // Obter a tradução diretamente usando getServerTranslation
  const translatedTitle = getServerTranslation("calendar", initialLanguage as "en" | "pt");
  console.log("[calendar.tsx] Título traduzido:", translatedTitle);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{translatedTitle}</h1>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-8" />
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>

              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, weekIndex) => (
                  <div key={weekIndex} className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                      <Skeleton key={dayIndex} className="h-24 w-full" />
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        }
      >
        <CalendarView userId={session.user.id} />
      </Suspense>
    </div>
  )
}

