"use client"

import React, { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Settings, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PomodoroSettings } from "@/components/pomodoro-settings"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import { useAudioPlayer } from "@/lib/audio-utils"

interface PomodoroTimerProps {
  initialSettings: {
    pomodoro_work_minutes: number
    pomodoro_break_minutes: number
    pomodoro_long_break_minutes: number
    pomodoro_cycles: number
    enable_sound: boolean
    notification_sound: string
    pomodoro_sound: string
    enable_desktop_notifications: boolean
  }
  selectedTaskId?: number | null
  fullScreen?: boolean
}

type TimerMode = "work" | "shortBreak" | "longBreak"

export function PomodoroTimer({ initialSettings, selectedTaskId, fullScreen = false }: PomodoroTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>("work")
  const [timeLeft, setTimeLeft] = useState(initialSettings.pomodoro_work_minutes * 60)
  const [cycles, setCycles] = useState(0)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [settings, setSettings] = useState({
    workMinutes: initialSettings.pomodoro_work_minutes,
    shortBreakMinutes: initialSettings.pomodoro_break_minutes,
    longBreakMinutes: initialSettings.pomodoro_long_break_minutes,
    longBreakInterval: initialSettings.pomodoro_cycles,
    enableSound: initialSettings.enable_sound,
    notificationSound: initialSettings.notification_sound,
    pomodoroSound: initialSettings.pomodoro_sound || "pomodoro",
    enableDesktopNotifications: initialSettings.enable_desktop_notifications,
  })
  const [showSettings, setShowSettings] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const { t } = useTranslation()
  const { playSound } = useAudioPlayer()

  // Fetch task details if selectedTaskId is provided
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!selectedTaskId) {
        setSelectedTask(null)
        return
      }
      
      try {
        const response = await fetch(`/api/tasks/${selectedTaskId}`)
        if (response.ok) {
          const data = await response.json()
          setSelectedTask(data.task)
        }
      } catch (error) {
        console.error("Error fetching task details:", error)
      }
    }
    
    fetchTaskDetails()
  }, [selectedTaskId])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setTimeout(() => handleTimerComplete(), 0);
            return 0;
          }
          return prevTime - 1;
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
    try {
      // Play sound if enabled and a sound is selected
      if (settings.enableSound && settings.pomodoroSound !== 'none') {
        console.log(`Tocando som do pomodoro ao completar timer: ${settings.pomodoroSound}`);
        playSound(settings.pomodoroSound);
      } else if (settings.enableSound) {
        console.log("Som do pomodoro desativado (none)");
      }

      // Show desktop notification if enabled
      if (settings.enableDesktopNotifications && Notification.permission === "granted") {
        const title = mode === "work" ? t("workSessionCompleted") : t("breakTimeOver")
        const body = mode === "work" 
          ? (selectedTask ? `${t("timeForBreak")} (${selectedTask.title})` : t("timeForBreak"))
          : (selectedTask ? `${t("backToWork")} (${selectedTask.title})` : t("backToWork"))

        try {
          new Notification(title, {
            body,
            icon: "/favicon.ico",
          })
        } catch (error) {
          console.error("Error showing notification:", error);
        }
      }

      // Show toast notification
      toast({
        title: mode === "work" ? t("workSessionCompleted") : t("breakTimeOver"),
        description: mode === "work" 
          ? (selectedTask ? `${t("timeForBreak")} (${selectedTask.title})` : t("timeForBreak"))
          : (selectedTask ? `${t("backToWork")} (${selectedTask.title})` : t("backToWork")),
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
    } catch (error) {
      console.error("Error in handleTimerComplete:", error);
      // Ensure timer is stopped and reset to a safe state
      setIsRunning(false);
      setTimeLeft(settings.workMinutes * 60);
    }
  }

  // Set document title
  useEffect(() => {
    const originalTitle = document.title

    if (isRunning) {
      const minutes = Math.floor(timeLeft / 60)
      const seconds = timeLeft % 60
      const time = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      const taskInfo = selectedTask ? ` - ${selectedTask.title}` : ""
      document.title = `${time} - ${mode === "work" ? t("work") : t(mode === "shortBreak" ? "shortBreak" : "longBreak")}${taskInfo}`
    }

    return () => {
      document.title = originalTitle
    }
  }, [timeLeft, isRunning, mode, t, selectedTask])

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    let total
    switch (mode) {
      case "work":
        total = settings.workMinutes * 60
        break
      case "shortBreak":
        total = settings.shortBreakMinutes * 60
        break
      case "longBreak":
        total = settings.longBreakMinutes * 60
        break
    }
    return 100 - (timeLeft / total) * 100
  }

  return (
    <>
      <Card className={fullScreen ? "h-full border-0 shadow-none rounded-none flex flex-col bg-transparent" : ""}>
        <CardHeader className={`pb-2 flex flex-row items-center justify-between ${fullScreen ? 'pt-2' : ''}`}>
          <CardTitle className="text-lg sm:text-xl">{t("pomodoroTimer")}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
            <span className="sr-only">{t("settings")}</span>
          </Button>
        </CardHeader>
        <CardContent className={`pt-0 ${fullScreen ? 'flex flex-col items-center justify-center flex-1' : ''}`}>
          <div className={`${fullScreen ? 'w-full max-w-md mx-auto' : 'w-full'}`}>
            <Tabs
              defaultValue="work"
              value={mode}
              onValueChange={(value) => handleSetMode(value as TimerMode)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="work" className="px-2 py-1.5 text-xs sm:text-sm">
                  {t("work")}
                </TabsTrigger>
                <TabsTrigger value="shortBreak" className="px-2 py-1.5 text-xs sm:text-sm">
                  {t("shortBreak")}
                </TabsTrigger>
                <TabsTrigger value="longBreak" className="px-2 py-1.5 text-xs sm:text-sm">
                  {t("longBreak")}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className={`w-full flex flex-col items-center ${fullScreen ? 'flex-1 justify-center' : 'mt-4 sm:mt-6'}`}>
            <div className={`${fullScreen ? 'text-6xl sm:text-7xl mb-6' : 'text-4xl sm:text-5xl'} font-bold tabular-nums`}>{formatTime(timeLeft)}</div>
            
            <div className={`w-full ${fullScreen ? 'max-w-[85%] mx-auto mb-8' : 'mt-4 mb-6'}`}>
              <Progress value={getProgress()} className={`${fullScreen ? 'h-3' : 'h-2'} w-full`} />
            </div>

            <div className={`flex items-center justify-center gap-6 ${fullScreen ? 'mb-6' : ''}`}>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleTimer} 
                className={`${fullScreen ? 'h-16 w-16' : 'h-12 w-12'} rounded-full ${isRunning ? 'bg-primary/10 hover:bg-primary/20 border-primary/20' : 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary'}`}
              >
                {isRunning ? 
                  <Pause className={fullScreen ? "h-8 w-8" : "h-6 w-6"} /> : 
                  <Play className={fullScreen ? "h-8 w-8" : "h-6 w-6"} />
                }
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={resetTimer} 
                className={`${fullScreen ? 'h-12 w-12' : 'h-10 w-10'} rounded-full bg-transparent`}
              >
                <RotateCcw className={fullScreen ? "h-5 w-5" : "h-4 w-4"} />
              </Button>
            </div>

            <div className={`text-xs sm:text-sm text-muted-foreground ${fullScreen ? 'mt-2' : 'mt-6'}`}>
              {t("cycle")}: {cycles % settings.longBreakInterval}/{settings.longBreakInterval}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <PomodoroSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        onSave={(newSettings: {
          workMinutes: number;
          shortBreakMinutes: number;
          longBreakMinutes: number;
          longBreakInterval: number;
          enableSound: boolean;
          notificationSound: string;
          pomodoroSound: string;
          enableDesktopNotifications: boolean;
        }) => {
          setSettings(newSettings)
          // Reset the current timer with the new settings
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
        }}
      />
    </>
  )
}

