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

interface AddLabelDialogProps {
  children: React.ReactNode
}

export function AddLabelDialog({ children }: AddLabelDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("addLabel")}</DialogTitle>
          <DialogDescription>{t("createNewLabel")}</DialogDescription>
        </DialogHeader>
        <LabelForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}

