import { requireAuth } from "@/lib/auth"
import { getInboxTasks } from "@/lib/todos"
import { TaskList } from "@/components/task-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddTaskDialog } from "@/components/add-task-dialog"

export default async function InboxPage() {
  const session = await requireAuth()
  const tasks = await getInboxTasks(session.user.id)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inbox</h1>
        <AddTaskDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </AddTaskDialog>
      </div>

      <TaskList tasks={tasks} />
    </div>
  )
}

