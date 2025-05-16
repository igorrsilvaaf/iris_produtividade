import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PomodoroSession {
  id: string
  userId: string
  taskId: string | null
  duration: number
  mode: "work" | "shortBreak" | "longBreak"
  startedAt: string
  completedAt: string
  task: {
    id: string
    title: string
  } | null
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface PomodoroHistoryProps {
  taskId?: string | null
  className?: string
}

export function PomodoroHistory({ taskId = null, className = "" }: PomodoroHistoryProps) {
  const { t } = useTranslation()
  const [sessions, setSessions] = useState<PomodoroSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(taskId ? { taskId } : {})
      })
      
      const timestamp = Date.now();
      console.log(`Buscando sessões de pomodoro: /api/pomodoro/log?${queryParams.toString()}&t=${timestamp}`);
      
      const response = await fetch(`/api/pomodoro/log?${queryParams.toString()}&t=${timestamp}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar histórico: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        console.log(`Histórico carregado com sucesso: ${data.pomodoroLogs.length} registros`);
        setSessions(data.pomodoroLogs)
        setPagination(data.pagination)
      } else {
        throw new Error(data.error || "Erro desconhecido")
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error)
      setError(error instanceof Error ? error.message : "Erro ao carregar histórico")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions(1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])
  
  useEffect(() => {
    const handlePomodoroCompleted = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Evento pomodoroCompleted detectado, atualizando histórico', customEvent.detail);
      setTimeout(() => {
        fetchSessions(1);
      }, 500);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('pomodoroCompleted', handlePomodoroCompleted);
      
      return () => {
        window.removeEventListener('pomodoroCompleted', handlePomodoroCompleted);
      };
    }
  }, []);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchSessions(newPage)
    }
  }

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case "work":
        return <Badge variant="default" className="bg-red-600 text-white">{t("work")}</Badge>
      case "shortBreak":
        return <Badge variant="default" className="bg-green-500 text-white">{t("shortBreak")}</Badge>
      case "longBreak":
        return <Badge variant="default" className="bg-violet-700 text-white">{t("longBreak")}</Badge>
      default:
        return <Badge variant="outline">{mode}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  if (isLoading && sessions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t("pomodoroHistory")}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{t("pomodoroHistory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center py-4">
            {error}
            {error.includes("401") && (
              <p className="text-sm mt-2 text-muted-foreground">
                {t("notAuthenticated", "Você não está autenticado. Tente recarregar a página.")}
              </p>
            )}
          </div>
          <div className="flex justify-center mt-4">
                          <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchSessions(1)}
                >
                  {t("tryAgain", "Tentar novamente")}
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                >
                  {t("reload", "Recarregar página")}
                </Button>
              </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t("pomodoroHistory")}</CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            {t("noSessionsFound")}
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("date")}</TableHead>
                  <TableHead>{t("task")}</TableHead>
                  <TableHead>{t("mode")}</TableHead>
                  <TableHead className="text-right">{t("durationMinutes")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(session.completedAt)}
                    </TableCell>
                    <TableCell>
                      {session.task ? session.task.title : t("noTaskSelected")}
                    </TableCell>
                    <TableCell>
                      {getModeBadge(session.mode)}
                    </TableCell>
                    <TableCell className="text-right">
                      {session.duration} min
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {pagination.totalPages > 1 && (
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> {t("previous")}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {t("pageXofY", { 
              current: pagination.page, 
              total: pagination.totalPages 
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || isLoading}
          >
            {t("next")} <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      )}
    </Card>
  )
} 