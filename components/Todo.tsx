"use client"

import { useState, useEffect, useRef } from "react"
import type { Todo as TodoType } from "@/lib/todos"
import { CircleDot } from "lucide-react"

interface TodoProps {
  todo?: TodoType
  onComplete?: (id: number) => void
  onDelete?: (id: number) => void
}

// Helper function to get points color
function getPointsColor(points: number) {
  switch (points) {
    case 1: return "text-gray-400"
    case 2: return "text-green-500" 
    case 3: return "text-blue-500"
    case 4: return "text-orange-500"
    case 5: return "text-red-500"
    default: return "text-blue-500"
  }
}

// Helper function to get points label
function getPointsLabel(points: number) {
  switch (points) {
    case 1: return "Muito Fácil"
    case 2: return "Fácil"
    case 3: return "Médio"
    case 4: return "Difícil"
    case 5: return "Muito Difícil"
    default: return "Médio"
  }
}

export function Todo({ todo, onComplete, onDelete }: TodoProps) {
  const [isClient, setIsClient] = useState(false)
  // Usar ref para rastrear a primeira renderização
  const initialLoadDone = useRef(false)
  
  // Detectar quando está no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Estado para dados locais
  const [localData, setLocalData] = useState<TodoType | null>(null)
  
  // Carregar dados do localStorage apenas no cliente e apenas na primeira renderização
  useEffect(() => {
    if (!isClient || initialLoadDone.current) return
    
    try {
      // Se não temos todo via props, tentar carregar do localStorage
      if (!todo && localStorage) {
        const saved = localStorage.getItem('todo-data')
        if (saved) {
          setLocalData(JSON.parse(saved))
        }
      }
      initialLoadDone.current = true
    } catch (error) {
      console.error("Erro ao carregar do localStorage:", error)
    }
  }, [isClient, todo])
  
  // Salvar dados no localStorage quando mudarem - usando useRef para evitar loop infinito
  useEffect(() => {
    if (!isClient || !todo) return
    
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('todo-data', JSON.stringify(todo))
      } catch (error) {
        console.error("Erro ao salvar no localStorage:", error)
      }
    }, 500) // Debounce para evitar muitas gravações
    
    return () => clearTimeout(timeoutId)
  }, [isClient, todo])
  
  // Usar dados das props ou do localStorage
  const todoData = todo || localData
  
  if (!todoData) {
    return null
  }
  
  return (
    <div className="p-4 border rounded-lg mb-2">
      <h3 className={`font-medium ${todoData.completed ? 'line-through opacity-70' : ''}`}>
        {todoData.title}
      </h3>
      {todoData.description && (
        <p className="text-sm text-muted-foreground mt-1">{todoData.description}</p>
      )}
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {todoData.points && (
          <div className="flex items-center text-xs text-left">
            <CircleDot className={`mr-1 h-3 w-3 ${getPointsColor(todoData.points)}`} />
            <span>{todoData.points} - {getPointsLabel(todoData.points)}</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        {onComplete && !todoData.completed && (
          <button 
            onClick={() => onComplete(todoData.id)}
            className="px-2 py-1 bg-green-500 text-white text-xs rounded"
          >
            Completar
          </button>
        )}
        {onDelete && (
          <button 
            onClick={() => onDelete(todoData.id)}
            className="px-2 py-1 bg-red-500 text-white text-xs rounded"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  )
}

// Also export as default for convenience
export default Todo 