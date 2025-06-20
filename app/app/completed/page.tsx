import { requireAuth } from "@/lib/auth";
import { getCompletedTasks } from "@/lib/todos";
import { TaskList } from "@/components/task-list";
import { cookies } from "next/headers";
import { getServerTranslation } from "@/lib/server-i18n";
import { Metadata } from "next";

// Define a metadata para forçar o idioma para esta página
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const languageCookie = cookieStore.get("user-language");
  let lang = "pt"; // Default to PT if no cookie

  if (languageCookie?.value === "en" || languageCookie?.value === "pt") {
    lang = languageCookie.value;
  }

  // Usar a função getServerTranslation para traduzir o título
  const title = getServerTranslation("completed", lang as "en" | "pt");

  return {
    title,
  };
}

export default async function CompletedPage() {
  const session = await requireAuth();
  const tasks = await getCompletedTasks(session.user.id);

  const cookieStore = await cookies();
  const languageCookie = cookieStore.get("user-language");
  let initialLanguage = "pt"; // Default to PT if no cookie

  // Simplify the cookie value check
  if (languageCookie?.value === "en" || languageCookie?.value === "pt") {
    initialLanguage = languageCookie.value;
  }

  // Obter a tradução diretamente usando getServerTranslation
  const translatedTitle = getServerTranslation(
    "completed",
    initialLanguage as "en" | "pt",
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{translatedTitle}</h1>
      </div>

      <TaskList tasks={tasks} />
    </div>
  );
}
