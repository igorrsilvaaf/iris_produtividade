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
  Timer,
  Trello,
  FileJson,
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
    href: "/app/pomodoro",
    icon: <Timer className="h-5 w-5" />,
    translationKey: "pomodoro",
  },
  {
    href: "/app/kanban",
    icon: <Trello className="h-5 w-5" />,
    translationKey: "kanban",
  },
  {
    href: "/app/storage",
    icon: <Database className="h-5 w-5" />,
    translationKey: "storage",
  },
  /* Comentado para remover do menu lateral
  {
    href: "/app/api-docs",
    icon: <FileJson className="h-5 w-5" />,
    translationKey: "apiDocs",
  },
  */
]

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname()
  const router = useRouter()
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [labelsOpen, setLabelsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { t, language } = useTranslation()

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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const projectsResponse = await fetch("/api/projects")
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json()
          setProjects(projectsData.projects)
        }

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
    <div className="flex h-full flex-col bg-background" data-testid="app-sidebar">
      <div className="flex h-14 items-center border-b px-4" data-testid="sidebar-header">
        <Link href="/app" className="flex items-center gap-2 font-bold w-full">
          <Logo asLink={false} />
        </Link>
      </div>
      <ScrollArea className="flex-1 px-2 py-4" data-testid="sidebar-content">
        <nav className="grid gap-1" data-testid="sidebar-navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
              )}
              data-testid={`sidebar-nav-${item.translationKey}`}
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
                data-testid="sidebar-projects-toggle"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="h-5 w-5" />
                  {t("projects")}
                </div>
                {projectsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1" data-testid="sidebar-projects-content">
              {isLoading ? (
                <div className="flex items-center justify-center py-4" data-testid="sidebar-projects-loading">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : projects.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground" data-testid="sidebar-projects-empty">
                  {t("No projects found")}
                </p>
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
                    data-testid={`sidebar-project-${project.id}`}
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </Link>
                ))
              )}
              <div className="px-3 py-2">
                <AddProjectDialog>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sm"
                    data-testid="sidebar-add-project-button"
                  >
                    <Plus className="h-4 w-4" />
                    {t("Add project")}
                  </Button>
                </AddProjectDialog>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <div className="mt-6">
          <Collapsible open={labelsOpen} onOpenChange={setLabelsOpen} className="space-y-1">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium"
                data-testid="sidebar-labels-toggle"
              >
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5" />
                  {t("labels")}
                </div>
                {labelsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1" data-testid="sidebar-labels-content">
              {isLoading ? (
                <div className="flex items-center justify-center py-4" data-testid="sidebar-labels-loading">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : labels.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground" data-testid="sidebar-labels-empty">
                  {t("No labels found")}
                </p>
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
                    data-testid={`sidebar-label-${label.id}`}
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="truncate">{label.name}</span>
                  </Link>
                ))
              )}
              <div className="px-3 py-2">
                <AddLabelDialog>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sm"
                    data-testid="sidebar-add-label-button"
                  >
                    <Plus className="h-4 w-4" />
                    {t("Add label")}
                  </Button>
                </AddLabelDialog>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-50 lg:hidden"
              data-testid="mobile-sidebar-toggle"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72" data-testid="mobile-sidebar">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      ) : (
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <SidebarContent />
        </div>
      )}
    </>
  )
}

