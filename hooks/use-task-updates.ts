"use client"

import { useCallback } from "react"
import { useTaskContext } from "@/contexts/task-context"
import type { Todo } from "@/lib/todos"

export type TaskUpdateEvent = {
  type: "created" | "updated" | "completed" | "deleted"
  taskId: number
  task?: Todo
  newColumn?: string
  oldColumn?: string
}

export function useTaskUpdates() {
  const { state, addTask, updateTask, deleteTask, triggerUpdate } = useTaskContext()

  const notifyTaskCreated = useCallback((task: Todo) => {
    addTask(task)
  }, [addTask])

  const notifyTaskCompleted = useCallback((taskId: number, task: Todo) => {
    updateTask(task)
  }, [updateTask])

  const notifyTaskUpdated = useCallback((taskId: number, task: Todo, oldColumn?: string) => {
    updateTask(task)
  }, [updateTask])

  const notifyTaskDeleted = useCallback((taskId: number) => {
    deleteTask(taskId)
  }, [deleteTask])

  return {
    lastUpdate: state.lastUpdate,
    notifyTaskCreated,
    notifyTaskCompleted,
    notifyTaskUpdated,
    notifyTaskDeleted,
    triggerUpdate
  }
} 