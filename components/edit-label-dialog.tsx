"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Label } from "@/lib/labels"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LabelForm } from "@/components/label-form"

interface EditLabelDialogProps {
  label: Label
  children: React.ReactNode
}

export function EditLabelDialog({ label, children }: EditLabelDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Label</DialogTitle>
          <DialogDescription>Update your label details.</DialogDescription>
        </DialogHeader>
        <LabelForm label={label} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}

