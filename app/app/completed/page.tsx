import { requireAuth } from "@/lib/auth"
import { getCompletedTasks } from "@/lib/todos"
import { TaskList } from "@/components/task-list"

export default async function CompletedPage() {
  const session = await requireAuth()
  const tasks = await getCompletedTasks(session.user.id)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Completed</h1>
      </div>

      <TaskList tasks={tasks} />
    </div>
  )
}

