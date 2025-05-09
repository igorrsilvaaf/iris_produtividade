"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
// import { ArrowLeft } from "lucide-react" // Comentado se não estiver usando diretamente
import { Card, CardContent, CardHeader /*, CardTitle */ } from "@/components/ui/card" // CardTitle pode ser removida se não usada no JSX diretamente
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { usePomodoroStore, type TimerMode } from "@/lib/stores/pomodoro-store"
import { getPomodoroModeStyles } from "@/lib/pomodoro-utils"; // Importar a função utilitária
import { useTranslation } from "@/lib/i18n"
import type { Todo } from "@/lib/todos"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { BackButton } from "@/components/ui/back-button"
import React from "react"

export default function PomodoroPage() {
  const { t } = useTranslation()
  const pomodoroStore = usePomodoroStore()
  const currentMode = pomodoroStore.mode;
  const searchParams = useSearchParams()
  const taskIdParam = searchParams?.get('taskId')
  const router = useRouter()
  
  const [tasks, setTasks] = useState<Todo[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingsLoading, setIsSettingsLoading] = useState(true)
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)
  const [pomodoroSettingsState, setPomodoroSettingsState] = useState({
    pomodoro_work_minutes: pomodoroStore.settings.workMinutes,
    pomodoro_break_minutes: pomodoroStore.settings.shortBreakMinutes,
    pomodoro_long_break_minutes: pomodoroStore.settings.longBreakMinutes,
    pomodoro_cycles: pomodoroStore.settings.longBreakInterval,
    enable_sound: pomodoroStore.settings.enableSound,
    notification_sound: pomodoroStore.settings.notificationSound,
    pomodoro_sound: pomodoroStore.settings.pomodoroSound,
    enable_desktop_notifications: pomodoroStore.settings.enableDesktopNotifications,
  })
  const [isClient, setIsClient] = useState(false)
  
  const alreadyFetchedSettings = useRef(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    if (alreadyFetchedSettings.current && !pomodoroStore.isRunning) return 
    
    const fetchUserSettings = async () => {
      try {
        setIsSettingsLoading(true)
        const response = await fetch('/api/settings', {
          method: 'GET'
        })
        
        if (response.ok) {
          const data = await response.json()
          alreadyFetchedSettings.current = true
          
          pomodoroStore.updateSettings({
            workMinutes: data.settings.pomodoro_work_minutes,
            shortBreakMinutes: data.settings.pomodoro_break_minutes,
            longBreakMinutes: data.settings.pomodoro_long_break_minutes,
            longBreakInterval: data.settings.pomodoro_cycles,
            enableSound: data.settings.enable_sound,
            notificationSound: data.settings.notification_sound,
            pomodoroSound: data.settings.pomodoro_sound || "pomodoro",
            enableDesktopNotifications: data.settings.enable_desktop_notifications
          })
          
          setPomodoroSettingsState({
            pomodoro_work_minutes: data.settings.pomodoro_work_minutes,
            pomodoro_break_minutes: data.settings.pomodoro_break_minutes,
            pomodoro_long_break_minutes: data.settings.pomodoro_long_break_minutes,
            pomodoro_cycles: data.settings.pomodoro_cycles,
            enable_sound: data.settings.enable_sound,
            notification_sound: data.settings.notification_sound,
            pomodoro_sound: data.settings.pomodoro_sound || "pomodoro",
            enable_desktop_notifications: data.settings.enable_desktop_notifications,
          })
        } else {
          console.error("Erro ao buscar configurações do usuário:", await response.text())
        }
      } catch (error) {
        console.error("Erro ao buscar configurações do usuário:", error)
      } finally {
        setIsSettingsLoading(false)
      }
    }
    
    fetchUserSettings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, pomodoroStore.isRunning])

  useEffect(() => {
    setPomodoroSettingsState({
      pomodoro_work_minutes: pomodoroStore.settings.workMinutes,
      pomodoro_break_minutes: pomodoroStore.settings.shortBreakMinutes,
      pomodoro_long_break_minutes: pomodoroStore.settings.longBreakMinutes,
      pomodoro_cycles: pomodoroStore.settings.longBreakInterval,
      enable_sound: pomodoroStore.settings.enableSound,
      notification_sound: pomodoroStore.settings.notificationSound,
      pomodoro_sound: pomodoroStore.settings.pomodoroSound,
      enable_desktop_notifications: pomodoroStore.settings.enableDesktopNotifications,
    })
  }, [pomodoroStore.settings])

  useEffect(() => {
    if (!isClient) return
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768)
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [isClient])

  useEffect(() => {
    if (taskIdParam) {
      setSelectedTaskId(taskIdParam)
    } else {
      setSelectedTaskId(null)
    }
  }, [taskIdParam])

  useEffect(() => {
    if (!isClient) return
    let isMounted = true
    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/tasks/inbox")
        if (response.ok) {
          const data = await response.json()
          if (!isMounted) return
          if (data && data.tasks && Array.isArray(data.tasks)) {
            const incompleteTasks = data.tasks.filter((task: Todo) => !task.completed)
            setTasks(incompleteTasks)
          } else {
            toast({ variant: "destructive", title: t("Failed to load tasks"), description: t("Invalid response format") })
          }
        } else {
          toast({ variant: "destructive", title: t("Failed to load tasks"), description: t("Please refresh the page to try again") })
        }
      } catch (error) {
        toast({ variant: "destructive", title: t("Failed to load tasks"), description: t("Please refresh the page to try again") })
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchTasks()
    return () => { isMounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient])

  const { timerTextColorClass, activeTabStyleClass } = getPomodoroModeStyles(currentMode);
  const transitionClasses = "transition-colors duration-300 ease-in-out";

  if (isSettingsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className={`container mx-auto py-6 ${isMobile ? "px-0" : "px-6"}`}>
      <div className={`mb-6 ${isMobile ? "hidden" : ""}`}>
        <h1 className="text-3xl font-bold">{t("pomodoroTimer")}</h1>
        <p className="text-muted-foreground">{t("focusOnYourTasks")}</p>
      </div>

      {isMobile && (
        <div className={`fixed inset-0 z-50 flex flex-col bg-background`}>
          <div className="flex items-center p-4 border-b">
            <BackButton onClick={() => {
              try {
                router.back();
                setTimeout(() => {
                  if (window.location.pathname.includes('/pomodoro')) {
                    router.push('/app');
                  }
                }, 100);
              } catch (e) {
                router.push('/app');
              }
            }} />
            <h2 className="text-lg font-medium ml-4">{t("pomodoroTimer")}</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <PomodoroTimer 
              selectedTaskId={selectedTaskId ? Number(selectedTaskId) : null} 
              fullScreen={true} 
              timerTextColorClass={`${timerTextColorClass} ${transitionClasses}`}
              activeTabStyleClass={activeTabStyleClass}
            />
          </div>
        </div>
      )}

      {!isMobile && (
        <Card>
          <CardHeader>
            {/* Conteúdo do CardHeader se necessário */}
          </CardHeader>
          <CardContent className="p-6">
            <PomodoroTimer 
              selectedTaskId={selectedTaskId ? Number(selectedTaskId) : null} 
              fullScreen={false}
              timerTextColorClass={`${timerTextColorClass} ${transitionClasses}`}
              activeTabStyleClass={activeTabStyleClass}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
} 