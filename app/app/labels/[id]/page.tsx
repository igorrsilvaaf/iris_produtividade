import { requireAuth } from "@/lib/auth"
import { getLabel, getLabelTasks } from "@/lib/labels"
import { TaskList } from "@/components/task-list"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash } from "lucide-react"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { EditLabelDialog } from "@/components/edit-label-dialog"
import { DeleteLabelDialog } from "@/components/delete-label-dialog"
import { LabelHeaderActions } from "@/components/label-header-actions"

export default async function LabelPage({ params }: { params: { id: string } }) {
  const session = await requireAuth()
  const labelId = Number.parseInt(params.id)

  const label = await getLabel(labelId, session.user.id)
  const tasks = await getLabelTasks(labelId, session.user.id)

  if (!label) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Label not found</h1>
          <p className="text-muted-foreground">
            The label you're looking for doesn't exist or you don't have access to it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <LabelHeaderActions label={label} />
      <TaskList initialTasks={tasks} />
    </div>
  )
}

