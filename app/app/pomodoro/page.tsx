"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
// import { ArrowLeft } from "lucide-react" // Comentado se não estiver usando diretamente
import { Card, CardContent, CardHeader /*, CardTitle */ } from "@/components/ui/card" // CardTitle pode ser removida se não usada no JSX diretamente
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { PomodoroHistory } from "@/components/pomodoro-history"
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

  // Função para lidar com a seleção de tarefas
  const handleTaskSelect = (taskId: string) => {
    if (taskId === "none") {
      setSelectedTaskId(null);
      router.push('/app/pomodoro', { scroll: false });
    } else {
      setSelectedTaskId(taskId);
      router.push(`/app/pomodoro?taskId=${taskId}`, { scroll: false });
    }
  };

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || alreadyFetchedSettings.current) return;

    const fetchUserSettings = async () => {
      try {
        setIsSettingsLoading(true)
        const response = await fetch('/api/settings', {
          method: 'GET'
        })
        
        if (response.ok) {
          const data = await response.json()
          alreadyFetchedSettings.current = true;
          
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
  }, [isClient])

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

  const { 
    timerTextColorClass, 
    activeTabClasses, 
    playButtonClasses, 
    progressIndicatorClass 
  } = getPomodoroModeStyles(currentMode);
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

      {/* Seletor de Tarefas para Desktop */}
      {!isMobile && (
        <div className="mb-6">
          <label htmlFor="task-select-desktop" className="block text-sm font-medium text-foreground mb-1.5">
            {t("selectTaskLabel", "Select a task to focus on")}
          </label>
          <Select
            value={selectedTaskId || "none"}
            onValueChange={handleTaskSelect}
            disabled={isLoading || tasks.length === 0 && !selectedTaskId}
          >
            <SelectTrigger id="task-select-desktop" className="w-full md:w-[450px]">
              <SelectValue placeholder={t("selectTaskPlaceholder", "Choose a task...")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("noTaskSelected", "No task selected")}</SelectItem>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={String(task.id)}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isLoading && tasks.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1.5">{t("loadingTasks", "Loading tasks...")}</p>
          )}
          {!isLoading && tasks.length === 0 && !selectedTaskId && (
             <p className="text-xs text-muted-foreground mt-1.5">{t("noPendingTasksPomodoro", "You have no pending tasks to focus on.")}</p>
          )}
        </div>
      )}

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
          {/* Seletor de Tarefas para Mobile */}
          <div className="p-4 border-b">
            <label htmlFor="task-select-mobile" className="sr-only">
              {t("selectTaskLabel", "Select a task to focus on")}
            </label>
            <Select
              value={selectedTaskId || "none"}
              onValueChange={handleTaskSelect}
              disabled={isLoading || tasks.length === 0 && !selectedTaskId}
            >
              <SelectTrigger id="task-select-mobile" className="w-full">
                <SelectValue placeholder={t("selectTaskPlaceholder", "Choose a task...")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("noTaskSelected", "No task selected")}</SelectItem>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={String(task.id)}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoading && tasks.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1.5">{t("loadingTasks", "Loading tasks...")}</p>
            )}
            {!isLoading && tasks.length === 0 && !selectedTaskId && (
               <p className="text-xs text-muted-foreground mt-1.5">{t("noPendingTasksPomodoro", "You have no pending tasks to focus on.")}</p>
            )}
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="h-1/2 flex items-center justify-center p-4">
                <CardContent className="flex-1 flex flex-col p-0">
                  <PomodoroTimer 
                    selectedTaskId={selectedTaskId ? Number(selectedTaskId) : null} 
                    fullScreen={true} 
                    timerTextColorClass={`${timerTextColorClass} ${transitionClasses}`}
                    activeTabStyleClass={activeTabClasses}
                    playButtonColorClass={`${playButtonClasses} ${transitionClasses}`}
                    progressIndicatorClassProp={progressIndicatorClass}
                  />
                </CardContent>
              </div>
              
              {isClient && (
                <div className="h-1/2 overflow-y-auto p-4 pt-0">
                  <PomodoroHistory 
                    taskId={selectedTaskId}
                    className="shadow-none border-0"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <>
          <Card className={`${isMobile ? "hidden" : "w-full md:max-w-2xl lg:max-w-3xl mx-auto shadow-lg"}`}>
            <CardContent className="p-6 md:p-8">
              <PomodoroTimer 
                selectedTaskId={selectedTaskId ? Number(selectedTaskId) : null} 
                fullScreen={false}
                timerTextColorClass={`${timerTextColorClass} ${transitionClasses}`}
                activeTabStyleClass={activeTabClasses}
                playButtonColorClass={`${playButtonClasses} ${transitionClasses}`}
                progressIndicatorClassProp={progressIndicatorClass}
              />
            </CardContent>
          </Card>
          
          {isClient && (
            <div className="mt-8 w-full md:max-w-2xl lg:max-w-3xl mx-auto">
              <PomodoroHistory 
                taskId={selectedTaskId}
                className="shadow-lg"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 