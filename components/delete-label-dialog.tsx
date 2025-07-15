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
import type { Label } from "@/lib/labels"

interface DeleteLabelDialogProps {
  label: Label
  children: React.ReactNode
}

export function DeleteLabelDialog({ label, children }: DeleteLabelDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const { notifyLabelDeleted } = useProjectsLabelsUpdates()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/labels/${label.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete label")
      }

      // Atualizar contexto global
      notifyLabelDeleted(label.id)

      toast({
        title: t("labelDeleted"),
        description: t("The label has been deleted successfully."),
      })

      setOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to delete label"),
        description: t("Please try again."),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild data-testid="delete-label-dialog-trigger">{children}</AlertDialogTrigger>
      <AlertDialogContent data-testid="delete-label-dialog-content">
        <AlertDialogHeader>
          <AlertDialogTitle data-testid="delete-label-dialog-title">{t("deleteLabel")}</AlertDialogTitle>
          <AlertDialogDescription data-testid="delete-label-dialog-description">
            {t("Are you sure you want to delete this label? This action cannot be undone.")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-testid="delete-label-dialog-cancel">{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction
            data-testid="delete-label-dialog-confirm"
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

