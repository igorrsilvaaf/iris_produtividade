"use client"

import { useState, useEffect } from "react"
import { Metadata } from "next"
import { KanbanBoard } from "@/components/kanban-board"
import { useTranslation } from "@/lib/i18n"

export default function KanbanPage() {
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])
  
  return (
    <div className={`container mx-auto py-6 ${isMobile ? "px-0" : "px-6"}`} data-testid="kanban-page">
      <div className={`mb-6 ${isMobile ? "px-4" : ""}`} data-testid="kanban-page-header">
        <h1 className="text-3xl font-bold" data-testid="kanban-page-title">{t("kanbanBoard")}</h1>
        <p className="text-muted-foreground" data-testid="kanban-page-description">{t("organizeYourWorkflow")}</p>
      </div>
      
      <KanbanBoard />
    </div>
  )
} 