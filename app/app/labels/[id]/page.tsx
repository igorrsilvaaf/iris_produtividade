import { requireAuth } from "@/lib/auth"
import { getLabel, getLabelTasks } from "@/lib/labels"
import { TaskList } from "@/components/task-list"
import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash } from "lucide-react"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { EditLabelDialog } from "@/components/edit-label-dialog"
import { DeleteLabelDialog } from "@/components/delete-label-dialog"

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full" style={{ backgroundColor: label.color }}></div>
          <h1 className="text-2xl font-bold">{label.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <EditLabelDialog label={label}>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit Label</span>
            </Button>
          </EditLabelDialog>
          <DeleteLabelDialog labelId={label.id} labelName={label.name}>
            <Button variant="outline" size="icon">
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete Label</span>
            </Button>
          </DeleteLabelDialog>
          <AddTaskDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </AddTaskDialog>
        </div>
      </div>

      <TaskList tasks={tasks} />
    </div>
  )
}

