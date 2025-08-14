"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useTranslation } from '@/lib/i18n'
import type { KanbanColumnData } from '@/lib/types/kanban'

interface DynamicColumn {
  id: string
  title: string
  color: string
  order: number
  is_default: boolean
  created_at: string
  updated_at: string
}

interface UseDynamicColumnsReturn {
  columns: DynamicColumn[]
  isLoading: boolean
  error: string | null
  fetchColumns: (forceRefresh?: boolean) => Promise<void>
  refreshColumns: () => Promise<void>
  ensureColumnsLoaded: () => Promise<void>
  createColumn: (name: string, color?: string) => Promise<void>
  updateColumn: (id: string, updates: Partial<DynamicColumn>) => Promise<void>
  deleteColumn: (id: string) => Promise<void>
  reorderColumns: (columnIds: string[]) => Promise<void>
}

export function useDynamicColumns(): UseDynamicColumnsReturn {
  const [columns, setColumns] = useState<DynamicColumn[]>([])
  const [isLoading, setIsLoading] = useState(false) // Lazy loading: inicia como false
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()
  const abortControllerRef = useRef<AbortController | null>(null)
  const cacheRef = useRef<{ data: DynamicColumn[], timestamp: number } | null>(null)
  const hasInitializedRef = useRef(false)
  
  // Refs para evitar dependências no useCallback
  const toastRef = useRef(toast)
  const tRef = useRef(t)
  
  // Atualizar refs quando os valores mudarem
  useEffect(() => {
    toastRef.current = toast
  }, [toast])
  
  useEffect(() => {
    tRef.current = t
  }, [t])

  // Função para buscar colunas do servidor com cache
  const fetchColumns = useCallback(async (forceRefresh = false) => {
    try {
      setError(null)
      
      // Verificar cache primeiro (TTL de 2 minutos para colunas)
      const now = Date.now()
      const CACHE_TTL = 2 * 60 * 1000 // 2 minutos
      
      if (!forceRefresh && cacheRef.current && (now - cacheRef.current.timestamp) < CACHE_TTL) {
        setColumns(cacheRef.current.data)
        return
      }
      
      setIsLoading(true)
      
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()
      
      const response = await fetch('/api/kanban/columns', {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Erro ao carregar colunas: ${response.status}`)
      }

      const data = await response.json()
      const columnsData = data.columns || []
      
      // Atualizar cache
      cacheRef.current = {
        data: columnsData,
        timestamp: now
      }
      
      setColumns(columnsData)
      hasInitializedRef.current = true
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Requisição cancelada, não é um erro
      }
      
      console.error('Erro ao buscar colunas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      
      toastRef.current({
        variant: "destructive",
        title: tRef.current("Error loading columns"),
        description: tRef.current("Failed to load Kanban columns")
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Função para criar nova coluna
  const createColumn = useCallback(async (title: string, color: string = '#6b7280') => {
    try {
      const response = await fetch('/api/kanban/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, color }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar coluna')
      }

      const newColumn = await response.json()
      setColumns(prev => [...prev, newColumn].sort((a, b) => a.order - b.order))
      
      toastRef.current({
        variant: "default",
        title: tRef.current("Column created"),
        description: tRef.current("New column has been created successfully")
      })
    } catch (err) {
      console.error('Erro ao criar coluna:', err)
      toastRef.current({
        variant: "destructive",
        title: tRef.current("Error creating column"),
        description: err instanceof Error ? err.message : tRef.current("Failed to create column")
      })
      throw err
    }
  }, [])

  // Função para atualizar coluna
  const updateColumn = useCallback(async (id: string, updates: Partial<Pick<DynamicColumn, 'title' | 'color'>>) => {
    try {
      const response = await fetch(`/api/kanban/columns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar coluna')
      }

      const updatedColumn = await response.json()
      setColumns(prev => prev.map(col => col.id === id ? updatedColumn : col))
      
      toastRef.current({
        variant: "default",
        title: tRef.current("Column updated"),
        description: tRef.current("Column has been updated successfully")
      })
    } catch (err) {
      console.error('Erro ao atualizar coluna:', err)
      toastRef.current({
        variant: "destructive",
        title: tRef.current("Error updating column"),
        description: err instanceof Error ? err.message : tRef.current("Failed to update column")
      })
      throw err
    }
  }, [])

  // Função para deletar coluna
  const deleteColumn = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/kanban/columns/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao deletar coluna')
      }

      setColumns(prev => prev.filter(col => col.id !== id))
      
      toastRef.current({
        variant: "default",
        title: tRef.current("Column deleted"),
        description: tRef.current("Column has been deleted successfully")
      })
    } catch (err) {
      console.error('Erro ao deletar coluna:', err)
      toastRef.current({
        variant: "destructive",
        title: tRef.current("Error deleting column"),
        description: err instanceof Error ? err.message : tRef.current("Failed to delete column")
      })
      throw err
    }
  }, [])

  // Função para reordenar colunas
  const reorderColumns = useCallback(async (columnIds: string[]) => {
    try {
      const response = await fetch('/api/kanban/columns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ columnIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao reordenar colunas')
      }

      // Atualizar ordem local
      setColumns(prev => {
        const reordered = [...prev]
        reordered.sort((a, b) => {
          const aIndex = columnIds.indexOf(a.id)
          const bIndex = columnIds.indexOf(b.id)
          return aIndex - bIndex
        })
        return reordered.map((col, index) => ({ ...col, order: index }))
      })
      
      toastRef.current({
        variant: "default",
        title: tRef.current("Columns reordered"),
        description: tRef.current("Column order has been updated successfully")
      })
    } catch (err) {
      console.error('Erro ao reordenar colunas:', err)
      toastRef.current({
        variant: "destructive",
        title: tRef.current("Error reordering columns"),
        description: err instanceof Error ? err.message : tRef.current("Failed to reorder columns")
      })
      throw err
    }
  }, [])

  // Função para atualizar colunas manualmente
  const refreshColumns = useCallback(async () => {
    await fetchColumns(true) // Forçar refresh
  }, [fetchColumns])
  
  // Função para carregar colunas sob demanda (lazy loading)
  const ensureColumnsLoaded = useCallback(async () => {
    if (!hasInitializedRef.current) {
      await fetchColumns()
    }
  }, [fetchColumns])

  // Carregar colunas na inicialização (sem dependências para evitar loops)
  useEffect(() => {
    fetchColumns()
    
    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, []) // Removido fetchColumns das dependências para evitar loop infinito

  return {
    columns,
    isLoading,
    error,
    fetchColumns,
    refreshColumns,
    ensureColumnsLoaded,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
  }
}