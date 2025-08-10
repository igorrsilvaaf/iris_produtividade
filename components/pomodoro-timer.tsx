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
import { startPomodoroQueueProcessor, trySendOrQueue } from "@/lib/offline-queue"
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
      if (typeof window !== 'undefined') {
        const w = window as unknown as { __pomodoroInCompletion?: boolean; __pomodoroInCompletionMs?: number }
        const now = Date.now()
        if (w.__pomodoroInCompletion && w.__pomodoroInCompletionMs && now - w.__pomodoroInCompletionMs < 2000) {
          return
        }
        w.__pomodoroInCompletion = true
        w.__pomodoroInCompletionMs = now
      }
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

      trySendOrQueue({
        taskId: selectedTaskId || undefined,
        duration:
          mode === "work"
            ? storeSettings.workMinutes
            : mode === "shortBreak"
            ? storeSettings.shortBreakMinutes
            : storeSettings.longBreakMinutes,
        mode,
        createdAt: Date.now(),
      })
        .then(() => {
          if (typeof window !== 'undefined') {
            try {
              const event = new CustomEvent('pomodoroCompleted', { 
                detail: { taskId: selectedTaskId, timestamp: Date.now() }
              });
              window.dispatchEvent(event);
            } catch (error) {
              console.error("[Pomodoro Mobile Debug] Erro ao disparar evento:", error);
            }
          }
          // Removido refresh de rota para evitar reload da página
          continueWithModeUpdate();
        })
        .catch(() => {
          continueWithModeUpdate()
        })

      const continueWithModeUpdate = () => {
        let nextMode: TimerMode
        let newInternalCycle = cycles
        const longBreakInterval = Math.max(1, Number(storeSettings.longBreakInterval) || 4)
        if (mode === "work") {
          const isLongBreakDue = (cycles + 1) % longBreakInterval === 0
          if (isLongBreakDue) {
            nextMode = "longBreak"
          } else {
            nextMode = "shortBreak"
          }
          newInternalCycle = cycles + 1
        } else {
          nextMode = "work"
        }
        setCycles(newInternalCycle)
        setStoreMode(nextMode)
        setIsRunning(false)
      }
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
    storeSettings.longBreakInterval, // Adicionado para usar a configuração de ciclos
    mode,
    selectedTaskId,
    cycles,
    setCycles,
    setStoreMode,
    setIsRunning,
    playSound,
    t,
    router,
  ]);

  React.useEffect(() => {
    startPomodoroQueueProcessor()
  }, [])

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!selectedTaskId) {
        setSelectedTask(null)
        return
      }
      try {
        const response = await fetch(`/api/tasks/${selectedTaskId}/${selectedTaskId}`)
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
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    intervalRef.current = setInterval(() => {
      const state = usePomodoroStore.getState()
      const current = state.timeLeft
      if (current <= 1) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setTimeLeft(0)
        handleTimerComplete()
        return
      }
      setTimeLeft(current - 1)
    }, 1000)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, setTimeLeft, handleTimerComplete])

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

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      const isCmd = e.metaKey || e.ctrlKey
      if (isCmd && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault()
        toggleStoreTimer()
      } else if (isCmd && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault()
        resetStoreTimer()
      } else if (isCmd && (e.key === 'ArrowRight')) {
        e.preventDefault()
        setStoreMode(mode === 'work' ? 'shortBreak' : mode === 'shortBreak' ? 'longBreak' : 'work')
        setIsRunning(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mode, toggleStoreTimer, resetStoreTimer, setStoreMode, setIsRunning])
  
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
  const computedLongBreakInterval = Math.max(1, Number(storeSettings.longBreakInterval) || 4)
  const completedInInterval = cycles % computedLongBreakInterval
  const currentCycleStage = mode === "work" ? (completedInInterval === 0 ? 1 : completedInInterval + 1) : (completedInInterval === 0 ? computedLongBreakInterval : completedInInterval)

  return (
    <Card className={fullScreen ? "h-full border-0 shadow-none rounded-none flex flex-col bg-transparent" : ""} data-testid="pomodoro-timer">
      <CardHeader className={`pb-2 flex flex-row items-center justify-between ${fullScreen ? 'pt-2' : ''}`}>
        <div className="w-9"></div>
        <CardTitle className="text-lg sm:text-xl text-center flex-1" data-testid="pomodoro-title">{t("pomodoroTimer")}</CardTitle>
        <Button variant="ghost" size="icon" onClick={navigateToSettings} data-testid="pomodoro-settings-button">
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
            data-testid="pomodoro-mode-tabs"
          >
            <TabsList className={`grid w-full grid-cols-3 mb-6`} data-testid="pomodoro-tabs-list">
              <TabsTrigger 
                value="work" 
                className={cn(tabsTriggerBaseClass, mode === "work" ? `${activeTabStyleClass} ${activeBorderClass}` : "border-transparent")}
                data-testid="pomodoro-work-tab"
              >
                {t("work")}
              </TabsTrigger>
              <TabsTrigger 
                value="shortBreak" 
                className={cn(tabsTriggerBaseClass, mode === "shortBreak" ? `${activeTabStyleClass} ${activeBorderClass}` : "border-transparent")}
                data-testid="pomodoro-short-break-tab"
              >
                {t("shortBreak")}
              </TabsTrigger>
              <TabsTrigger 
                value="longBreak" 
                className={cn(tabsTriggerBaseClass, mode === "longBreak" ? `${activeTabStyleClass} ${activeBorderClass}` : "border-transparent")}
                data-testid="pomodoro-long-break-tab"
              >
                {t("longBreak")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className={`w-full flex flex-col items-center ${fullScreen ? 'flex-1 justify-center' : 'mt-4 sm:mt-6'}`}>
          <div className={`${fullScreen ? 'text-6xl sm:text-7xl mb-6' : 'text-4xl sm:text-5xl'} font-bold tabular-nums ${timerTextColorClass}`} data-testid="pomodoro-timer-display">
            {formatTime(timeLeft)}
          </div>
          
          <div className={`w-full ${fullScreen ? 'max-w-[85%] mx-auto mb-8' : 'mt-4 mb-6'}`}>
            <Progress value={getProgress()} className={`${fullScreen ? 'h-3' : 'h-2'} w-full`} data-testid="pomodoro-progress-bar" />
          </div>

          <div className={`flex items-center justify-center gap-6 ${fullScreen ? 'mb-6' : ''}`} data-testid="pomodoro-controls">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleStoreTimer} 
              className={`${fullScreen ? 'h-16 w-16' : 'h-12 w-12'} rounded-full ${isRunning ? 'bg-primary/10 hover:bg-primary/20 border-primary/20' : playButtonColorClass}`}
              data-testid="pomodoro-play-pause-button"
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
              data-testid="pomodoro-reset-button"
            >
              <RotateCcw className={fullScreen ? "h-5 w-5" : "h-4 w-4"} />
            </Button>
          </div>

          <div className={`text-xs sm:text-sm text-muted-foreground ${fullScreen ? 'mt-2' : 'mt-6'}`} data-testid="pomodoro-cycle-info">
            {t("cycleStage")}: {currentCycleStage}/{computedLongBreakInterval}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}