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
    if (settings.enableDesktopNotifications && Notification.permission === "granted") {
      const title = mode === "work" ? t("workSessionCompleted") : t("breakTimeOver")
      const body = mode === "work" 
        ? (selectedTask ? `${t("timeForBreak")} (${selectedTask.title})` : t("timeForBreak"))
        : (selectedTask ? `${t("backToWork")} (${selectedTask.title})` : t("backToWork"))

      new Notification(title, {
        body,
        icon: "/favicon.ico",
      })
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
      <Card className={fullScreen ? "h-full border-0 rounded-none shadow-none flex flex-col" : ""}>
        <CardHeader className={`pb-2 flex flex-row items-center justify-between ${fullScreen ? 'pt-4' : ''}`}>
          <CardTitle className="text-lg sm:text-xl">{t("pomodoroTimer")}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
            <span className="sr-only">{t("settings")}</span>
          </Button>
        </CardHeader>
        <CardContent className={`pt-0 ${fullScreen ? 'flex flex-col items-center justify-center flex-1' : ''}`}>
          <Tabs
            defaultValue="work"
            value={mode}
            onValueChange={(value) => handleSetMode(value as TimerMode)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 gap-3 p-1.5">
              <TabsTrigger value="work" className="px-2 py-2 text-xs sm:text-sm">
                {t("work")}
              </TabsTrigger>
              <TabsTrigger value="shortBreak" className="px-2 py-2 text-xs sm:text-sm">
                {t("shortBreak")}
              </TabsTrigger>
              <TabsTrigger value="longBreak" className="px-2 py-2 text-xs sm:text-sm">
                {t("longBreak")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className={`w-full flex flex-col items-center ${fullScreen ? 'flex-1 justify-center mt-0' : 'mt-4 sm:mt-6'}`}>
            <div className={`${fullScreen ? 'text-7xl mb-4' : 'text-4xl sm:text-5xl'} font-bold tabular-nums`}>{formatTime(timeLeft)}</div>
            <div className={`w-full mt-4 ${fullScreen ? 'max-w-[85%] mx-auto' : ''}`}>
              <Progress value={getProgress()} className={`${fullScreen ? 'h-4' : 'h-2'} w-full`} />
            </div>

            <div className={`flex items-center gap-4 mt-6`}>
              <Button variant="outline" size="icon" onClick={toggleTimer} className={`${fullScreen ? 'h-16 w-16' : 'h-12 w-12'} rounded-full`}>
                {isRunning ? <Pause className={fullScreen ? "h-8 w-8" : "h-6 w-6"} /> : <Play className={fullScreen ? "h-8 w-8" : "h-6 w-6"} />}
              </Button>
              <Button variant="outline" size="icon" onClick={resetTimer} className={`${fullScreen ? 'h-12 w-12' : 'h-10 w-10'} rounded-full`}>
                <RotateCcw className={fullScreen ? "h-5 w-5" : "h-4 w-4"} />
              </Button>
            </div>

            <div className={`text-xs sm:text-sm text-muted-foreground ${fullScreen ? 'mt-5 text-base' : 'mt-6'}`}>
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

