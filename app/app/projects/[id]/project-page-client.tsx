"use client"

import { TaskList } from "@/components/task-list"
import { ProjectHeaderActions } from "@/components/project-header-actions"
import type { Project } from "@/lib/projects"
import type { Task } from "@/lib/todos"

export function ProjectPageClient({ project, tasks }: { project: Project; tasks: Task[] }) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full" style={{ backgroundColor: project.color }}></div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        <ProjectHeaderActions project={project} />
      </div>

      <TaskList initialTasks={tasks} />
    </div>
  )
}
