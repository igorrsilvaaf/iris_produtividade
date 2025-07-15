"use client"

import { useCallback } from "react"
import { useProjectsLabelsContext } from "@/contexts/projects-labels-context"
import type { Project } from "@/lib/projects"
import type { Label } from "@/lib/labels"

export type ProjectUpdateEvent = {
  type: "created" | "updated" | "deleted"
  projectId: number
  project?: Project
}

export type LabelUpdateEvent = {
  type: "created" | "updated" | "deleted"
  labelId: number
  label?: Label
}

export function useProjectsLabelsUpdates() {
  const { 
    state, 
    addProject, 
    updateProject, 
    deleteProject, 
    addLabel, 
    updateLabel, 
    deleteLabel, 
    triggerUpdate 
  } = useProjectsLabelsContext()

  // Project update functions
  const notifyProjectCreated = useCallback((project: Project) => {
    addProject(project)
  }, [addProject])

  const notifyProjectUpdated = useCallback((projectId: number, project: Project) => {
    updateProject(project)
  }, [updateProject])

  const notifyProjectDeleted = useCallback((projectId: number) => {
    deleteProject(projectId)
  }, [deleteProject])

  // Label update functions
  const notifyLabelCreated = useCallback((label: Label) => {
    addLabel(label)
  }, [addLabel])

  const notifyLabelUpdated = useCallback((labelId: number, label: Label) => {
    updateLabel(label)
  }, [updateLabel])

  const notifyLabelDeleted = useCallback((labelId: number) => {
    deleteLabel(labelId)
  }, [deleteLabel])

  return {
    lastUpdate: state.lastUpdate,
    projects: state.projects,
    labels: state.labels,
    loading: state.loading,
    // Project notifications
    notifyProjectCreated,
    notifyProjectUpdated,
    notifyProjectDeleted,
    // Label notifications
    notifyLabelCreated,
    notifyLabelUpdated,
    notifyLabelDeleted,
    // Common
    triggerUpdate
  }
} 