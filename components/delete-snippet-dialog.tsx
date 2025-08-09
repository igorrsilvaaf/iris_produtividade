"use client"

import type React from "react"

import { useState } from "react"
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

interface DeleteSnippetDialogProps {
  snippetId: number
  onDeleted?: (id: number) => void
  children: React.ReactNode
}

export function DeleteSnippetDialog({ snippetId, onDeleted, children }: DeleteSnippetDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/snippets/${snippetId}`, { method: "DELETE" })
      if (!response.ok) {
        throw new Error("Failed to delete snippet")
      }
      if (onDeleted) onDeleted(snippetId)
      toast({ title: t("Snippet deleted"), description: t("The snippet has been deleted successfully.") })
      setOpen(false)
    } catch (_err) {
      toast({ variant: "destructive", title: t("Failed to delete snippet"), description: t("Please try again.") })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Delete snippet")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("Are you sure you want to delete this snippet? This action cannot be undone.")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isLoading ? t("Deleting...") : t("Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


