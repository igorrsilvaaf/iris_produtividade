"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProjectForm } from "@/components/project-form"
import { useTranslation } from "@/lib/i18n"
import type { Project } from "@/lib/projects"

interface EditProjectDialogProps {
  project: Project
  children: React.ReactNode
}

export function EditProjectDialog({ project, children }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const handleSuccess = (updatedProject: Project) => {
    setOpen(false)
    // O contexto já foi atualizado pelo ProjectForm, não precisa chamar novamente
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild data-testid="edit-project-dialog-trigger">{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="edit-project-dialog-content">
        <DialogHeader>
          <DialogTitle data-testid="edit-project-dialog-title">{t("Update Project")}</DialogTitle>
          <DialogDescription data-testid="edit-project-dialog-description">{t("Update the project details below.")}</DialogDescription>
        </DialogHeader>
        <ProjectForm project={project} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}

