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
import { LabelForm } from "@/components/label-form"
import { useTranslation } from "@/lib/i18n"
import type { Label } from "@/lib/labels"

interface EditLabelDialogProps {
  label: Label
  children: React.ReactNode
}

export function EditLabelDialog({ label, children }: EditLabelDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const handleSuccess = (updatedLabel: Label) => {
    setOpen(false)
    // O contexto já foi atualizado pelo LabelForm, não precisa chamar novamente
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild data-testid="edit-label-dialog-trigger">{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="edit-label-dialog-content">
        <DialogHeader>
          <DialogTitle data-testid="edit-label-dialog-title">{t("editLabel")}</DialogTitle>
          <DialogDescription data-testid="edit-label-dialog-description">{t("updateLabelDetails")}</DialogDescription>
        </DialogHeader>
        <LabelForm label={label} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}

