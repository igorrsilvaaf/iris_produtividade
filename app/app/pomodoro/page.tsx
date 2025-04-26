"use client"

import { useState, useEffect, useRef } from "react"
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
import React from "react"

export default function PomodoroPage() {
  const { t } = useTranslation()
  const pomodoroStore = usePomodoroStore()
  const searchParams = useSearchParams()
  const taskIdParam = searchParams?.get('taskId')
  const router = useRouter()
  
  const [tasks, setTasks] = useState<Todo[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string>("none")
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingsLoading, setIsSettingsLoading] = useState(true)
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)
  const [pomodoroSettings, setPomodoroSettings] = useState({
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
  
  // Mover a ref para o escopo do componente
  const alreadyFetchedSettings = useRef(false)

  // Detectar quando está no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Buscar as configurações do usuário do servidor
  useEffect(() => {
    if (!isClient) return
    
    // Evitar chamadas repetidas
    if (alreadyFetchedSettings.current) return
    
    const fetchUserSettings = async () => {
      try {
        setIsSettingsLoading(true)
        const response = await fetch('/api/settings', {
          method: 'GET'
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log("Configurações do usuário recebidas:", data.settings)
          alreadyFetchedSettings.current = true
          
          // Atualizar o store global do Pomodoro
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
          
          // Atualizar o estado local
          setPomodoroSettings({
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
  }, [isClient]) // Remover pomodoroStore das dependências para evitar o loop

  // Update local settings when the store changes
  useEffect(() => {
    setPomodoroSettings({
      pomodoro_work_minutes: pomodoroStore.settings.workMinutes,
      pomodoro_break_minutes: pomodoroStore.settings.shortBreakMinutes,
      pomodoro_long_break_minutes: pomodoroStore.settings.longBreakMinutes,
      pomodoro_cycles: pomodoroStore.settings.longBreakInterval,
      enable_sound: pomodoroStore.settings.enableSound,
      notification_sound: pomodoroStore.settings.notificationSound,
      pomodoro_sound: pomodoroStore.settings.pomodoroSound,
      enable_desktop_notifications: pomodoroStore.settings.enableDesktopNotifications,
    })
    console.log("Updated pomodoro settings from store:", pomodoroStore.settings)
  }, [pomodoroStore.settings])

  // Check if it's a mobile device
  useEffect(() => {
    if (!isClient) return
    
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [isClient])

  // Set selectedTaskId from URL parameter if available
  useEffect(() => {
    if (taskIdParam) {
      setSelectedTaskId(taskIdParam)
    }
  }, [taskIdParam])

  // Fetch tasks - execute apenas uma vez na montagem do componente
  useEffect(() => {
    if (!isClient) return
    
    // Flag para controlar se o componente está montado
    let isMounted = true
    
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
          if (!isMounted) return
          
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
      isMounted = false
    }
  // Incluir apenas o mínimo necessário de dependências para não causar re-renders excessivos
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]) // Executar apenas na montagem do componente

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

      <div className={isMobile ? "fixed inset-0 z-50 bg-background flex flex-col" : ""}>
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

        <div className={isMobile ? "flex-1 flex flex-col overflow-hidden" : ""}>
          {isMobile ? (
            <div className="flex flex-col h-full">
              <div className="px-4 py-3 border-b">
                <h3 className="text-lg font-semibold">{t("selectTask")}</h3>
              </div>
              <div className="p-4">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    {t("No tasks available")}
                  </div>
                ) : (
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
                )}
              </div>
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                  <PomodoroTimer
                    initialSettings={pomodoroSettings}
                    selectedTaskId={selectedTaskId !== "none" ? parseInt(selectedTaskId) : null}
                    fullScreen={true}
                  />
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{t("selectTask")}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    {t("No tasks available")}
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
          )}

          <div className="mt-8">
            <PomodoroTimer 
              initialSettings={pomodoroSettings}
              selectedTaskId={selectedTaskId !== "none" ? parseInt(selectedTaskId) : null}
              fullScreen={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 