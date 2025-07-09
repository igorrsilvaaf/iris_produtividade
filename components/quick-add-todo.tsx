"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function QuickAddTodo() {
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState("4")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: t("Error") || "Erro",
        description: t("Title is required") || "O título é obrigatório",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          priority: Number(priority),
        }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to create task")
      }
      
      const data = await response.json()
      
      toast({
        title: t("Task created") || "Tarefa criada",
        description: t("Your task has been added successfully") || "Sua tarefa foi adicionada com sucesso",
      })
      
      // Disparar evento customizado para notificar o Kanban Board
      if (typeof window !== 'undefined' && data.task) {
        const event = new CustomEvent('taskCreated', { 
          detail: { task: data.task, timestamp: Date.now() }
        });
        window.dispatchEvent(event);
      }
      
      setTitle("")
      setPriority("4")
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Error") || "Erro",
        description: t("Failed to create task") || "Falha ao criar tarefa",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col sm:flex-row gap-2" 
      role="form"
      data-testid="quick-add-todo-form"
    >
      <Input
        type="text"
        placeholder={t("Add a new task...") || "Adicionar nova tarefa..."}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1"
        disabled={isLoading}
        data-testid="quick-add-todo-input"
      />
      
      <Select 
        value={priority} 
        onValueChange={setPriority}
        disabled={isLoading}
        data-testid="quick-add-todo-priority-select"
      >
        <SelectTrigger className="w-[130px]" data-testid="quick-add-todo-priority-trigger">
          <SelectValue placeholder={t("Priority") || "Prioridade"} />
        </SelectTrigger>
        <SelectContent data-testid="quick-add-todo-priority-content">
          <SelectItem value="1" data-testid="priority-option-grave">
            {t("Grave") || "Grave"}
          </SelectItem>
          <SelectItem value="2" data-testid="priority-option-alta">
            {t("Alta") || "Alta"}
          </SelectItem>
          <SelectItem value="3" data-testid="priority-option-media">
            {t("Média") || "Média"}
          </SelectItem>
          <SelectItem value="4" data-testid="priority-option-baixa">
            {t("Baixa") || "Baixa"}
          </SelectItem>
        </SelectContent>
      </Select>
      
      <Button 
        type="submit" 
        disabled={isLoading || !title.trim()}
        data-testid="quick-add-todo-submit"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("Adding...") || "Adicionando..."}
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("Add") || "Adicionar"}
          </>
        )}
      </Button>
    </form>
  )
}

export default QuickAddTodo 