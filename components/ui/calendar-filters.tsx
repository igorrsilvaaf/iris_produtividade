"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Filter, 
  X, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle 
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import type { Project } from "@/lib/projects"

interface CalendarFiltersProps {
  projects: Project[]
  selectedProject?: string
  selectedStatus?: string
  onProjectChange: (projectId: string) => void
  onStatusChange: (status: string) => void
  onClearFilters: () => void
  className?: string
}

export function CalendarFilters({
  projects,
  selectedProject,
  selectedStatus,
  onProjectChange,
  onStatusChange,
  onClearFilters,
  className
}: CalendarFiltersProps) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const hasActiveFilters = selectedProject || selectedStatus

  const statusOptions = [
    { value: "all", label: t("all"), icon: Calendar },
    { value: "completed", label: t("completed"), icon: CheckCircle },
    { value: "pending", label: t("pending"), icon: Clock },
    { value: "overdue", label: t("overdue"), icon: AlertCircle },
  ]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Project Filter */}
      <Select value={selectedProject} onValueChange={onProjectChange}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder={t("allProjects")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{t("allProjects")}</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id.toString()}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={selectedStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue placeholder={t("allStatus")} />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => {
            const Icon = option.icon
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <Icon className="w-3 h-3" />
                  {option.label}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-8 px-2 text-xs"
        >
          <X className="w-3 h-3 mr-1" />
          {t("clear")}
        </Button>
      )}

      {/* Filter Badge */}
      {hasActiveFilters && (
        <Badge variant="secondary" className="text-xs">
          <Filter className="w-3 h-3 mr-1" />
          {t("filtered")}
        </Badge>
      )}
    </div>
  )
} 