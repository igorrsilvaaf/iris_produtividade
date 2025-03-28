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

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/labels/${labelId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete label")
      }

      toast({
        title: "Label deleted",
        description: "Your label has been deleted successfully.",
      })

      setOpen(false)
      router.push("/app")
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete label",
        description: "Please try again.",
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
          <DialogTitle>Delete Label</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this label? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm font-medium">
            Label: <span className="font-bold">{labelName}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            The label will be removed from all tasks, but the tasks themselves will not be deleted.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete Label"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

