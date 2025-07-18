"use client"

import React, { createContext, useContext, useCallback, useReducer, useEffect } from 'react'
import type { Todo } from '@/lib/todos'

// Tipos para o contexto
interface TaskState {
  tasks: Todo[]
  loading: boolean
  lastUpdate: number
}

type TaskAction =
  | { type: 'SET_TASKS'; payload: Todo[] }
  | { type: 'ADD_TASK'; payload: Todo }
  | { type: 'UPDATE_TASK'; payload: Todo }
  | { type: 'DELETE_TASK'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TRIGGER_UPDATE' }

interface TaskContextType {
  state: TaskState
  addTask: (task: Todo) => void
  updateTask: (task: Todo) => void
  deleteTask: (taskId: number) => void
  setTasks: (tasks: Todo[]) => void
  setLoading: (loading: boolean) => void
  triggerUpdate: () => void
}

// Reducer para gerenciar o estado das tarefas
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false }
    
    case 'ADD_TASK':
      // Verificar se a tarefa já existe para evitar duplicatas
      const taskExists = state.tasks.some(task => task.id === action.payload.id)
      if (taskExists) {
        return state
      }
      return { 
        ...state, 
        tasks: [action.payload, ...state.tasks],
        lastUpdate: Date.now()
      }
    
    case 'UPDATE_TASK':
      return { 
        ...state, 
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
        lastUpdate: Date.now()
      }
    
    case 'DELETE_TASK':
      return { 
        ...state, 
        tasks: state.tasks.filter(task => task.id !== action.payload),
        lastUpdate: Date.now()
      }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'TRIGGER_UPDATE':
      return { ...state, lastUpdate: Date.now() }
    
    default:
      return state
  }
}

// Criar o contexto
const TaskContext = createContext<TaskContextType | undefined>(undefined)

// Provider do contexto
export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    loading: false,
    lastUpdate: 0
  })

  // Funções para gerenciar tarefas
  const addTask = useCallback((task: Todo) => {
    dispatch({ type: 'ADD_TASK', payload: task })
  }, [])

  const updateTask = useCallback((task: Todo) => {
    dispatch({ type: 'UPDATE_TASK', payload: task })
  }, [])

  const deleteTask = useCallback((taskId: number) => {
    dispatch({ type: 'DELETE_TASK', payload: taskId })
  }, [])

  const setTasks = useCallback((tasks: Todo[]) => {
    dispatch({ type: 'SET_TASKS', payload: tasks })
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const triggerUpdate = useCallback(() => {
    dispatch({ type: 'TRIGGER_UPDATE' })
  }, [])

  const value = {
    state,
    addTask,
    updateTask,
    deleteTask,
    setTasks,
    setLoading,
    triggerUpdate
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}

// Hook para usar o contexto
export function useTaskContext() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider')
  }
  return context
} 