"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"

interface DeleteProjectDialogProps {
  projectId: number
  projectName: string
  children: React.ReactNode
}

export function DeleteProjectDialog({ projectId, projectName, children }: DeleteProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete project")
      }

      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      })

      setOpen(false)
      router.push("/app")
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete project",
        description: "Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild data-testid="delete-project-dialog-trigger">{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="delete-project-dialog-content">
        <DialogHeader>
          <DialogTitle data-testid="delete-project-dialog-title">{t("deleteProject")}</DialogTitle>
          <DialogDescription data-testid="delete-project-dialog-description">
            {t("deleteProjectConfirm")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4" data-testid="delete-project-dialog-info">
          <p className="text-sm font-medium">
            {t("project")}: <span className="font-bold">{projectName}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {t("projectDeleteInfo")}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} data-testid="delete-project-cancel-button">{t("cancel")}</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading} data-testid="delete-project-confirm-button">
            {t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

