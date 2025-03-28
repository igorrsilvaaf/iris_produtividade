"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import type { Project } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface ToggleProjectFavoriteProps {
  project: Project
}

export function ToggleProjectFavorite({ project }: ToggleProjectFavoriteProps) {
  const [isFavorite, setIsFavorite] = useState(project.is_favorite)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const toggleFavorite = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${project.id}/favorite`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to update project favorite status")
      }

      const newStatus = !isFavorite
      setIsFavorite(newStatus)

      toast({
        title: newStatus ? "Project added to favorites" : "Project removed from favorites",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update favorite status",
        description: "Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleFavorite}
      disabled={isLoading}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Star className={`h-4 w-4 ${isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
      <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
    </Button>
  )
}

