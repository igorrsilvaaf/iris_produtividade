"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tag, Plus, X } from "lucide-react"
import type { Label } from "@/lib/labels"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { LabelForm } from "@/components/label-form"

interface TaskLabelsProps {
  taskId: number
}

export function TaskLabels({ taskId }: TaskLabelsProps) {
  const [labels, setLabels] = useState<Label[]>([])
  const [allLabels, setAllLabels] = useState<Label[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddLabel, setShowAddLabel] = useState(false)
  const [showCreateLabel, setShowCreateLabel] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchLabels = async () => {
      setIsLoading(true)
      try {
        // Fetch task labels
        const taskLabelsResponse = await fetch(`/api/tasks/${taskId}/labels`)
        if (!taskLabelsResponse.ok) {
          throw new Error("Failed to fetch task labels")
        }
        const taskLabelsData = await taskLabelsResponse.json()
        setLabels(taskLabelsData.labels)

        // Fetch all labels
        const allLabelsResponse = await fetch("/api/labels")
        if (!allLabelsResponse.ok) {
          throw new Error("Failed to fetch all labels")
        }
        const allLabelsData = await allLabelsResponse.json()
        setAllLabels(allLabelsData.labels)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to load labels",
          description: "Please try again later.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLabels()
  }, [taskId, toast])

  const addLabelToTask = async (labelId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelId }),
      })

      if (!response.ok) {
        throw new Error("Failed to add label to task")
      }

      // Refresh the task labels
      const taskLabelsResponse = await fetch(`/api/tasks/${taskId}/labels`)
      const taskLabelsData = await taskLabelsResponse.json()
      setLabels(taskLabelsData.labels)

      toast({
        title: "Label added",
        description: "Label has been added to the task successfully.",
      })

      setShowAddLabel(false)
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to add label",
        description: "Please try again.",
      })
    }
  }

  const removeLabelFromTask = async (labelId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/labels`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelId }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove label from task")
      }

      // Update the labels state
      setLabels(labels.filter((label) => label.id !== labelId))

      toast({
        title: "Label removed",
        description: "Label has been removed from the task successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to remove label",
        description: "Please try again.",
      })
    }
  }

  const handleCreateLabelSuccess = () => {
    setShowCreateLabel(false)

    // Refresh all labels
    fetch("/api/labels")
      .then((response) => response.json())
      .then((data) => setAllLabels(data.labels))
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Failed to refresh labels",
          description: "Please try again later.",
        })
      })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">Loading labels...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Labels</h3>
        <Dialog open={showAddLabel} onOpenChange={setShowAddLabel}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-1 h-3 w-3" />
              Add Label
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Label</DialogTitle>
              <DialogDescription>Select a label to add to this task.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              {allLabels.length === 0 ? (
                <p className="text-sm text-muted-foreground">No labels found.</p>
              ) : (
                allLabels
                  .filter((label) => !labels.some((l) => l.id === label.id))
                  .map((label) => (
                    <Button
                      key={label.id}
                      variant="outline"
                      className="justify-start"
                      onClick={() => addLabelToTask(label.id)}
                    >
                      <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: label.color }} />
                      {label.name}
                    </Button>
                  ))
              )}
              <Button
                variant="outline"
                className="justify-start mt-2"
                onClick={() => {
                  setShowAddLabel(false)
                  setShowCreateLabel(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Label
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {labels.length === 0 ? (
          <p className="text-sm text-muted-foreground">No labels assigned to this task.</p>
        ) : (
          labels.map((label) => (
            <div
              key={label.id}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
              style={{
                backgroundColor: `${label.color}20`,
                borderColor: label.color,
              }}
            >
              <Tag className="h-3 w-3" style={{ color: label.color }} />
              <span>{label.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full"
                onClick={() => removeLabelFromTask(label.id)}
              >
                <X className="h-2 w-2" />
              </Button>
            </div>
          ))
        )}
      </div>

      <Dialog open={showCreateLabel} onOpenChange={setShowCreateLabel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Label</DialogTitle>
            <DialogDescription>Create a new label to organize your tasks.</DialogDescription>
          </DialogHeader>
          <LabelForm onSuccess={handleCreateLabelSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

