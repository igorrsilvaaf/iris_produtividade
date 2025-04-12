"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import { useAudioPlayer } from "@/lib/audio-utils"

type TimerMode = "work" | "shortBreak" | "longBreak"

interface PomodoroContextType {
  isRunning: boolean
  mode: TimerMode
  timeLeft: number
  cycles: number
  settings: {
    workMinutes: number
    shortBreakMinutes: number
    longBreakMinutes: number
    longBreakInterval: number
    enableSound: boolean
    notificationSound: string
    enableDesktopNotifications: boolean
  }
  toggleTimer: () => void
  resetTimer: () => void
  setMode: (mode: TimerMode) => void
  updateSettings: (settings: PomodoroContextType["settings"]) => void
}

const PomodoroContext = createContext<PomodoroContextType | null>(null)

export function PomodoroProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode
  initialSettings: {
    pomodoro_work_minutes: number
    pomodoro_break_minutes: number
    pomodoro_long_break_minutes: number
    pomodoro_cycles: number
    enable_sound: boolean
    notification_sound: string
    enable_desktop_notifications: boolean
  }
}) {
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>("work")
  const [timeLeft, setTimeLeft] = useState(initialSettings.pomodoro_work_minutes * 60)
  const [cycles, setCycles] = useState(0)
  const [settings, setSettings] = useState({
    workMinutes: initialSettings.pomodoro_work_minutes,
    shortBreakMinutes: initialSettings.pomodoro_break_minutes,
    longBreakMinutes: initialSettings.pomodoro_long_break_minutes,
    longBreakInterval: initialSettings.pomodoro_cycles,
    enableSound: initialSettings.enable_sound,
    notificationSound: initialSettings.notification_sound,
    enableDesktopNotifications: initialSettings.enable_desktop_notifications,
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()
  const { playSound } = useAudioPlayer()

  // Verificar e solicitar permissão para notificações quando habilitado
  useEffect(() => {
    if (settings.enableDesktopNotifications && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(err => {
          console.error('Erro ao solicitar permissão de notificação:', err);
        });
      }
    }
  }, [settings.enableDesktopNotifications]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimerComplete()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  const handleTimerComplete = () => {
    clearInterval(intervalRef.current!)
    intervalRef.current = null

    // Play sound if enabled
    if (settings.enableSound) {
      playSound(settings.notificationSound)
    }

    // Show desktop notification if enabled
    if (settings.enableDesktopNotifications && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === "granted") {
        const title = mode === "work" ? t("workSessionCompleted") : t("breakTimeOver")
        const body = mode === "work" ? t("timeForBreak") : t("backToWork")

        try {
          new Notification(title, {
            body,
            icon: "/favicon.ico",
          })
        } catch (error) {
          console.error('Erro ao exibir notificação:', error);
        }
      } else if (Notification.permission === "default") {
        // Tentar solicitar permissão novamente
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            const title = mode === "work" ? t("workSessionCompleted") : t("breakTimeOver")
            const body = mode === "work" ? t("timeForBreak") : t("backToWork")
            
            new Notification(title, {
              body,
              icon: "/favicon.ico",
            })
          }
        }).catch(err => {
          console.error('Erro ao solicitar permissão de notificação:', err);
        });
      }
    }

    // Show toast notification
    toast({
      title: mode === "work" ? t("workSessionCompleted") : t("breakTimeOver"),
      description: mode === "work" ? t("timeForBreak") : t("backToWork"),
    })

    // Switch to next mode
    if (mode === "work") {
      const newCycles = cycles + 1
      setCycles(newCycles)

      if (newCycles % settings.longBreakInterval === 0) {
        setMode("longBreak")
        setTimeLeft(settings.longBreakMinutes * 60)
      } else {
        setMode("shortBreak")
        setTimeLeft(settings.shortBreakMinutes * 60)
      }
    } else {
      setMode("work")
      setTimeLeft(settings.workMinutes * 60)
    }

    setIsRunning(false)
  }

  // Set document title
  useEffect(() => {
    const originalTitle = document.title

    if (isRunning) {
      const minutes = Math.floor(timeLeft / 60)
      const seconds = timeLeft % 60
      const time = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      document.title = `${time} - ${mode === "work" ? t("work") : t(mode === "shortBreak" ? "shortBreak" : "longBreak")}`
    }

    return () => {
      document.title = originalTitle
    }
  }, [timeLeft, isRunning, mode, t])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    switch (mode) {
      case "work":
        setTimeLeft(settings.workMinutes * 60)
        break
      case "shortBreak":
        setTimeLeft(settings.shortBreakMinutes * 60)
        break
      case "longBreak":
        setTimeLeft(settings.longBreakMinutes * 60)
        break
    }
  }

  const handleSetMode = (newMode: TimerMode) => {
    setMode(newMode)
    setIsRunning(false)
    switch (newMode) {
      case "work":
        setTimeLeft(settings.workMinutes * 60)
        break
      case "shortBreak":
        setTimeLeft(settings.shortBreakMinutes * 60)
        break
      case "longBreak":
        setTimeLeft(settings.longBreakMinutes * 60)
        break
    }
  }

  const updateSettings = (newSettings: PomodoroContextType["settings"]) => {
    setSettings(newSettings)
    switch (mode) {
      case "work":
        setTimeLeft(newSettings.workMinutes * 60)
        break
      case "shortBreak":
        setTimeLeft(newSettings.shortBreakMinutes * 60)
        break
      case "longBreak":
        setTimeLeft(newSettings.longBreakMinutes * 60)
        break
    }
  }

  return (
    <PomodoroContext.Provider
      value={{
        isRunning,
        mode,
        timeLeft,
        cycles,
        settings,
        toggleTimer,
        resetTimer,
        setMode: handleSetMode,
        updateSettings,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  )
}

export function usePomodoroTimer() {
  const context = useContext(PomodoroContext)
  if (!context) {
    throw new Error("usePomodoroTimer must be used within a PomodoroProvider")
  }
  return context
} 