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

interface DeleteLabelDialogProps {
  labelId: number
  labelName: string
  children: React.ReactNode
}

export function DeleteLabelDialog({ labelId, labelName, children }: DeleteLabelDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/labels/${labelId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(t("Failed to delete label"))
      }

      toast({
        title: t("Label deleted"),
        description: t("Your label has been deleted successfully."),
      })

      setOpen(false)
      router.push("/app")
      router.refresh()
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("deleteLabel")}</DialogTitle>
          <DialogDescription>
            {t("deleteLabelConfirm")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm font-medium">
            {t("label")}: <span className="font-bold">{labelName}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("labelDeleteInfo")}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            {t("Cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? t("Deleting...") : t("Delete Label")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

