"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"

interface BackButtonProps {
  fallbackPath?: string
  className?: string
  onClick?: () => void
}

export function BackButton({ fallbackPath = "/app", className = "", onClick }: BackButtonProps) {
  const router = useRouter()
  const { t } = useTranslation()

  const handleBack = () => {
    if (onClick) {
      onClick()
      return
    }
    
    try {
      router.back()
      
      setTimeout(() => {
        if (typeof window !== 'undefined' && 
            window.location.pathname === window.location.pathname) {
          router.push(fallbackPath)
        }
      }, 100)
    } catch (e) {
      router.push(fallbackPath)
    }
  }

  return (
    <Button 
      onClick={handleBack} 
      variant="ghost" 
      size="icon"
      className={`p-2 hover:bg-accent rounded-full ${className}`}
      aria-label={t("back")}
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  )
} 