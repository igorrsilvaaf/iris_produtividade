import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { TaskProvider } from '@/contexts/task-context'
import { ProjectsLabelsProvider } from '@/contexts/projects-labels-context'

// Provider wrapper para testes
const TestProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProjectsLabelsProvider>
      <TaskProvider>
        {children}
      </TaskProvider>
    </ProjectsLabelsProvider>
  )
}

// Custom render que inclui providers necessários
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestProviders, ...options })

// Re-export tudo do testing-library
export * from '@testing-library/react'

// Override the original render with our custom render
export { customRender as render } 