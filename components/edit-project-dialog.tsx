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

interface EditProjectDialogProps {
  project: Project
  children: React.ReactNode
}

export function EditProjectDialog({ project, children }: EditProjectDialogProps) {
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
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update your project details.</DialogDescription>
        </DialogHeader>
        <ProjectForm project={project} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  )
}

