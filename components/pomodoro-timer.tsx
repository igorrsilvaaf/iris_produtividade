"use client"

import React, { useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslation } from "@/lib/i18n"
import { useAudioPlayer } from "@/lib/audio-utils"
import { useRouter } from "next/navigation"
import { usePomodoroStore, type TimerMode } from "@/lib/stores/pomodoro-store"
import { cn } from "@/lib/utils"

interface PomodoroTimerProps {
  selectedTaskId?: number | null
  fullScreen?: boolean
  timerTextColorClass?: string
  activeTabStyleClass?: string
  playButtonColorClass?: string
}

export function PomodoroTimer({
  selectedTaskId,
  fullScreen = false,
  timerTextColorClass = "",
  activeTabStyleClass = "",
  playButtonColorClass = "bg-primary text-primary-foreground hover:bg-primary/90 border-primary",
}: PomodoroTimerProps) {
  const {
    isRunning,
    setIsRunning,
    mode,
    setMode: setStoreMode,
    timeLeft,
    setTimeLeft,
    cycles,
    setCycles,
    settings: storeSettings,
    resetTimer: resetStoreTimer,
    toggleTimer: toggleStoreTimer,
  } = usePomodoroStore()

  const [selectedTask, setSelectedTask] = React.useState<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useTranslation()
  const { playSound } = useAudioPlayer()
  const router = useRouter()

  const handleTimerComplete = React.useCallback(() => {
    try {
      if (storeSettings.enableSound) {
        playSound(storeSettings.pomodoroSound)
      }

      if (storeSettings.enableDesktopNotifications && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === "granted") {
        const title = mode === "work" ? t("workComplete") : t("breakComplete")
        const body =
          mode === "work"
            ? t("timeToTakeABreak")
            : mode === "shortBreak"
            ? t("timeToWorkAgain")
            : t("longBreakComplete")

        const notification = new Notification(title, {
          body,
          icon: "/favicon.ico",
          silent: true,
        })
        setTimeout(() => notification.close(), 5000)
      }

      if (mode === "work" && selectedTaskId) {
        fetch(`/api/pomodoro/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTaskId,
            duration: storeSettings.workMinutes,
          }),
        }).catch((error) => {
          console.error("Error logging pomodoro:", error)
        })
      }

      let nextMode: TimerMode;
      let newInternalCycle = cycles; // Usaremos 'cycles' para rastrear o estágio no ciclo de 4 partes.

      if (mode === "work") {
        if (newInternalCycle === 0) { // Primeiro trabalho no ciclo de 4 partes
          nextMode = "shortBreak";
          newInternalCycle = 1;
        } else { // Segundo trabalho no ciclo de 4 partes (newInternalCycle era 2)
          nextMode = "longBreak";
          newInternalCycle = 3;
        }
      } else if (mode === "shortBreak") { // Após Pausa Curta (newInternalCycle era 1)
        nextMode = "work";
        newInternalCycle = 2;
      } else { // mode === "longBreak" // Após Pausa Longa (newInternalCycle era 3)
        nextMode = "work";
        newInternalCycle = 0; // Reinicia o ciclo de 4 partes
      }

      setCycles(newInternalCycle);
      setStoreMode(nextMode);
      setIsRunning(false);
    } catch (error) {
      console.error("Error in handleTimerComplete:", error)
      setIsRunning(false)
      setStoreMode("work") // Fallback para work em caso de erro
      setCycles(0); // Resetar o ciclo em caso de erro
    }
  }, [
    storeSettings.enableSound,
    storeSettings.pomodoroSound,
    storeSettings.enableDesktopNotifications,
    storeSettings.workMinutes, // Adicionado pois é usado no fetch de log
    mode,
    selectedTaskId,
    cycles,
    setCycles,
    setStoreMode,
    setIsRunning,
    playSound,
    t,
  ]);

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
        setTimeLeft(timeLeft - 1)
        if (timeLeft <= 1) {
          handleTimerComplete()
        }
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft, setTimeLeft, handleTimerComplete])

  useEffect(() => {
    const originalTitle = document.title
    if (isRunning) {
      const minutes = Math.floor(timeLeft / 60)
      const seconds = timeLeft % 60
      const timeStr = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      const taskInfo = selectedTask ? ` - ${selectedTask.title}` : ""
      document.title = `${timeStr} - ${
        mode === "work" ? t("work") : t(mode === "shortBreak" ? "shortBreak" : "longBreak")
      }${taskInfo}`
    }
    return () => {
      document.title = originalTitle
    }
  }, [timeLeft, isRunning, mode, t, selectedTask, storeSettings])

  const handleTabChange = (newMode: string) => {
    setStoreMode(newMode as TimerMode)
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    let totalDuration
    switch (mode) {
      case "work":
        totalDuration = storeSettings.workMinutes * 60
        break
      case "shortBreak":
        totalDuration = storeSettings.shortBreakMinutes * 60
        break
      case "longBreak":
        totalDuration = storeSettings.longBreakMinutes * 60
        break
      default:
        totalDuration = storeSettings.workMinutes * 60
    }
    if (totalDuration === 0) return 0
    // Garante que timeLeft não seja maior que totalDuration para evitar progresso > 100 ou < 0
    const currentProgress = Math.max(0, Math.min(timeLeft, totalDuration));
    return 100 - (currentProgress / totalDuration) * 100
  }

  const navigateToSettings = () => {
    router.push("/app/settings?tab=pomodoro")
  }

  const tabsTriggerBaseClass = "px-2 py-1.5 text-xs sm:text-sm"
  const activeBorderClass = "border-b-2"

  return (
    <Card className={fullScreen ? "h-full border-0 shadow-none rounded-none flex flex-col bg-transparent" : ""}>
      <CardHeader className={`pb-2 flex flex-row items-center justify-between ${fullScreen ? 'pt-2' : ''}`}>
        <CardTitle className="text-lg sm:text-xl">{t("pomodoroTimer")}</CardTitle>
        <Button variant="ghost" size="icon" onClick={navigateToSettings}>
          <Settings className="h-4 w-4" />
          <span className="sr-only">{t("settings")}</span>
        </Button>
      </CardHeader>
      <CardContent className={`pt-0 ${fullScreen ? 'flex flex-col items-center justify-center flex-1' : ''}`}>
        <div className={`${fullScreen ? 'w-full max-w-md mx-auto' : 'w-full'}`}>
          <Tabs
            value={mode} 
            onValueChange={handleTabChange} 
            className="w-full"
          >
            <TabsList className={`grid w-full grid-cols-3 mb-6`}>
              <TabsTrigger 
                value="work" 
                className={cn(tabsTriggerBaseClass, mode === "work" ? `${activeTabStyleClass} ${activeBorderClass}` : "border-transparent")}
              >
                {t("work")}
              </TabsTrigger>
              <TabsTrigger 
                value="shortBreak" 
                className={cn(tabsTriggerBaseClass, mode === "shortBreak" ? `${activeTabStyleClass} ${activeBorderClass}` : "border-transparent")}
              >
                {t("shortBreak")}
              </TabsTrigger>
              <TabsTrigger 
                value="longBreak" 
                className={cn(tabsTriggerBaseClass, mode === "longBreak" ? `${activeTabStyleClass} ${activeBorderClass}` : "border-transparent")}
              >
                {t("longBreak")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className={`w-full flex flex-col items-center ${fullScreen ? 'flex-1 justify-center' : 'mt-4 sm:mt-6'}`}>
          <div className={`${fullScreen ? 'text-6xl sm:text-7xl mb-6' : 'text-4xl sm:text-5xl'} font-bold tabular-nums ${timerTextColorClass}`}>
            {formatTime(timeLeft)}
          </div>
          
          <div className={`w-full ${fullScreen ? 'max-w-[85%] mx-auto mb-8' : 'mt-4 mb-6'}`}>
            <Progress value={getProgress()} className={`${fullScreen ? 'h-3' : 'h-2'} w-full`} />
          </div>

          <div className={`flex items-center justify-center gap-6 ${fullScreen ? 'mb-6' : ''}`}>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleStoreTimer} 
              className={`${fullScreen ? 'h-16 w-16' : 'h-12 w-12'} rounded-full ${isRunning ? 'bg-primary/10 hover:bg-primary/20 border-primary/20' : playButtonColorClass}`}
            >
              {isRunning ? 
                <Pause className={fullScreen ? "h-8 w-8" : "h-6 w-6"} /> : 
                <Play className={fullScreen ? "h-8 w-8" : "h-6 w-6"} />
              }
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={resetStoreTimer} 
              className={`${fullScreen ? 'h-12 w-12' : 'h-10 w-10'} rounded-full bg-transparent`}
            >
              <RotateCcw className={fullScreen ? "h-5 w-5" : "h-4 w-4"} />
            </Button>
          </div>

          <div className={`text-xs sm:text-sm text-muted-foreground ${fullScreen ? 'mt-2' : 'mt-6'}`}>
            {t("cycleStage")}: {cycles + 1}/4 
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

