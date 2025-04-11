"use client"
import { useRouter } from "next/navigation"
import { Calendar, Database, Settings, User, FileText } from "lucide-react"
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
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { useTranslation } from "@/lib/i18n"

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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background px-4">
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-md">
          <SearchTasks />
        </div>
      </div>
      <nav className="flex items-center gap-1 md:gap-2">
        <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
          <a href="/app/calendar">
            <Calendar className="h-5 w-5" />
            <span className="sr-only">{t("calendar")}</span>
          </a>
        </Button>
        <NotificationsDropdown />
        <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
          <a href="/app/settings">
            <Settings className="h-5 w-5" />
            <span className="sr-only">{t("settings")}</span>
          </a>
        </Button>
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || ""} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("My Account")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="md:hidden">
              <a href="/app/calendar" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                {t("calendar")}
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/app/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                {t("profile")}
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/app/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                {t("settings")}
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/app/storage" className="flex items-center">
                <Database className="mr-2 h-4 w-4" />
                {t("storage")}
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/app/changelog" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                {t("changelog")}
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>{t("logout")}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}

