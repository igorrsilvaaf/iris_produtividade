"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { usePomodoroStore } from "@/lib/stores/pomodoro-store"
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

export default function PomodoroPage() {
  const { t } = useTranslation()
  const { settings } = usePomodoroStore()
  const searchParams = useSearchParams()
  const taskIdParam = searchParams?.get('taskId')
  const router = useRouter()
  
  console.log("PomodoroPage inicializado")
  console.log("Current pomodoro settings:", settings)
  
  const [tasks, setTasks] = useState<Todo[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string>("none")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)
  const [pomodoroSettings, setPomodoroSettings] = useState({
    pomodoro_work_minutes: settings.workMinutes,
    pomodoro_break_minutes: settings.shortBreakMinutes,
    pomodoro_long_break_minutes: settings.longBreakMinutes,
    pomodoro_cycles: settings.longBreakInterval,
    enable_sound: settings.enableSound,
    notification_sound: settings.notificationSound,
    pomodoro_sound: settings.pomodoroSound,
    enable_desktop_notifications: settings.enableDesktopNotifications,
  })

  // Update local settings when the store changes
  useEffect(() => {
    setPomodoroSettings({
      pomodoro_work_minutes: settings.workMinutes,
      pomodoro_break_minutes: settings.shortBreakMinutes,
      pomodoro_long_break_minutes: settings.longBreakMinutes,
      pomodoro_cycles: settings.longBreakInterval,
      enable_sound: settings.enableSound,
      notification_sound: settings.notificationSound,
      pomodoro_sound: settings.pomodoroSound,
      enable_desktop_notifications: settings.enableDesktopNotifications,
    })
    console.log("Updated pomodoro settings from store:", settings)
  }, [settings])

  // Check if it's a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Set selectedTaskId from URL parameter if available
  useEffect(() => {
    if (taskIdParam) {
      setSelectedTaskId(taskIdParam)
    }
  }, [taskIdParam])

  // Fetch tasks - execute apenas uma vez na montagem do componente
  useEffect(() => {
    // Flag para controlar se o componente está montado
    let isMounted = true;
    
    // Função para buscar tarefas que será chamada apenas na montagem
    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        console.log("Buscando tarefas...")
        
        const response = await fetch("/api/tasks/inbox")
        
        console.log("Status da resposta:", response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log("Dados recebidos:", data)
          
          // Verificar se o componente ainda está montado
          if (!isMounted) return;
          
          // Verificar se data.tasks existe
          if (data && data.tasks && Array.isArray(data.tasks)) {
            // Only get incomplete tasks
            const incompleteTasks = data.tasks.filter((task: Todo) => !task.completed)
            console.log("Tarefas incompletas:", incompleteTasks.length)
            setTasks(incompleteTasks)
          } else {
            console.error("Formato de resposta inválido:", data)
            toast({
              variant: "destructive",
              title: t("Failed to load tasks"),
              description: t("Invalid response format"),
            })
          }
        } else {
          console.error("Erro na resposta:", await response.text())
          toast({
            variant: "destructive",
            title: t("Failed to load tasks"),
            description: t("Please refresh the page to try again"),
          })
        }
      } catch (error) {
        console.error("Erro ao buscar tarefas:", error)
        toast({
          variant: "destructive",
          title: t("Failed to load tasks"),
          description: t("Please refresh the page to try again"),
        })
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    // Executar a busca de tarefas
    fetchTasks()
    
    // Função de limpeza para evitar memory leaks
    return () => {
      isMounted = false;
    }
  // Incluir apenas o mínimo necessário de dependências para não causar re-renders excessivos
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Executar apenas na montagem do componente

  return (
    <div className={`container mx-auto py-6 ${isMobile ? "px-0" : "px-6"}`}>
      <div className={`mb-6 ${isMobile ? "hidden" : ""}`}>
        <h1 className="text-3xl font-bold">{t("pomodoroTimer")}</h1>
        <p className="text-muted-foreground">{t("focusOnYourTasks")}</p>
      </div>

      <div className={isMobile ? "fixed inset-0 z-50 bg-background" : ""}>
        {isMobile && (
          <div className="flex items-center p-4 border-b">
            <BackButton onClick={() => {
              try {
                // Tenta voltar para a página anterior
                router.back();
                // Como backup, se não houver histórico, navega para a página inicial após 100ms
                setTimeout(() => {
                  if (window.location.pathname.includes('/pomodoro')) {
                    router.push('/app');
                  }
                }, 100);
              } catch (e) {
                // Fallback para navegação direta
                router.push('/app');
              }
            }} />
            <h2 className="text-lg font-semibold mx-auto">{t("pomodoroTimer")}</h2>
          </div>
        )}

        <div className={isMobile ? "p-0 h-[calc(100%-60px)]" : ""}>
          <Card className={isMobile ? "border-0 shadow-none rounded-none h-full flex flex-col" : ""}>
            <CardHeader className={`pb-2 ${isMobile ? "px-4 py-3" : ""}`}>
              <CardTitle className="text-lg">{t("selectTask")}</CardTitle>
            </CardHeader>
            <CardContent className={isMobile ? "flex-1 flex flex-col px-4" : ""}>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {t("No tasks available")}
                </div>
              ) : (
                <div className="mb-6">
                  <Select
                    value={selectedTaskId ? selectedTaskId.toString() : "none"}
                    onValueChange={(value) => {
                      const taskId = value !== "none" ? parseInt(value) : null
                      setSelectedTaskId(taskId)
                      
                      // Update the URL with the selected task ID
                      const url = new URL(window.location.href)
                      if (taskId) {
                        url.searchParams.set("taskId", taskId.toString())
                      } else {
                        url.searchParams.delete("taskId")
                      }
                      window.history.pushState({}, "", url.toString())
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectATask")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("noTask")}</SelectItem>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id.toString()}>
                          {task.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className={`mt-6 ${isMobile ? "flex-1 flex items-center justify-center" : ""}`}>
                <PomodoroTimer
                  initialSettings={pomodoroSettings}
                  selectedTaskId={selectedTaskId}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 