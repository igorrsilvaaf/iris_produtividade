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

interface AddLabelDialogProps {
  children: React.ReactNode
}

export function AddLabelDialog({ children }: AddLabelDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const handleSuccess = (newLabel: Label) => {
    setOpen(false)
    // O contexto já foi atualizado pelo LabelForm, não precisa chamar novamente
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild data-testid="add-label-dialog-trigger">{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="add-label-dialog-content">
        <DialogHeader>
          <DialogTitle data-testid="add-label-dialog-title">{t("addLabel")}</DialogTitle>
          <DialogDescription data-testid="add-label-dialog-description">{t("createNewLabel")}</DialogDescription>
        </DialogHeader>
        <LabelForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}

