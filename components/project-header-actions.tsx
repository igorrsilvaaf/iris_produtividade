"use client"

import { Button } from "@/components/ui/button"
import { Edit, Plus, Trash } from "lucide-react"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { DeleteProjectDialog } from "@/components/delete-project-dialog"
import { ToggleProjectFavorite } from "@/components/toggle-project-favorite"
import { useTranslation } from "@/lib/i18n"

export function ProjectHeaderActions({ project }: { project: any }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <ToggleProjectFavorite project={project} />
      <EditProjectDialog project={project}>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
          <span className="sr-only">{t("editProject")}</span>
        </Button>
      </EditProjectDialog>
      <DeleteProjectDialog projectId={project.id} projectName={project.name}>
        <Button variant="outline" size="icon">
          <Trash className="h-4 w-4" />
          <span className="sr-only">{t("deleteProject")}</span>
        </Button>
      </DeleteProjectDialog>
      <AddTaskDialog initialProjectId={project.id}>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("addTask")}
        </Button>
      </AddTaskDialog>
    </div>
  )
} 