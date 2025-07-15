"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tag, Plus, X } from "lucide-react"
import type { Label } from "@/lib/labels"
import { useTranslation } from "@/lib/i18n"
import { useProjectsLabelsUpdates } from "@/hooks/use-projects-labels-updates"
import { Button } from "@/components/ui/button"

// Função para calcular a cor de texto baseada na cor de fundo
function getContrastColor(hexColor: string) {
  // Se não houver cor ou for inválida, retornar preto
  if (!hexColor || !hexColor.startsWith('#')) {
    return '#000000';
  }
  
  // Converter hex para RGB
  let r = 0, g = 0, b = 0;
  if (hexColor.length === 7) {
    r = parseInt(hexColor.substring(1, 3), 16);
    g = parseInt(hexColor.substring(3, 5), 16);
    b = parseInt(hexColor.substring(5, 7), 16);
  } else if (hexColor.length === 4) {
    r = parseInt(hexColor.substring(1, 2), 16) * 17;
    g = parseInt(hexColor.substring(2, 3), 16) * 17;
    b = parseInt(hexColor.substring(3, 4), 16) * 17;
  }
  
  // Calcular luminância
  // Fórmula YIQ: https://24ways.org/2010/calculating-color-contrast/
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // Retornar branco ou preto dependendo da luminância
  return (yiq >= 128) ? '#000000' : '#ffffff';
}
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
  readOnly?: boolean
}

export function TaskLabels({ taskId, readOnly = false }: TaskLabelsProps) {
  const [labels, setLabels] = useState<Label[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddLabel, setShowAddLabel] = useState(false)
  const [showCreateLabel, setShowCreateLabel] = useState(false)
  const [isFetched, setIsFetched] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const { labels: allLabels, notifyLabelCreated } = useProjectsLabelsUpdates()

  useEffect(() => {
    const fetchLabels = async () => {
      if (!taskId || isFetched) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        const taskLabelsResponse = await fetch(`/api/tasks/${taskId}/${taskId}/labels`);
        
        if (!taskLabelsResponse.ok) {
          const errorData = await taskLabelsResponse.json();
          console.error(`[TaskLabels] Erro ao carregar labels da tarefa:`, errorData);
          throw new Error("Failed to fetch task labels");
        }
        
        const taskLabelsData = await taskLabelsResponse.json();
        setLabels(taskLabelsData.labels);
        setIsFetched(true);
      } catch (error) {
        console.error(`[TaskLabels] Erro ao carregar labels:`, error);
        toast({
          variant: "destructive",
          title: t("Failed to load labels"),
          description: t("Please try again later."),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLabels();
  }, [taskId, isFetched, toast, t]);

  useEffect(() => {
    setIsFetched(false);
    setLabels([]);
    setAllLabels([]);
  }, [taskId]);

  const addLabelToTask = async (labelId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/${taskId}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelId }),
      })

      if (!response.ok) {
        throw new Error("Failed to add label to task")
      }

      const newLabel = allLabels.find(l => l.id === labelId);
      if (newLabel) {
        setLabels(prev => [...prev, newLabel]);
      }

      toast({
        title: t("Label added"),
        description: t("Label has been added to the task successfully."),
      })

      setShowAddLabel(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to add label"),
        description: t("Please try again."),
      })
    }
  }

  const removeLabelFromTask = async (labelId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/${taskId}/labels`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelId }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove label from task")
      }

      setLabels(labels.filter((label) => label.id !== labelId))

      toast({
        title: t("Label removed"),
        description: t("Label has been removed from the task successfully."),
      })

    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to remove label"),
        description: t("Please try again."),
      })
    }
  }

  const handleCreateLabelSuccess = (newLabel: Label) => {
    setShowCreateLabel(false)

    // Atualizar contexto global
    notifyLabelCreated(newLabel)

    toast({
      title: t("Label created"),
      description: t("Label has been created successfully."),
    })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-4" data-testid="task-labels-loading">{t("Loading labels...")}</div>
  }

  return (
    <div className="space-y-4" data-testid="task-labels">
      <div className="flex flex-wrap gap-2 mt-1" data-testid="task-labels-list">
        {labels.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-testid="task-labels-empty">{t("No labels")}</p>
        ) : (
          labels.map((label) => (
            <div
              key={label.id}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: label.color,
                color: getContrastColor(label.color),
              }}
              data-testid={`task-label-${label.id}`}
            >
              <Tag className="mr-1 h-3 w-3" />
              <span data-testid={`task-label-name-${label.id}`}>{label.name}</span>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeLabelFromTask(label.id)}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                  aria-label={`Remove ${label.name} label`}
                  data-testid={`task-label-remove-${label.id}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
      
      {!readOnly && (
        <Dialog open={showAddLabel} onOpenChange={setShowAddLabel} data-testid="task-labels-add-dialog">
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2" id="addLabelBtn" data-testid="task-labels-add-button">
              <Plus className="mr-1 h-3 w-3" />
              {t("Add Label")}
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="task-labels-add-dialog-content">
            <DialogHeader>
              <DialogTitle data-testid="task-labels-add-dialog-title">{t("Add Label")}</DialogTitle>
              <DialogDescription data-testid="task-labels-add-dialog-description">{t("Select a label to add to this task.")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4" data-testid="task-labels-available-list">
              {allLabels.length === 0 ? (
                <p className="text-sm text-muted-foreground" data-testid="task-labels-available-empty">{t("No labels found.")}</p>
              ) : (
                allLabels
                  .filter((label) => !labels.some((l) => l.id === label.id))
                  .map((label) => (
                    <button
                      key={label.id}
                      type="button"
                      className="flex items-center justify-between p-2 border rounded hover:bg-accent"
                      onClick={() => addLabelToTask(label.id)}
                      data-testid={`task-labels-available-${label.id}`}
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: label.color }}
                          data-testid={`task-labels-available-color-${label.id}`}
                        />
                        <span data-testid={`task-labels-available-name-${label.id}`}>{label.name}</span>
                      </div>
                    </button>
                  ))
              )}
            </div>
            <div className="mt-4 border-t pt-4 flex justify-between" data-testid="task-labels-add-dialog-actions">
              <Button variant="outline" onClick={() => setShowAddLabel(false)} data-testid="task-labels-add-dialog-cancel">
                {t("Cancel")}
              </Button>
              <Dialog open={showCreateLabel} onOpenChange={setShowCreateLabel} data-testid="task-labels-create-dialog">
                <DialogTrigger asChild>
                  <Button onClick={() => setShowCreateLabel(true)} data-testid="task-labels-create-button">
                    {t("Create New Label")}
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="task-labels-create-dialog-content">
                  <DialogHeader>
                    <DialogTitle data-testid="task-labels-create-dialog-title">{t("Create New Label")}</DialogTitle>
                    <DialogDescription data-testid="task-labels-create-dialog-description">
                      {t("Fill in the details to create a new label.")}
                    </DialogDescription>
                  </DialogHeader>
                  <LabelForm onSuccess={handleCreateLabelSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

