"use client"

import React, { createContext, useContext, useCallback, useReducer, useEffect } from 'react'
import type { Project } from '@/lib/projects'
import type { Label } from '@/lib/labels'

// Tipos para o contexto
interface ProjectsLabelsState {
  projects: Project[]
  labels: Label[]
  loading: boolean
  lastUpdate: number
}

type ProjectsLabelsAction =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: number }
  | { type: 'SET_LABELS'; payload: Label[] }
  | { type: 'ADD_LABEL'; payload: Label }
  | { type: 'UPDATE_LABEL'; payload: Label }
  | { type: 'DELETE_LABEL'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TRIGGER_UPDATE' }

interface ProjectsLabelsContextType {
  state: ProjectsLabelsState
  // Projects actions
  addProject: (project: Project) => void
  updateProject: (project: Project) => void
  deleteProject: (projectId: number) => void
  setProjects: (projects: Project[]) => void
  // Labels actions
  addLabel: (label: Label) => void
  updateLabel: (label: Label) => void
  deleteLabel: (labelId: number) => void
  setLabels: (labels: Label[]) => void
  // Common actions
  setLoading: (loading: boolean) => void
  triggerUpdate: () => void
  // Utility functions
  refreshProjects: () => Promise<void>
  refreshLabels: () => Promise<void>
}

// Reducer para gerenciar o estado dos projetos e labels
function projectsLabelsReducer(state: ProjectsLabelsState, action: ProjectsLabelsAction): ProjectsLabelsState {
  switch (action.type) {
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false }
    
    case 'ADD_PROJECT':
      // Verificar se o projeto já existe para evitar duplicatas
      const projectExists = state.projects.some(project => project.id === action.payload.id)
      if (projectExists) {
        return state
      }
      return { 
        ...state, 
        projects: [action.payload, ...state.projects],
        lastUpdate: Date.now()
      }
    
    case 'UPDATE_PROJECT':
      return { 
        ...state, 
        projects: state.projects.map(project => 
          project.id === action.payload.id ? action.payload : project
        ),
        lastUpdate: Date.now()
      }
    
    case 'DELETE_PROJECT':
      return { 
        ...state, 
        projects: state.projects.filter(project => project.id !== action.payload),
        lastUpdate: Date.now()
      }
    
    case 'SET_LABELS':
      return { ...state, labels: action.payload, loading: false }
    
    case 'ADD_LABEL':
      // Verificar se o label já existe para evitar duplicatas
      const labelExists = state.labels.some(label => label.id === action.payload.id)
      if (labelExists) {
        return state
      }
      return { 
        ...state, 
        labels: [action.payload, ...state.labels],
        lastUpdate: Date.now()
      }
    
    case 'UPDATE_LABEL':
      return { 
        ...state, 
        labels: state.labels.map(label => 
          label.id === action.payload.id ? action.payload : label
        ),
        lastUpdate: Date.now()
      }
    
    case 'DELETE_LABEL':
      return { 
        ...state, 
        labels: state.labels.filter(label => label.id !== action.payload),
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
const ProjectsLabelsContext = createContext<ProjectsLabelsContextType | undefined>(undefined)

// Provider do contexto
export function ProjectsLabelsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(projectsLabelsReducer, {
    projects: [],
    labels: [],
    loading: false,
    lastUpdate: 0
  })

  // Funções para gerenciar projetos
  const addProject = useCallback((project: Project) => {
    dispatch({ type: 'ADD_PROJECT', payload: project })
  }, [])

  const updateProject = useCallback((project: Project) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: project })
  }, [])

  const deleteProject = useCallback((projectId: number) => {
    dispatch({ type: 'DELETE_PROJECT', payload: projectId })
  }, [])

  const setProjects = useCallback((projects: Project[]) => {
    dispatch({ type: 'SET_PROJECTS', payload: projects })
  }, [])

  // Funções para gerenciar labels
  const addLabel = useCallback((label: Label) => {
    dispatch({ type: 'ADD_LABEL', payload: label })
  }, [])

  const updateLabel = useCallback((label: Label) => {
    dispatch({ type: 'UPDATE_LABEL', payload: label })
  }, [])

  const deleteLabel = useCallback((labelId: number) => {
    dispatch({ type: 'DELETE_LABEL', payload: labelId })
  }, [])

  const setLabels = useCallback((labels: Label[]) => {
    dispatch({ type: 'SET_LABELS', payload: labels })
  }, [])

  // Funções comuns
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const triggerUpdate = useCallback(() => {
    dispatch({ type: 'TRIGGER_UPDATE' })
  }, [])

  // Funções utilitárias para refresh
  const refreshProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Failed to refresh projects:', error)
    } finally {
      setLoading(false)
    }
  }, [setProjects, setLoading])

  const refreshLabels = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/labels')
      if (response.ok) {
        const data = await response.json()
        setLabels(data.labels)
      }
    } catch (error) {
      console.error('Failed to refresh labels:', error)
    } finally {
      setLoading(false)
    }
  }, [setLabels, setLoading])

  // Carregar dados iniciais
  useEffect(() => {
    refreshProjects()
    refreshLabels()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = {
    state,
    addProject,
    updateProject,
    deleteProject,
    setProjects,
    addLabel,
    updateLabel,
    deleteLabel,
    setLabels,
    setLoading,
    triggerUpdate,
    refreshProjects,
    refreshLabels
  }

  return (
    <ProjectsLabelsContext.Provider value={value}>
      {children}
    </ProjectsLabelsContext.Provider>
  )
}

// Hook para usar o contexto
export function useProjectsLabelsContext() {
  const context = useContext(ProjectsLabelsContext)
  if (context === undefined) {
    throw new Error('useProjectsLabelsContext must be used within a ProjectsLabelsProvider')
  }
  return context
} 