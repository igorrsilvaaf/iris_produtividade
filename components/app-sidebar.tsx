"use client"

import type React from "react"

import { useState, useEffect, useReducer } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  Home,
  Inbox,
  LayoutDashboard,
  Menu,
  Plus,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AddProjectDialog } from "@/components/add-project-dialog"
import { AddLabelDialog } from "@/components/add-label-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import type { Project } from "@/lib/projects"
import type { Label } from "@/lib/labels"
import { Logo } from "@/components/logo"

type User = {
  id: number
  name: string
  email: string
}

type NavItem = {
  href: string
  icon: React.ReactNode
  translationKey: string
}

// Adicionar um novo item de navegação após o item "Completed"
const navItems: NavItem[] = [
  {
    href: "/app",
    icon: <Home className="h-5 w-5" />,
    translationKey: "today",
  },
  {
    href: "/app/inbox",
    icon: <Inbox className="h-5 w-5" />,
    translationKey: "inbox",
  },
  {
    href: "/app/upcoming",
    icon: <Calendar className="h-5 w-5" />,
    translationKey: "upcoming",
  },
  {
    href: "/app/completed",
    icon: <CheckCircle2 className="h-5 w-5" />,
    translationKey: "completed",
  },
  {
    href: "/app/storage",
    icon: <Database className="h-5 w-5" />,
    translationKey: "storage",
  },
]

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [labelsOpen, setLabelsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { t, language } = useTranslation()

  // Log para diagnóstico
  useEffect(() => {
    console.log("[AppSidebar] Montagem inicial do componente")
    console.log("[AppSidebar] Idioma atual:", language)
    console.log("[AppSidebar] Tradução 'inbox':", t("inbox"))
    console.log("[AppSidebar] Tradução 'today':", t("today"))
    console.log("[AppSidebar] Tradução 'upcoming':", t("upcoming"))
    console.log("[AppSidebar] Tradução 'completed':", t("completed"))
    
    // Verificar se o documento tem o atributo de idioma
    if (typeof document !== 'undefined') {
      console.log("[AppSidebar] Atributo data-language no HTML:", document.documentElement.getAttribute('data-language'))
      console.log("[AppSidebar] Atributo lang no HTML:", document.documentElement.lang)
    }
  }, [language, t])

  // Detectar se é dispositivo móvel
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

  // Fechar o menu móvel quando uma rota é selecionada
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Buscar projetos e etiquetas
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Buscar projetos
        const projectsResponse = await fetch("/api/projects")
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json()
          setProjects(projectsData.projects)
        }

        // Buscar etiquetas
        const labelsResponse = await fetch("/api/labels")
        if (labelsResponse.ok) {
          const labelsData = await labelsResponse.json()
          setLabels(labelsData.labels)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: t("Failed to load data"),
          description: t("Please refresh the page to try again."),
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/app" className="flex items-center gap-2 font-bold">
          <Logo asLink={false} />
        </Link>
      </div>
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="grid gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              {item.icon}
              {t(item.translationKey)}
            </Link>
          ))}
        </nav>
        <div className="mt-6">
          <Collapsible open={projectsOpen} onOpenChange={setProjectsOpen} className="space-y-1">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5" />
                  {t("projects")}
                </div>
                {projectsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : projects.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">{t("No projects found")}</p>
              ) : (
                projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/app/projects/${project.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-8 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      pathname === `/app/projects/${project.id}`
                        ? "bg-accent text-accent-foreground"
                        : "transparent",
                    )}
                  >
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                    {project.name}
                    {project.is_favorite && <span className="ml-auto text-yellow-400">★</span>}
                  </Link>
                ))
              )}
              <AddProjectDialog>
                <Button
                  variant="ghost"
                  className="flex w-full items-center gap-3 rounded-lg px-8 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <Plus className="h-4 w-4" />
                  {t("addProject")}
                </Button>
              </AddProjectDialog>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <div className="mt-2">
          <Collapsible open={labelsOpen} onOpenChange={setLabelsOpen} className="space-y-1">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
              >
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5" />
                  {t("labels")}
                </div>
                {labelsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : labels.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">{t("No labels found")}</p>
              ) : (
                labels.map((label) => (
                  <Link
                    key={label.id}
                    href={`/app/labels/${label.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-8 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      pathname === `/app/labels/${label.id}`
                        ? "bg-accent text-accent-foreground"
                        : "transparent",
                    )}
                  >
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: label.color }} />
                    {label.name}
                  </Link>
                ))
              )}
              <AddLabelDialog>
                <Button
                  variant="ghost"
                  className="flex w-full items-center gap-3 rounded-lg px-8 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  <Plus className="h-4 w-4" />
                  {t("addLabel")}
                </Button>
              </AddLabelDialog>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  )

  // Versão para desktop
  if (!isMobile) {
    return <SidebarContent />
  }

  // Versão para mobile com Sheet
  return (
    <>
      <div className="flex h-14 items-center justify-between border-b px-4 md:hidden">
        <Link href="/app" className="flex items-center gap-2 font-bold">
          <Logo asLink={false} />
        </Link>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

