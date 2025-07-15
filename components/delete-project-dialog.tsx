"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import { useProjectsLabelsUpdates } from "@/hooks/use-projects-labels-updates"
import type { Project } from "@/lib/projects"

interface DeleteProjectDialogProps {
  project: Project
  children: React.ReactNode
}

export function DeleteProjectDialog({ project, children }: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const { notifyProjectDeleted } = useProjectsLabelsUpdates()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      // Atualizar contexto global
      notifyProjectDeleted(project.id)

      toast({
        title: t("projectDeleted"),
        description: t("The project has been deleted successfully."),
      })

      setOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to delete project"),
        description: t("Please try again."),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild data-testid="delete-project-dialog-trigger">{children}</AlertDialogTrigger>
      <AlertDialogContent data-testid="delete-project-dialog-content">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="delete-project-dialog-title">{t("deleteProject")}</AlertDialogTitle>
          <AlertDialogDescription data-testid="delete-project-dialog-description">
            {t("Are you sure you want to delete this project? This action cannot be undone.")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="delete-project-dialog-cancel">{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction
            data-testid="delete-project-dialog-confirm"
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? t("Deleting...") : t("Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

