"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tag, Plus, X } from "lucide-react"
import type { Label } from "@/lib/labels"
import { useTranslation } from "@/lib/i18n"
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
  const [isFetched, setIsFetched] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    const fetchLabels = async () => {
      if (!taskId || isFetched) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        console.log(`[TaskLabels] Iniciando carregamento de labels para tarefa ${taskId}`);
        
        const taskLabelsResponse = await fetch(`/api/tasks/${taskId}/labels`);
        
        if (!taskLabelsResponse.ok) {
          const errorData = await taskLabelsResponse.json();
          console.error(`[TaskLabels] Erro ao carregar labels da tarefa:`, errorData);
          throw new Error("Failed to fetch task labels");
        }
        
        const taskLabelsData = await taskLabelsResponse.json();
        console.log(`[TaskLabels] Labels da tarefa carregadas:`, taskLabelsData.labels);
        setLabels(taskLabelsData.labels);

        const allLabelsResponse = await fetch("/api/labels");
        
        if (!allLabelsResponse.ok) {
          const errorData = await allLabelsResponse.json();
          console.error(`[TaskLabels] Erro ao carregar todas as labels:`, errorData);
          throw new Error("Failed to fetch all labels");
        }
        
        const allLabelsData = await allLabelsResponse.json();
        console.log(`[TaskLabels] Todas as labels carregadas:`, allLabelsData.labels);
        setAllLabels(allLabelsData.labels);
        
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
  }, [taskId, toast, t, isFetched]);

  useEffect(() => {
    setIsFetched(false);
    setLabels([]);
    setAllLabels([]);
  }, [taskId]);

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
      const response = await fetch(`/api/tasks/${taskId}/labels`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelId }),
      })

      if (!response.ok) {
        throw new Error("Failed to remove label from task")
      }

      // Atualizar o estado local em vez de fazer nova requisição
      setLabels(labels.filter((label) => label.id !== labelId))

      toast({
        title: t("Label removed"),
        description: t("Label has been removed from the task successfully."),
      })

      // Remover o router.refresh() para evitar múltiplas chamadas de API
    } catch (error) {
      console.error(`[TaskLabels] Erro ao remover label:`, error);
      toast({
        variant: "destructive",
        title: t("Failed to remove label"),
        description: t("Please try again."),
      })
    }
  }

  const handleCreateLabelSuccess = () => {
    setShowCreateLabel(false)

    // Atualizar todas as etiquetas sem triggar refresh
    fetch("/api/labels")
      .then((response) => response.json())
      .then((data) => {
        setAllLabels(data.labels);
        console.log(`[TaskLabels] Labels atualizadas após criação:`, data.labels);
      })
      .catch((error) => {
        console.error(`[TaskLabels] Erro ao atualizar labels após criação:`, error);
        toast({
          variant: "destructive",
          title: t("Failed to refresh labels"),
          description: t("Please try again later."),
        })
      })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">{t("Loading labels...")}</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t("labels")}</h3>
        <Dialog open={showAddLabel} onOpenChange={setShowAddLabel}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-1 h-3 w-3" />
              {t("Add Label")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Add Label")}</DialogTitle>
              <DialogDescription>{t("Select a label to add to this task.")}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              {allLabels.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("No labels found.")}</p>
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
                {t("Create New Label")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        {labels.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("No labels assigned to this task.")}</p>
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
            <DialogTitle>{t("Create Label")}</DialogTitle>
            <DialogDescription>{t("Create a new label to organize your tasks.")}</DialogDescription>
          </DialogHeader>
          <LabelForm onSuccess={handleCreateLabelSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

