"use client"
import { useRouter } from "next/navigation"
import { Calendar, Database, Settings, User, FileText, Info, Search, Menu } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { SearchTasks } from "@/components/search-tasks"
import { TaskNotificationsMenu } from "@/components/task-notifications-menu"
import { useTranslation } from "@/lib/i18n"
import { CHANGELOG_DATA } from "@/lib/changelog-data"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { AppSidebar } from "@/components/app-sidebar"
import { VisuallyHidden } from "@/components/ui/visually-hidden"

type AppHeaderUser = {
  id: number
  name: string
  email: string
  avatar_url?: string | null
}

export function AppHeader({ user }: { user: AppHeaderUser }) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const currentVersion = CHANGELOG_DATA[0]?.version || ""
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      toast({
        title: t("Logged out successfully"),
      })
      router.push("/login")
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Logout failed"),
        description: t("Please try again."),
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-sm px-3 md:px-5">
      {/* Logo/brand area */}
      <div className="flex-none mr-3">
        <a href="/app" className="flex items-center text-xl font-semibold">
          
        </a>
      </div>

      {/* Mobile menu button (positioned to the left of search) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="mr-2 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SheetTitle className="sr-only">
            {t("Navigation Menu")}
          </SheetTitle>
          <AppSidebar user={user} />
        </SheetContent>
      </Sheet>
      
      {/* Search area - always visible on all devices */}
      <div className="flex flex-1 justify-center transition-all duration-200">
        <div className="w-full max-w-md relative">
          <SearchTasks />
        </div>
      </div>
      
      {/* Primary navigation */}
      <nav className="flex items-center gap-1 ml-auto md:ml-4">
        <div className="hidden md:flex items-center mr-1 border-r pr-2 border-muted">
          <Button variant="ghost" size="sm" className="rounded-full h-9 px-3 text-sm font-medium" asChild>
            <a href="/app/calendar" className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {t("calendar")}
            </a>
          </Button>
        </div>
        
        <div className="flex items-center gap-1">
          <TaskNotificationsMenu />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full h-9 w-9 hover:bg-accent/50 hover:text-accent-foreground transition-colors" 
            asChild
          >
            <a href="/app/settings">
              <Settings className="h-4.5 w-4.5" />
              <span className="sr-only">{t("settings")}</span>
            </a>
          </Button>
          
          <ModeToggle className="rounded-full h-9 w-9 hover:bg-accent/50" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9 ml-1 p-0 overflow-hidden ring-2 ring-primary/10 hover:ring-primary/20"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar_url || ""} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 border-muted/50 shadow-lg">
              <div className="flex items-center gap-3 p-2.5 mb-1 rounded-lg">
                <Avatar className="h-10 w-10 border-2 border-muted">
                  <AvatarImage src={user.avatar_url || ""} alt={user.name} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium leading-none">{user.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">{user.email}</span>
                </div>
              </div>
              
              <DropdownMenuSeparator className="my-1" />
              
              <div className="p-1">
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer h-9 px-2 py-1.5">
                  <a href="/app/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    {t("profile")}
                  </a>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer h-9 px-2 py-1.5">
                  <a href="/app/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    {t("settings")}
                  </a>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer h-9 px-2 py-1.5">
                  <a href="/app/storage" className="flex items-center">
                    <Database className="mr-2 h-4 w-4" />
                    {t("storage")}
                  </a>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer h-9 px-2 py-1.5">
                  <a href="/app/changelog" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    {t("changelog")}
                  </a>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="rounded-lg cursor-pointer h-9 px-2 py-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  {t("logout")}
                </DropdownMenuItem>
              </div>
              
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground px-3 py-2 bg-muted/50 rounded-lg mx-1.5">
                <div className="flex items-center">
                  <Info className="mr-1.5 h-3 w-3" />
                  <span>Íris</span>
                </div>
                <span className="font-mono">v{currentVersion}</span>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  )
}

