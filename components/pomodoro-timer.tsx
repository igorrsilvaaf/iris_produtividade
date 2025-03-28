"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PomodoroSettings } from "@/components/pomodoro-settings"
import { useToast } from "@/components/ui/use-toast"

type TimerMode = "work" | "shortBreak" | "longBreak"

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
}

export function PomodoroTimer({ initialSettings }: PomodoroTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>("work")
  const [timeLeft, setTimeLeft] = useState(initialSettings.pomodoro_work_minutes * 60) // minutes in seconds
  const [cycles, setCycles] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const { toast } = useToast()

  // Settings
  const [workMinutes, setWorkMinutes] = useState(initialSettings.pomodoro_work_minutes)
  const [shortBreakMinutes, setShortBreakMinutes] = useState(initialSettings.pomodoro_break_minutes)
  const [longBreakMinutes, setLongBreakMinutes] = useState(initialSettings.pomodoro_long_break_minutes)
  const [longBreakInterval, setLongBreakInterval] = useState(initialSettings.pomodoro_cycles)
  const [enableSound, setEnableSound] = useState(initialSettings.enable_sound)
  const [notificationSound, setNotificationSound] = useState(initialSettings.notification_sound)
  const [enableDesktopNotifications, setEnableDesktopNotifications] = useState(
    initialSettings.enable_desktop_notifications,
  )

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize audio element
    audioRef.current = new Audio(`/sounds/${notificationSound || "default"}.mp3`)

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [notificationSound])

  useEffect(() => {
    // Reset timer when mode changes
    switch (mode) {
      case "work":
        setTimeLeft(workMinutes * 60)
        break
      case "shortBreak":
        setTimeLeft(shortBreakMinutes * 60)
        break
      case "longBreak":
        setTimeLeft(longBreakMinutes * 60)
        break
    }

    // Stop timer when mode changes
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [mode, workMinutes, shortBreakMinutes, longBreakMinutes])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer completed
            clearInterval(intervalRef.current!)

            // Play sound if enabled
            if (enableSound && audioRef.current) {
              audioRef.current.play().catch((error) => {
                console.error("Failed to play sound:", error)
              })
            }

            // Show desktop notification if enabled
            if (enableDesktopNotifications && Notification.permission === "granted") {
              const title = mode === "work" ? "Work session completed!" : "Break time over!"
              const body = mode === "work" ? "Time for a break!" : "Back to work!"

              new Notification(title, {
                body,
                icon: "/favicon.ico",
              })
            }

            // Show toast notification
            toast({
              title: mode === "work" ? "Work session completed!" : "Break time over!",
              description: mode === "work" ? "Time for a break!" : "Back to work!",
            })

            // Switch to next mode
            if (mode === "work") {
              const newCycles = cycles + 1
              setCycles(newCycles)

              if (newCycles % longBreakInterval === 0) {
                setMode("longBreak")
              } else {
                setMode("shortBreak")
              }
            } else {
              setMode("work")
            }

            setIsRunning(false)
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
      }
    }
  }, [isRunning, mode, cycles, longBreakInterval, enableSound, enableDesktopNotifications, toast])

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    switch (mode) {
      case "work":
        setTimeLeft(workMinutes * 60)
        break
      case "shortBreak":
        setTimeLeft(shortBreakMinutes * 60)
        break
      case "longBreak":
        setTimeLeft(longBreakMinutes * 60)
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
        total = workMinutes * 60
        break
      case "shortBreak":
        total = shortBreakMinutes * 60
        break
      case "longBreak":
        total = longBreakMinutes * 60
        break
    }
    return 100 - (timeLeft / total) * 100
  }

  const updateSettings = (settings: {
    workMinutes: number
    shortBreakMinutes: number
    longBreakMinutes: number
    longBreakInterval: number
    enableSound: boolean
    notificationSound: string
    enableDesktopNotifications: boolean
  }) => {
    setWorkMinutes(settings.workMinutes)
    setShortBreakMinutes(settings.shortBreakMinutes)
    setLongBreakMinutes(settings.longBreakMinutes)
    setLongBreakInterval(settings.longBreakInterval)
    setEnableSound(settings.enableSound)
    setNotificationSound(settings.notificationSound)
    setEnableDesktopNotifications(settings.enableDesktopNotifications)

    // Update current timer if needed
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

    // Update audio element
    if (audioRef.current) {
      audioRef.current.src = `/sounds/${settings.notificationSound || "default"}.mp3`
    }

    setShowSettings(false)
  }

  // Set document title to show timer
  useEffect(() => {
    const originalTitle = document.title

    if (isRunning) {
      document.title = `${formatTime(timeLeft)} - ${mode === "work" ? "Work" : "Break"}`
    }

    return () => {
      document.title = originalTitle
    }
  }, [timeLeft, isRunning, mode])

  return (
    <>
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg sm:text-xl">Pomodoro Timer</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs
            defaultValue="work"
            value={mode}
            onValueChange={(value) => setMode(value as TimerMode)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="work" className="text-xs sm:text-sm">
                Work
              </TabsTrigger>
              <TabsTrigger value="shortBreak" className="text-xs sm:text-sm">
                Short Break
              </TabsTrigger>
              <TabsTrigger value="longBreak" className="text-xs sm:text-sm">
                Long Break
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="mt-4 sm:mt-6 flex flex-col items-center">
            <div className="text-4xl sm:text-5xl font-bold tabular-nums">{formatTime(timeLeft)}</div>
            <Progress value={getProgress()} className="mt-4 h-2 w-full" />

            <div className="mt-4 sm:mt-6 flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={toggleTimer} className="h-12 w-12 rounded-full">
                {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button variant="outline" size="icon" onClick={resetTimer} className="h-10 w-10 rounded-full">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 text-xs sm:text-sm text-muted-foreground">
              Cycle: {cycles % longBreakInterval}/{longBreakInterval}
            </div>
          </div>
        </CardContent>
      </Card>

      <PomodoroSettings
        open={showSettings}
        onOpenChange={setShowSettings}
        settings={{
          workMinutes,
          shortBreakMinutes,
          longBreakMinutes,
          longBreakInterval,
          enableSound,
          notificationSound,
          enableDesktopNotifications,
        }}
        onSave={updateSettings}
      />
    </>
  )
}

