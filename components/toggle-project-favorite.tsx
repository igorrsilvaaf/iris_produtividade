"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import { useProjectsLabelsUpdates } from "@/hooks/use-projects-labels-updates"
import type { Project } from "@/lib/projects"

interface ToggleProjectFavoriteProps {
  project: Project
}

export function ToggleProjectFavorite({ project }: ToggleProjectFavoriteProps) {
  const [isFavorite, setIsFavorite] = useState(project.is_favorite)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const { notifyProjectUpdated } = useProjectsLabelsUpdates()

  const handleToggleFavorite = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${project.id}/favorite`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to toggle favorite")
      }

      const updatedProject = await response.json()
      setIsFavorite(!isFavorite)
      
      // Atualizar contexto global
      notifyProjectUpdated(project.id, { ...project, is_favorite: !isFavorite })

      toast({
        title: !isFavorite ? t("Added to favorites") : t("Removed from favorites"),
        description: !isFavorite ? t("Project added to favorites.") : t("Project removed from favorites."),
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to toggle favorite"),
        description: t("Please try again."),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className="h-8 w-8 p-0"
    >
      <Heart
        className={`h-4 w-4 ${
          isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
        }`}
      />
    </Button>
  )
}

