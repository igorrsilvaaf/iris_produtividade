"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor, TouchSensor, closestCorners } from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Calendar, CheckSquare, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"
import type { Todo } from "@/lib/todos"
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR, enUS } from "date-fns/locale"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { TaskDetail } from "@/components/task-detail"

type TranslationFunction = (key: string) => string;

type KanbanColumn = "backlog" | "planning" | "inProgress" | "validation" | "completed"

type KanbanCard = Todo & {
  column: KanbanColumn
  kanban_order?: number
}

const SortableCard = ({ card, onDelete, onEdit }: { card: KanbanCard, onDelete: (id: number) => void, onEdit: (id: number) => void }) => {
  const { t, language } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  const localeObj = language === 'pt' ? ptBR : enUS;
  
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onEdit(card.id);
  };
  
  const getPointsBadgeColor = (points: number) => {
    switch(points) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPointsLabel = (points: number) => {
    switch(points) {
      case 1: return t("veryEasy") || "Muito fácil";
      case 2: return t("easy") || "Fácil";
      case 3: return t("medium") || "Médio";
      case 4: return t("hard") || "Difícil";
      case 5: return t("veryHard") || "Muito difícil";
      default: return "";
    }
  };
  
  // Define a ordem das colunas para facilitar a navegação entre elas
  const columnOrder: KanbanColumn[] = ["backlog", "planning", "inProgress", "validation", "completed"];
  
  // Encontra o índice da coluna atual
  const currentColumnIndex = columnOrder.indexOf(card.column);
  
  // Determina se temos colunas anterior e próxima
  const hasPreviousColumn = currentColumnIndex > 0;
  const hasNextColumn = currentColumnIndex < columnOrder.length - 1;
  
  // Obtém as colunas anterior e próxima (se existirem)
  const previousColumn = hasPreviousColumn ? columnOrder[currentColumnIndex - 1] : null;
  const nextColumn = hasNextColumn ? columnOrder[currentColumnIndex + 1] : null;
  
  // Função para mover card para a coluna anterior
  const moveCardToPreviousColumn = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (previousColumn) {
      // Criar um evento sintético de arrastar para a coluna anterior
      const customEvent = {
        active: { id: card.id },
        over: { 
          id: `column-${previousColumn}`,
          data: { current: { type: 'column', column: previousColumn } }
        }
      };
      // Dispara evento personalizado para mover o card
      window.dispatchEvent(new CustomEvent('kanban-move-card', { detail: customEvent }));
    }
  };
  
  // Função para mover card para a próxima coluna
  const moveCardToNextColumn = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (nextColumn) {
      // Criar um evento sintético de arrastar para a próxima coluna
      const customEvent = {
        active: { id: card.id },
        over: { 
          id: `column-${nextColumn}`,
          data: { current: { type: 'column', column: nextColumn } }
        }
      };
      // Dispara evento personalizado para mover o card
      window.dispatchEvent(new CustomEvent('kanban-move-card', { detail: customEvent }));
    }
  };
  
  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="mb-2 shadow-sm hover:shadow-md transition-shadow bg-card relative cursor-pointer" 
      data-card-id={card.id} 
      data-type="card" 
      data-column={card.column}
      onClick={handleCardClick}
      {...attributes} 
    >
      <div 
        className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center bg-primary/10 opacity-0 hover:opacity-20 transition-opacity rounded-t-md cursor-grab"
        {...listeners}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 9l4-4 4 4"/>
          <path d="M5 15l4 4 4-4"/>
        </svg>
      </div>
      <CardContent className="p-2 pb-0 cursor-default">
        <div className="font-medium mb-1 text-sm">{card.title}</div>
        {card.description && (
          <div className="text-xs text-muted-foreground mb-1">
            {card.description.length > 50 
              ? `${card.description.substring(0, 50)}...`
              : card.description}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1 mb-1">
          {card.due_date && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(card.due_date), 'PPP', { locale: localeObj })}
            </div>
          )}
          {card.points !== undefined && (
            <div className={`text-xs px-1.5 py-0.5 rounded-full ${getPointsBadgeColor(card.points)}`}>
              {card.points} {getPointsLabel(card.points) && `- ${getPointsLabel(card.points)}`}
            </div>
          )}
        </div>
        {card.project_name && (
          <Badge 
            variant="outline" 
            className="text-xs mb-1" 
            style={{ borderColor: card.project_color || '#888', color: card.project_color || '#888' }}
          >
            {card.project_name}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-1 pt-0 flex justify-between">
        <div className="flex items-center gap-1 md:hidden">
          {hasPreviousColumn && (
            <Button 
              variant="outline"
              size="sm"
              onClick={moveCardToPreviousColumn}
              className="h-7 px-2 text-xs"
              title={t("Move to previous column")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </Button>
          )}
          {hasNextColumn && (
            <Button 
              variant="outline"
              size="sm"
              onClick={moveCardToNextColumn}
              className="h-7 px-2 text-xs"
              title={t("Move to next column")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </Button>
          )}
        </div>
        <div className="flex">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEdit(card.id);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(card.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const DroppableColumn = ({ 
  title, 
  columnKey, 
  items, 
  activeColumn, 
  setActiveColumn, 
  newCardTitle, 
  setNewCardTitle, 
  createNewCard,
  onDeleteCard,
  onEditCard,
  language,
  highlightedColumn,
  activeCardId
}: { 
  title: string, 
  columnKey: KanbanColumn, 
  items: KanbanCard[],
  activeColumn: KanbanColumn | null,
  setActiveColumn: (column: KanbanColumn | null) => void,
  newCardTitle: string,
  setNewCardTitle: (title: string) => void,
  createNewCard: (column: KanbanColumn) => void,
  onDeleteCard: (id: number) => void,
  onEditCard: (id: number) => void,
  language?: string,
  highlightedColumn?: KanbanColumn | null,
  activeCardId?: number | null
}) => {
  const { t } = useTranslation();
  const { setNodeRef } = useSortable({
    id: `column-${columnKey}`,
    data: {
      type: 'column',
      column: columnKey
    }
  });
  
  const getEmptyMessage = () => {
    if (columnKey === "backlog") {
      return t("No tasks in backlog");
    } else if (columnKey === "planning") {
      return t("No tasks in planning");
    } else if (columnKey === "inProgress") {
      return t("No tasks in progress");
    } else if (columnKey === "validation") {
      return t("No tasks in validation");
    } else if (columnKey === "completed") {
      return t("No completed tasks");
    }
    return t("No tasks");
  };
  
  return (
    <div 
      className={`rounded-lg ${highlightedColumn === columnKey ? 'bg-primary/10 shadow-lg' : 'bg-muted/20 shadow-sm'} mb-4 w-[250px] flex-none md:w-[270px] lg:w-[280px] transition-colors`} 
      ref={setNodeRef} 
      data-type="column" 
      data-column={columnKey}
    >
      <Card className="h-full">
        <CardHeader className="px-3 py-2 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <Badge variant="outline" className="ml-2">
              {items.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <ScrollArea className="h-[calc(100vh-450px)] max-h-[500px] pr-2">
            <div className="min-h-[100px] space-y-2">
              <SortableContext items={items.map(card => card.id)} strategy={verticalListSortingStrategy}>
                {items.length === 0 ? (
                  <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">
                    {getEmptyMessage()}
                  </div>
                ) : (
                  items.map(card => (
                    <SortableCard key={card.id} card={card} onDelete={onDeleteCard} onEdit={onEditCard} />
                  ))
                )}
              </SortableContext>
            </div>
          </ScrollArea>

          {activeColumn === columnKey && (
            <div className="mt-3 pt-3 border-t">
              <Input
                placeholder={t("addTask")}
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCardTitle.trim()) {
                    createNewCard(columnKey);
                  }
                }}
                className="mb-2"
              />
              <div className="flex gap-2 mt-2">
                <AddTaskDialog initialLanguage={language || "en"} initialColumn={columnKey}>
                  <Button size="sm">
                    {t("addTask")}
                  </Button>
                </AddTaskDialog>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setActiveColumn(null);
                    setNewCardTitle("");
                  }}
                >
                  {t("cancel")}
                </Button>
              </div>
            </div>
          )}
          
          {activeColumn !== columnKey && (
            <AddTaskDialog initialLanguage={language || "en"} initialColumn={columnKey}>
              <Button
                variant="outline"
                className="w-full mt-3 border-dashed"
              >
                <Plus className="h-4 w-4 mr-1" /> {t("addTask")}
              </Button>
            </AddTaskDialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export function KanbanBoard() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [activeColumn, setActiveColumn] = useState<KanbanColumn | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [shouldRefetch, setShouldRefetch] = useState(0);
  const lastFetchTimeRef = useRef<number>(0);
  const initialLoadDoneRef = useRef<boolean>(false);
  const [highlightedColumn, setHighlightedColumn] = useState<KanbanColumn | null>(null);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  
  const activeCard = activeCardId ? cards.find(card => card.id === activeCardId) : null;
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );
  
  const [isClient, setIsClient] = useState(false);
  const [hasCriticalError, setHasCriticalError] = useState<boolean>(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Manipulador para o evento personalizado 'kanban-move-card'
  useEffect(() => {
    const handleKanbanMoveCard = (event: CustomEvent) => {
      const detail = event.detail;
      if (!detail || !detail.active || !detail.over) return;
      
      console.log('Evento kanban-move-card acionado:', detail);
      handleDragEnd(detail);
    };
    
    window.addEventListener('kanban-move-card', handleKanbanMoveCard as EventListener);
    
    return () => {
      window.removeEventListener('kanban-move-card', handleKanbanMoveCard as EventListener);
    };
  }, [cards]); // Dependência em cards para garantir acesso aos dados mais recentes

  const updateTasksOnServer = async (tasksToUpdate: Array<{ id: number; column?: KanbanColumn; completed?: boolean; kanban_order?: number }>) => {
    if (tasksToUpdate.length === 0) return;

    try {
      for (const taskUpdate of tasksToUpdate) {
        const { id, column, completed, kanban_order } = taskUpdate;
        if (!column && completed === undefined && kanban_order === undefined) continue;

        const updates = {
          ...(column && { kanban_column: column }), 
          ...(completed !== undefined && { completed }),
          ...(kanban_order !== undefined && { kanban_order })
        };

        console.log(`Enviando atualização para tarefa ID ${id}:`, updates);

        const response = await fetch(`/api/tasks/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });
      
        if (response.ok) {
          console.log(`Tarefa ID ${id} atualizada no servidor com:`, updates);
          try {
            const responseData = await response.json();
            console.log(`Resposta do servidor para ID ${id}:`, responseData);
          } catch (e) {
            console.log(`Resposta sem corpo JSON para ID ${id}`);
          }
        } else {
          console.error(`Erro ao atualizar tarefa ID ${id}: ${response.status}`);
          try {
            const errorText = await response.text();
            console.error(`Detalhes do erro para ID ${id}:`, errorText);
          } catch (e) {
            console.error(`Não foi possível ler detalhes do erro para ID ${id}`);
          }
          toast({
            variant: "destructive",
            title: t("Failed to update some tasks"),
            description: t("Please try refreshing"),
          });

        }
      }

      setCards(prevCards => 
        prevCards.map(card => {
          const updateForThisCard = tasksToUpdate.find(tu => tu.id === card.id);
          if (updateForThisCard) {
            return { 
              ...card, 
              ...(updateForThisCard.column && { column: updateForThisCard.column }),
              ...(updateForThisCard.completed !== undefined && { completed: updateForThisCard.completed }),
              ...(updateForThisCard.kanban_order !== undefined && { kanban_order: updateForThisCard.kanban_order })
            };
          }
          return card;
        }).sort((a, b) => (a.kanban_order || 0) - (b.kanban_order || 0))
      );

    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to update tasks on server"),
        description: t("An unexpected error occurred"),
      });
      console.error(`Erro ao atualizar tarefas no servidor:`, error);
      setShouldRefetch(prev => prev + 1);
    }
  };

  const updateColumnOnServer = async (taskId: number, column: KanbanColumn, completed: boolean, order?: number) => {
    await updateTasksOnServer([{ 
      id: taskId, 
      column, 
      completed,
      ...(order !== undefined && { kanban_order: order })
    }]);
  };
  
  const fetchAndDistributeTasks = useCallback(async (signal?: AbortSignal): Promise<void> => {
    const now = Date.now();
    const cacheTime = 5000; 
    
    if (now - lastFetchTimeRef.current < cacheTime && initialLoadDoneRef.current) {
      console.log("Ignorando solicitação recente, dados carregados há menos de 5 segundos");
      return Promise.resolve();
    }
    
    lastFetchTimeRef.current = now;
    
    try {
      setIsLoading(true);
      console.log("Buscando tarefas para Kanban...");
      
      const tasksResponse = await fetch("/api/tasks?all=true", {
        method: "GET",
        signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'x-timestamp': Date.now().toString()
        }
      });
      
      if (!tasksResponse.ok) {
        console.error(`Erro ao buscar todas as tarefas: ${tasksResponse.status}`);
        toast({
          variant: "destructive",
          title: t("Failed to load tasks"),
          description: t("Please refresh the page to try again"),
        });
        setIsLoading(false);
        setHasCriticalError(true);
        return;
      }
      
      let todayData = { tasks: [] };
      try {
        const todayResponse = await fetch("/api/tasks/today", {
          method: "GET",
          signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'x-timestamp': Date.now().toString()
          }
        });
        
        if (todayResponse.ok) {
          todayData = await todayResponse.json();
        } else {
          console.error(`Erro ao buscar tarefas de hoje: ${todayResponse.status}`);
        }
      } catch (error) {
        console.error("Erro ao buscar tarefas de hoje:", error);
      }
      
      let upcomingData = { tasks: [] };
      try {
        const upcomingResponse = await fetch("/api/tasks/upcoming", {
          method: "GET",
          signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'x-timestamp': Date.now().toString()
          }
        });
        
        if (upcomingResponse.ok) {
          upcomingData = await upcomingResponse.json();
        } else {
          console.error(`Erro ao buscar tarefas próximas: ${upcomingResponse.status}`);
        }
      } catch (error) {
        console.error("Erro ao buscar tarefas próximas:", error);
      }
      
      const tasksData = await tasksResponse.json();
      
      if (!tasksData.tasks || !Array.isArray(tasksData.tasks)) {
        console.error("Formato de resposta inválido para todas as tarefas:", tasksData);
        setIsLoading(false);
        return;
      }
      
      const allTasks = tasksData.tasks as Todo[];
      const todayList = Array.isArray(todayData.tasks) ? todayData.tasks : [];
      const upcomingList = Array.isArray(upcomingData.tasks) ? upcomingData.tasks : [];
      
      console.log(`Total de tarefas: ${allTasks.length}, Hoje: ${todayList.length}, Próximas: ${upcomingList.length}`);
      
      if (upcomingList.length > 0) {
        console.log("Tarefas em Próximos:");
        upcomingList.forEach((task: any) => {
          console.log(`- ID ${task.id}, Título: "${task.title}"`);
        });
      } else {
        console.log("Nenhuma tarefa na lista de Próximos");
      }
      let orderCounter = 0;
      const tasksToUpdateOnServer: Array<{ id: number; column?: KanbanColumn; completed?: boolean; kanban_order?: number }> = [];

      const kanbanCards: KanbanCard[] = allTasks.map((task: Todo) => {
        let column: KanbanColumn;
        let needsServerUpdate = false;
        let currentKanbanOrder = task.kanban_order;

        if (task.kanban_column && 
            ["backlog", "planning", "inProgress", "validation", "completed"].includes(task.kanban_column)) {
          column = task.kanban_column as KanbanColumn;
          console.log(`Tarefa ID ${task.id} mantém coluna definida: ${column}`);
        } 
        else {
          needsServerUpdate = true;
          if (task.completed) {
            column = "completed";
            console.log(`Tarefa concluída ID ${task.id} => coluna: completed`);
          } 
          else if (todayList.some((t: any) => t.id === task.id)) {
            column = "planning";
            console.log(`Tarefa de hoje ID ${task.id} => coluna: planning`);
          } 
          else if (upcomingList.some((t: any) => t.id === task.id)) {
            column = "backlog";
            console.log(`Tarefa em Próximos ID ${task.id} => coluna: backlog`);
          }
          else {
            column = "backlog"; 
            console.log(`Tarefa não categorizada ID ${task.id} => coluna: backlog`);
          }
        }

        if (currentKanbanOrder == null) {
          currentKanbanOrder = orderCounter++;
          needsServerUpdate = true;
          console.log(`Tarefa ID ${task.id} recebeu nova ordem: ${currentKanbanOrder}`);
        }
        
        if (needsServerUpdate) {
          tasksToUpdateOnServer.push({
            id: task.id,
            column,
            completed: column === "completed",
            kanban_order: currentKanbanOrder
          });
        }
        
        return {
          ...task,
          column,
          kanban_order: currentKanbanOrder as number
        };
      }).sort((a, b) => {
        return (a.kanban_order || 0) - (b.kanban_order || 0);
      });
      
      console.log("Tarefas distribuídas para o Kanban:", kanbanCards.length);
      if (tasksToUpdateOnServer.length > 0) {
        console.log("Tarefas para atualizar no servidor (coluna/ordem inicial):", tasksToUpdateOnServer.length);
        updateTasksOnServer(tasksToUpdateOnServer);
      }
      
      setCards(kanbanCards);
      setTimeout(() => {
        const backlog = kanbanCards.filter(c => c.column === "backlog").length;
        const planning = kanbanCards.filter(c => c.column === "planning").length;
        const inProgress = kanbanCards.filter(c => c.column === "inProgress").length;
        const validation = kanbanCards.filter(c => c.column === "validation").length;
        const completed = kanbanCards.filter(c => c.column === "completed").length;
        
        console.log("==== RESUMO DA DISTRIBUIÇÃO ====");
        console.log(`Total de tarefas: ${kanbanCards.length}`);
        console.log(`Backlog: ${backlog}`);
        console.log(`Planejamento: ${planning}`);
        console.log(`Em Progresso: ${inProgress}`);
        console.log(`Validação: ${validation}`);
        console.log(`Concluídas: ${completed}`);
        console.log("================================");
        
        if (kanbanCards.length === 0) {
          console.log("ATENÇÃO: Nenhuma tarefa encontrada!");
        }
      }, 100);
      
      initialLoadDoneRef.current = true;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Erro ao buscar tarefas:", error);
        toast({
          variant: "destructive",
          title: t("Failed to load tasks"),
          description: t("Please refresh the page to try again"),
        });
        setHasCriticalError(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast, t, updateColumnOnServer]);
  
  useEffect(() => {
    if (!isClient) return;
    
    const controller = new AbortController();
    let mounted = true;
    
    const loadFromLocalStorage = () => {
      if (initialLoadDoneRef.current) return;
      
      try {
        const savedCards = localStorage.getItem('kanban-cards');
        if (savedCards) {
          const parsedCards = JSON.parse(savedCards) as KanbanCard[];
          console.log(`Carregados ${parsedCards.length} cartões do localStorage`);
          setCards(parsedCards);
          setIsLoading(false);
          initialLoadDoneRef.current = true;
        }
      } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error);
      }
    };
    
    loadFromLocalStorage();
    
    console.log("Inicializando Kanban - busca inicial de tarefas");
    fetchAndDistributeTasks(controller.signal)
      .then(() => {
        if (mounted) {
          console.log("Inicialização do Kanban concluída");
        }
      })
      .catch(error => {
        if (mounted) {
          console.error("Erro na inicialização do Kanban:", error);
        }
      });
    
    const intervalId = setInterval(() => {
      if (mounted && document.visibilityState === 'visible') {
        console.log("Atualizando tarefas do Kanban automaticamente...");
        fetchAndDistributeTasks().catch(err => {
          console.error("Erro na atualização automática:", err);
        });
      }
    }, 120000);
    
    return () => {
      mounted = false;
      controller.abort();
      clearInterval(intervalId);
    };
  }, [fetchAndDistributeTasks, shouldRefetch, isClient]);
  
  useEffect(() => {
    if (!isClient || isLoading || cards.length === 0) return;
    
    const timeoutId = setTimeout(() => {
      try {
        const cardsJson = JSON.stringify(cards);
        localStorage.setItem('kanban-cards', cardsJson);
        console.log(`Salvos ${cards.length} cartões no localStorage`);
      } catch (error) {
        console.error("Erro ao salvar no localStorage:", error);
      }
    }, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [cards, isLoading, isClient]);
  
  useEffect(() => {
    let isRefreshing = false;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isRefreshing) {
        isRefreshing = true;
        console.log("Página voltou a ficar visível, recarregando tarefas...");
        
        fetchAndDistributeTasks()
          .finally(() => {
            isRefreshing = false;
          });
      }
    };
    
    const handleFocus = () => {
      if (!isRefreshing) {
        isRefreshing = true;
        console.log("Janela ganhou foco, recarregando tarefas...");
        
        fetchAndDistributeTasks()
          .finally(() => {
            isRefreshing = false;
          });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAndDistributeTasks]);
  
  const createNewCard = async (column: KanbanColumn) => {
    if (!newCardTitle.trim()) return;
    
    try {
      console.log(`Criando nova tarefa no Kanban, coluna: ${column}`);
      setIsLoading(true);
      
      const taskData = {
        title: newCardTitle,
        description: "",
        kanban_column: column,
        completed: column === "completed",
      };
      
      console.log(`Dados da tarefa para criação: ${JSON.stringify(taskData)}`);
      
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      
      console.log(`Resposta da criação da tarefa - Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Tarefa criada com sucesso: ID ${data.task.id}, coluna: ${column}`);
        
        try {
          await updateColumnOnServer(data.task.id, column, column === "completed");
          console.log(`Coluna da tarefa ${data.task.id} definida como ${column}`);
        } catch (error) {
          console.error("Erro ao definir coluna da tarefa:", error);
        }
        
        fetchAndDistributeTasks();
        
        setNewCardTitle("");
        setActiveColumn(null);
        
        toast({
          title: t("taskCreated"),
          description: newCardTitle,
        });
      } else {
        const errorText = await response.text();
        console.error(`Erro ao criar tarefa na coluna ${column}: Status ${response.status}, Detalhes: ${errorText}`);
        
        toast({
          variant: "destructive",
          title: t("Failed to create task"),
          description: t("Please try again"),
        });
        setShouldRefetch(prev => prev + 1);
      }
    } catch (error) {
      console.error(`Exceção ao criar tarefa na coluna ${column}:`, error);
      
      toast({
        variant: "destructive",
        title: t("Failed to create task"),
        description: t("Please try again"),
      });
      setShouldRefetch(prev => prev + 1);
    }
  };
  
  const editCard = (taskId: number) => {
    const task = cards.find(card => card.id === taskId)
    if (task) {
      setSelectedTask(task)
      setShowTaskDetail(true)
    }
  };
  const deleteCard = async (cardId: number) => {
    try {
      const response = await fetch(`/api/tasks/${cardId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setCards(cards.filter(card => card.id !== cardId));
        
        toast({
          title: t("Task deleted successfully"),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("Failed to delete task"),
          description: t("Please try again"),
        });
        setShouldRefetch(prev => prev + 1);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to delete task"),
        description: t("Please try again"),
      });
      setShouldRefetch(prev => prev + 1);
    }
  };
  
  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveCardId(active.id);
    console.log(`Iniciando arrastar tarefa ID ${active.id}`);
  };
  
  const handleDragOver = (event: any) => {
    const { active, over } = event;
    
    if (!over) {
      setHighlightedColumn(null);
      return;
    }
    
    const activeCard = cards.find(card => card.id === active.id);
    
    console.log(`Arrastando ID ${active.id} sobre ${over.id}, tipo: ${over.data?.current?.type}`);
    
    if (over.data?.current?.type === 'column') {
      const newColumn = over.data.current.column as KanbanColumn;
      
      setHighlightedColumn(newColumn);
      
      if (activeCard && activeCard.column !== newColumn) {
        console.log(`Mudando coluna temporária para ${newColumn}`);
        setCards(cards.map(card => {
          if (card.id === active.id) {
            return {
              ...card,
              column: newColumn
            };
          }
          return card;
        }));
      }
    }
    else if (over.data?.current?.type === 'card') {
      const overCard = cards.find(card => card.id === over.id);
      
      if (overCard) {
        setHighlightedColumn(overCard.column);
        
        if (activeCard && activeCard.column !== overCard.column) {
          console.log(`Mudando para coluna do cartão: ${overCard.column}`);
          setCards(cards.map(card => {
            if (card.id === active.id) {
              return {
                ...card,
                column: overCard.column
              };
            }
            return card;
          }));
        }
      }
    }
  };
  
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveCardId(null);
    setActiveColumn(null);
    setHighlightedColumn(null);
    
    if (!over || !active) return;

    const activeId = active.id;
    const overId = over.id;

    const activeCard = cards.find(card => card.id === activeId);
    if (!activeCard) return;

    let newColumnKey = activeCard.column;
    let newCards = [...cards];
    const tasksToUpdate: Array<{ id: number; column?: KanbanColumn; completed?: boolean; kanban_order?: number }> = [];

    const overIsColumn = over.data?.current?.type === 'column';
    const overIsCard = over.data?.current?.type === 'card';

    if (overIsColumn) {
      newColumnKey = over.data.current.column as KanbanColumn;
    } else if (overIsCard) {
      const overCard = cards.find(card => card.id === overId);
      if (overCard) {
        newColumnKey = overCard.column;
      }
    }
    
    let isMoveAllowed = true;
    let newCompletedStatus = activeCard.completed;

    if (activeCard.column !== newColumnKey) {
      if (newColumnKey === "completed") {
        newCompletedStatus = true;
      } else {
        newCompletedStatus = false;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDueDate = activeCard.due_date ? new Date(activeCard.due_date) : null;
      if (taskDueDate) taskDueDate.setHours(0,0,0,0);

      if (newColumnKey === "backlog") {
        if (taskDueDate && taskDueDate.getTime() < today.getTime()) {
          console.warn(`Tarefa ${activeCard.id} movida para backlog com data passada/presente.`);
        }
      } else if (newColumnKey === "planning") {
        if (taskDueDate && taskDueDate.getTime() !== today.getTime()) {
          console.warn(`Tarefa ${activeCard.id} movida para planejamento sem ser para hoje.`);
        }
      }
    }

    if (!isMoveAllowed) {
            toast({
        variant: "destructive",
        title: t("Move not allowed"),
        description: t("This task cannot be moved to the selected column based on current rules."),
      });
      return;
    }

    // Se o card ativo foi movido para uma nova posição (nova coluna ou reordenado)
    if (activeId !== overId || activeCard.column !== newColumnKey) {
      const oldColumnKey = activeCard.column;
      const oldIndex = newCards.filter(c => c.column === oldColumnKey).findIndex(c => c.id === activeId);
      const itemBeingDragged = newCards.find(c => c.id === activeId);

      if (!itemBeingDragged) return;

      // Remover o item da sua posição original (temporariamente, se for arrayMove)
      // Se estivermos usando arrayMove, ele já lida com a remoção e inserção na nova lista visual.
      // A lógica aqui é para recalcular as ordens numéricas para o backend.

      let targetIndexInNewColumn = -1;
      let cardsInNewColumn = newCards.filter(c => c.column === newColumnKey);

      if (overIsColumn && overId === `column-${newColumnKey}`) {
        // Se soltou diretamente na coluna (sem ser sobre um card específico), assume o final da coluna.
        targetIndexInNewColumn = cardsInNewColumn.length;
      } else if (overIsCard) {
        const overCardIndexInItsColumn = cardsInNewColumn.findIndex(c => c.id === overId);
        targetIndexInNewColumn = overCardIndexInItsColumn;
      } else if (overIsColumn && oldColumnKey === newColumnKey) {
        // Este caso é quando se arrasta para a mesma coluna mas não sobre um card específico
        // DND Kit pode não dar um overId de card aqui, pode ser a própria coluna.
        // Se for para reordenar na mesma coluna, o over.id pode ser o id da coluna.
        // Esta parte pode precisar de ajuste dependendo do comportamento exato do DND Kit com `closestCorners`.
        // Por ora, se `overId` não for um card, e a coluna for a mesma, não fazemos nada aqui, 
        // pois a reordenação visual via SortableContext já ocorreu. O recalculo da ordem virá depois.
      }
      
      // Atualizar o estado local de `cards` para refletir a nova coluna e a reordenação visual
      // se `dnd-kit` não o fizer automaticamente ao mudar de `SortableContext`.
      // Se o DND kit move entre listas (colunas), precisamos atualizar a coluna do item.
      const updatedActiveCard = {
        ...itemBeingDragged,
        column: newColumnKey,
        completed: newCompletedStatus,
      };
      
      // Atualiza o card movido no array principal
      newCards = newCards.map(card => card.id === activeId ? updatedActiveCard : card);

      // Se moveu para uma coluna diferente, ou se não houve "over" de card (soltou no espaço vazio da coluna)
      if (oldColumnKey !== newColumnKey || (overIsColumn && overId === `column-${newColumnKey}`)) {
        // Lógica de `arrayMove` manual para refletir visualmente ANTES de salvar as ordens numéricas.
        // Encontrar o índice do item ativo na lista `newCards` (já pode ter a coluna atualizada)
        const activeCardCurrentIndex = newCards.findIndex(c => c.id === activeId);

        if (activeCardCurrentIndex !== -1) {
          const cardToMove = newCards[activeCardCurrentIndex];
          newCards.splice(activeCardCurrentIndex, 1); // Remove da posição antiga

          // Filtra os cards da nova coluna APÓS a remoção do card movido (se ele era da mesma coluna)
          const currentCardsInNewColumn = newCards.filter(c => c.column === newColumnKey);
          
          if (overIsCard) {
            const overCardGlobalIndex = newCards.findIndex(c => c.id === overId);
            if (overCardGlobalIndex !== -1) {
                // Decide se insere antes ou depois do overCard
                const overRect = document.querySelector(`[data-card-id="${overId}"]`)?.getBoundingClientRect();
                const clientY = event.activatorEvent?.clientY; // Posição Y do mouse/touch

                let insertAtIndex = newCards.indexOf(newCards.find(c => c.id === overId)!);

                if (overRect && clientY && clientY > overRect.top + overRect.height / 2) {
                    insertAtIndex +=1;
                }
                newCards.splice(insertAtIndex, 0, cardToMove);
            } else {
                 // Se overCard não for encontrado (improvável, mas como fallback), adiciona ao final da coluna
                newCards.push(cardToMove);
            }
          } else {
            // Se soltou na coluna (não sobre um card), adiciona ao final da lista de cards dessa coluna.
            // Encontra o índice do último card da nova coluna em newCards e insere depois dele.
            let lastIndexOfColumn = -1;
            for(let i = newCards.length - 1; i >= 0; i--) {
                if(newCards[i].column === newColumnKey) {
                    lastIndexOfColumn = i;
                    break;
                }
            }
            if(lastIndexOfColumn !== -1) {
                newCards.splice(lastIndexOfColumn + 1, 0, cardToMove);
            } else {
                newCards.push(cardToMove); // Se a coluna estava vazia
            }
          }
        }
      } else if (oldColumnKey === newColumnKey && overIsCard && activeId !== overId) {
        // Reordenando dentro da mesma coluna
        const fromIndex = newCards.filter(c => c.column === oldColumnKey).findIndex(c => c.id === activeId);
        const toIndex = newCards.filter(c => c.column === oldColumnKey).findIndex(c => c.id === overId);
        
        // Simular o arrayMove para a lista filtrada da coluna e depois aplicar no array geral
        const itemsInColumn = newCards.filter(c => c.column === oldColumnKey);
        const movedItemsInColumn = arrayMove(itemsInColumn, fromIndex, toIndex);
        
        // Atualizar newCards com base na ordem de movedItemsInColumn
        let columnCardIndex = 0;
        newCards = newCards.map(card => {
          if (card.column === oldColumnKey) {
            return movedItemsInColumn[columnCardIndex++];
          }
          return card;
        });
      }

      setCards(newCards); // Atualiza o estado visual imediatamente

      // Recalcular kanban_order para as colunas afetadas (antiga e nova, se diferentes)
      const columnsToUpdateOrder = new Set<KanbanColumn>([oldColumnKey, newColumnKey]);
      
      columnsToUpdateOrder.forEach(colKey => {
        const cardsInThisColumn = newCards.filter(c => c.column === colKey)
                                       .sort((a,b) => {
                                         // Se estamos reordenando, precisamos de uma maneira de saber a ordem visual
                                         // A ordem em `newCards` DEVE refletir a ordem visual desejada.
                                         const elementA = document.querySelector(`[data-card-id="${a.id}"]`);
                                         const elementB = document.querySelector(`[data-card-id="${b.id}"]`);
                                         if (elementA && elementB) {
                                           return elementA.getBoundingClientRect().top - elementB.getBoundingClientRect().top;
                                         }
                                         return (a.kanban_order || 0) - (b.kanban_order || 0); // Fallback
                                       });
        
        cardsInThisColumn.forEach((card, index) => {
          if (card.kanban_order !== index || card.id === activeId) { // Se a ordem mudou ou é o card ativo
            const existingUpdate = tasksToUpdate.find(tu => tu.id === card.id);
            if (existingUpdate) {
              existingUpdate.kanban_order = index;
              if (card.id === activeId) { // Garante que a coluna e o status completed do card ativo sejam os mais recentes
                existingUpdate.column = newColumnKey;
                existingUpdate.completed = newCompletedStatus;
              }
            } else {
              tasksToUpdate.push({
                id: card.id,
                kanban_order: index,
                ...(card.id === activeId && { column: newColumnKey, completed: newCompletedStatus }),
              });
            }
          }
        });
      });
    } else {
      // Se não houve mudança de posição (nem coluna nem ordem), mas a coluna é 'completed', apenas atualiza o status
      if (activeCard.column === "completed" && activeCard.completed !== true) {
         tasksToUpdate.push({ id: activeCard.id, completed: true, column: "completed" });
      } else if (activeCard.column !== "completed" && activeCard.completed !== false) {
         tasksToUpdate.push({ id: activeCard.id, completed: false, column: activeCard.column });
      }
    }

    if (tasksToUpdate.length > 0) {
      console.log("Enviando atualizações para o servidor:", JSON.stringify(tasksToUpdate, null, 2));
      updateTasksOnServer(tasksToUpdate);
      // Notificar o usuário sobre a ação (opcional, pode ser coberto por updateTasksOnServer)
      toast({
        title: t("Kanban updated"),
        description: t("Task positions and statuses have been updated."),
      });
    }
  };
  
  // Agrupar cartões por coluna
  const backlogCards = cards.filter(card => card.column === "backlog");
  const planningCards = cards.filter(card => card.column === "planning");
  const inProgressCards = cards.filter(card => card.column === "inProgress");
  const validationCards = cards.filter(card => card.column === "validation");
  const completedCards = cards.filter(card => card.column === "completed");
  
  const getColumnTitle = (key: KanbanColumn): string => {
    switch (key) {
      case "backlog": return t("backlog");
      case "planning": return t("planning");
      case "inProgress": return t("inProgress");
      case "validation": return t("validation");
      case "completed": return t("completed");
      default: return "";
    }
  };
  
  if (hasCriticalError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="text-destructive text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">{t("Error loading Kanban")}</h2>
        <p className="text-muted-foreground mb-4">{t("There was a problem loading your tasks")}</p>
        <Button 
          onClick={() => {
            setHasCriticalError(false);
            setIsLoading(true);
            fetchAndDistributeTasks()
              .catch(() => setHasCriticalError(true))
              .finally(() => setIsLoading(false));
          }}
        >
          {t("Try again")}
        </Button>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-2xl font-bold">{t("kanban")}</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            // Evitar atualização se já estiver carregando
            if (isLoading) return;
            
            // Forçar atualização das tarefas
            console.log("Atualizando manualmente todas as tarefas do Kanban...");
            setIsLoading(true);
            
            // Primeiro vamos buscar as tarefas
            fetchAndDistributeTasks()
              .then(() => {
                console.log("Atualização manual concluída com sucesso!");
                toast({
                  variant: "default",
                  title: t("Tasks updated"),
                  description: t("Kanban board is now up to date")
                });
              })
              .catch(error => {
                console.error("Erro na atualização manual:", error);
                toast({
                  variant: "destructive",
                  title: t("Failed to update tasks"),
                  description: t("Please try again")
                });
              })
              .finally(() => {
                setIsLoading(false);
              });
            
            setShouldRefetch(prev => prev + 1);
          }}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t("Refresh")}
        </Button>
      </div>
    
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-nowrap gap-4 p-4 overflow-x-auto pb-8">
          <DroppableColumn
            title={getColumnTitle("backlog")}
            columnKey="backlog"
            items={backlogCards}
            activeColumn={activeColumn}
            setActiveColumn={setActiveColumn}
            newCardTitle={newCardTitle}
            setNewCardTitle={setNewCardTitle}
            createNewCard={createNewCard}
            onDeleteCard={deleteCard}
            onEditCard={editCard}
            language={language}
            highlightedColumn={highlightedColumn}
            activeCardId={activeCardId}
          />
          
          <DroppableColumn
            title={getColumnTitle("planning")}
            columnKey="planning"
            items={planningCards}
            activeColumn={activeColumn}
            setActiveColumn={setActiveColumn}
            newCardTitle={newCardTitle}
            setNewCardTitle={setNewCardTitle}
            createNewCard={createNewCard}
            onDeleteCard={deleteCard}
            onEditCard={editCard}
            language={language}
            highlightedColumn={highlightedColumn}
            activeCardId={activeCardId}
          />
          
          <DroppableColumn
            title={getColumnTitle("inProgress")}
            columnKey="inProgress"
            items={inProgressCards}
            activeColumn={activeColumn}
            setActiveColumn={setActiveColumn}
            newCardTitle={newCardTitle}
            setNewCardTitle={setNewCardTitle}
            createNewCard={createNewCard}
            onDeleteCard={deleteCard}
            onEditCard={editCard}
            language={language}
            highlightedColumn={highlightedColumn}
            activeCardId={activeCardId}
          />
          
          <DroppableColumn
            title={getColumnTitle("validation")}
            columnKey="validation"
            items={validationCards}
            activeColumn={activeColumn}
            setActiveColumn={setActiveColumn}
            newCardTitle={newCardTitle}
            setNewCardTitle={setNewCardTitle}
            createNewCard={createNewCard}
            onDeleteCard={deleteCard}
            onEditCard={editCard}
            language={language}
            highlightedColumn={highlightedColumn}
            activeCardId={activeCardId}
          />
          
          <DroppableColumn
            title={getColumnTitle("completed")}
            columnKey="completed"
            items={completedCards}
            activeColumn={activeColumn}
            setActiveColumn={setActiveColumn}
            newCardTitle={newCardTitle}
            setNewCardTitle={setNewCardTitle}
            createNewCard={createNewCard}
            onDeleteCard={deleteCard}
            onEditCard={editCard}
            language={language}
            highlightedColumn={highlightedColumn}
            activeCardId={activeCardId}
          />
        </div>
        
        <DragOverlay>
          {activeCardId && activeCard ? (
            <Card className="w-68 mb-2 shadow-lg">
              <CardContent className="p-2">
                <div className="font-medium text-sm">{activeCard.title}</div>
                {activeCard.description && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {activeCard.description.length > 50 
                      ? `${activeCard.description.substring(0, 50)}...`
                      : activeCard.description}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {activeCard.points !== undefined && (
                    <div className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeCard.points === 1 ? 'bg-green-100 text-green-800' :
                      activeCard.points === 2 ? 'bg-blue-100 text-blue-800' :
                      activeCard.points === 3 ? 'bg-yellow-100 text-yellow-800' :
                      activeCard.points === 4 ? 'bg-orange-100 text-orange-800' :
                      activeCard.points === 5 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activeCard.points}
                    </div>
                  )}
                </div>
                {activeCard.project_name && (
                  <Badge 
                    variant="outline" 
                    className="text-xs mt-2" 
                    style={{ borderColor: activeCard.project_color || '#888', color: activeCard.project_color || '#888' }}
                  >
                    {activeCard.project_name}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      
      {selectedTask && (
        <TaskDetail 
          task={selectedTask} 
          open={showTaskDetail} 
          onOpenChange={setShowTaskDetail} 
        />
      )}
    </>
  );
}