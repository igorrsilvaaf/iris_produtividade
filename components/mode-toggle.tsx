"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslation } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ModeToggleProps {
  className?: string;
  showText?: boolean;
}

export function ModeToggle({ className, showText = true }: ModeToggleProps) {
  const { setTheme, theme } = useTheme()
  const { t } = useTranslation()

  if (!showText) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn(
          "relative h-8 w-8",
          className
        )}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        data-testid="mode-toggle-button"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" data-testid="mode-toggle-sun-icon" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" data-testid="mode-toggle-moon-icon" />
        <span className="sr-only">{t("Toggle theme")}</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "relative",
            className
          )}
          data-testid="mode-toggle-dropdown-trigger"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" data-testid="mode-toggle-sun-icon" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" data-testid="mode-toggle-moon-icon" />
          <span className="sr-only">{t("Toggle theme")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" data-testid="mode-toggle-dropdown-content">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          data-testid="mode-toggle-light-option"
        >
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          data-testid="mode-toggle-dark-option"
        >
          {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          data-testid="mode-toggle-system-option"
        >
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

