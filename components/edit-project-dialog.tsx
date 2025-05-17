"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Project } from "@/lib/projects"
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

interface EditProjectDialogProps {
  project: Project
  children: React.ReactNode
}

export function EditProjectDialog({ project, children }: EditProjectDialogProps) {
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
          <DialogTitle>{t("editProject")}</DialogTitle>
          <DialogDescription>{t("updateProjectDetails")}</DialogDescription>
        </DialogHeader>
        <ProjectForm project={project} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}

