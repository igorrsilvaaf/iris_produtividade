"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor, TouchSensor, closestCorners, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Calendar, CheckSquare, RefreshCw, Wifi, WifiOff } from "lucide-react"
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
import { useTaskUpdates } from "@/hooks/use-task-updates"
import { KanbanSyncManager } from "@/lib/kanban/sync-manager"
import { KanbanDragDropHandler } from "@/lib/kanban/drag-drop-handler"
import { KanbanCache, kanbanCache } from "@/lib/kanban/cache"
import { deduplicatedFetch } from "@/lib/request-deduplicator"
import { useOfflineSupport } from "@/hooks/useOfflineSupport"
import { useDynamicColumns } from "@/hooks/use-dynamic-columns"
import { AddColumnButton, ColumnActionsMenu } from "@/components/kanban/column-management"
import type { KanbanState, KanbanTask, KanbanColumnId, KanbanColumnData, SyncStatus } from "@/lib/types/kanban"
import { useUser } from "@/hooks/use-user"

type TranslationFunction = (key: string) => string;

type KanbanCard = Todo & {
  column: KanbanColumnId
  kanban_order?: number
}

const SortableCard = memo(({ card, onDelete, onEdit }: { card: KanbanCard, onDelete: (id: number) => void, onEdit: (id: number) => void }) => {
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
  
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onEdit(card.id);
  }, [card.id, onEdit]);
  
  const getPointsBadgeColor = useCallback((points: number) => {
    switch(points) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);
  
  const getPointsLabel = useCallback((points: number) => {
    switch(points) {
      case 1: return t("veryEasy") || "Muito fácil";
      case 2: return t("easy") || "Fácil";
      case 3: return t("medium") || "Médio";
      case 4: return t("hard") || "Difícil";
      case 5: return t("veryHard") || "Muito difícil";
      default: return "";
    }
  }, [t]);
  
  const columnOrder: KanbanColumnId[] = ["backlog", "planning", "inProgress", "validation", "completed"];
  const currentColumnIndex = columnOrder.indexOf(card.column);
  const hasPreviousColumn = currentColumnIndex > 0;
  const hasNextColumn = currentColumnIndex < columnOrder.length - 1;
  const previousColumn = hasPreviousColumn ? columnOrder[currentColumnIndex - 1] : null;
  const nextColumn = hasNextColumn ? columnOrder[currentColumnIndex + 1] : null;
  
  const moveCardToPreviousColumn = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (previousColumn) {
      const customEvent = {
        active: { id: card.id },
        over: { 
          id: `column-${previousColumn}`,
          data: { current: { type: 'column', column: previousColumn } }
        }
      };
      window.dispatchEvent(new CustomEvent('kanban-move-card', { detail: customEvent }));
    }
  }, [previousColumn, card.id]);
  
  const moveCardToNextColumn = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (nextColumn) {
      const customEvent = {
        active: { id: card.id },
        over: { 
          id: `column-${nextColumn}`,
          data: { current: { type: 'column', column: nextColumn } }
        }
      };
      window.dispatchEvent(new CustomEvent('kanban-move-card', { detail: customEvent }));
    }
  }, [nextColumn, card.id]);
  
  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="mb-2 shadow-sm hover:shadow-md transition-shadow bg-card relative cursor-pointer" 
      data-card-id={card.id} 
      data-type="card" 
      data-column={card.column}
      data-testid={`kanban-card-${card.id}`}
      onClick={handleCardClick}
      {...attributes} 
    >
      <div 
        className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center bg-primary/10 opacity-0 hover:opacity-20 transition-opacity rounded-t-md cursor-grab"
        {...listeners}
        data-testid={`kanban-card-drag-handle-${card.id}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 9l4-4 4 4"/>
          <path d="M5 15l4 4 4-4"/>
        </svg>
      </div>
      <CardContent className="p-2 pb-0 cursor-default">
        <div className="font-medium mb-1 text-sm" data-testid={`kanban-card-title-${card.id}`}>{card.title}</div>
        {card.description && (
          <div className="text-xs text-muted-foreground mb-1" data-testid={`kanban-card-description-${card.id}`}>
            {card.description.length > 50 
              ? `${card.description.substring(0, 50)}...`
              : card.description}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1 mb-1" data-testid={`kanban-card-metadata-${card.id}`}>
          {card.due_date && (
            <div className="flex items-center text-xs text-muted-foreground" data-testid={`kanban-card-due-date-${card.id}`}>
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(card.due_date), 'PPP', { locale: localeObj })}
            </div>
          )}
          {card.points !== undefined && (
            <div className={`text-xs px-1.5 py-0.5 rounded-full ${getPointsBadgeColor(card.points ?? 0)}`} data-testid={`kanban-card-points-${card.id}`}>
              {card.points !== null && card.points !== undefined && (
                <>
                  {card.points} {getPointsLabel(card.points) && `- ${getPointsLabel(card.points)}`}
                </>
              )}
            </div>
          )}
        </div>
        {card.project_name && (
          <Badge 
            variant="outline" 
            className="text-xs mb-1" 
            style={{ borderColor: card.project_color || '#888', color: card.project_color || '#888' }}
            data-testid={`kanban-card-project-${card.id}`}
          >
            {card.project_name}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-1 pt-0 flex justify-between" data-testid={`kanban-card-actions-${card.id}`}>
        <div className="flex items-center gap-1 md:hidden">
          {hasPreviousColumn && (
            <Button 
              variant="outline"
              size="sm"
              onClick={moveCardToPreviousColumn}
              className="h-7 px-2 text-xs"
              title={t("Move to previous column")}
              data-testid={`kanban-card-move-left-${card.id}`}
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
              data-testid={`kanban-card-move-right-${card.id}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(card.id);
            }}
            className="h-7 px-2 text-xs"
            title={t("Edit")}
            data-testid={`kanban-card-edit-${card.id}`}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onDelete(card.id);
            }}
            className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
            title={t("Delete")}
            data-testid={`kanban-card-delete-${card.id}`}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
});

SortableCard.displayName = "SortableCard";

interface DynamicColumn {
  id: string
  title: string
  color: string
  order: number
  is_default: boolean
  created_at: string
  updated_at: string
}

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
  column,
  showActions = false
}: { 
  title: string, 
  columnKey: string, 
  items: KanbanCard[],
  activeColumn: string | null,
  setActiveColumn: (column: string | null) => void,
  newCardTitle: string,
  setNewCardTitle: (title: string) => void,
  createNewCard: (column: string) => void,
  onDeleteCard: (id: number) => void,
  onEditCard: (id: number) => void,
  language?: string,
  highlightedColumn?: string | null,
  column?: DynamicColumn,
  showActions?: boolean
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
            <div className="flex items-center gap-2">
              {column && (
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: column.color }}
                />
              )}
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {items.length}
              </Badge>
              {showActions && column && (
                <ColumnActionsMenu column={column} />
              )}
            </div>
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
                data-testid={`kanban-column-${columnKey}-add-input`}
              />
              <div className="flex gap-2 mt-2">
                <AddTaskDialog initialLanguage={language || "en"} initialColumn={columnKey}>
                  <Button size="sm" data-testid={`kanban-column-${columnKey}-add-button`}>
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
                  data-testid={`kanban-column-${columnKey}-cancel-button`}
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
                data-testid={`kanban-column-${columnKey}-add-task-button`}
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
  const { notifyTaskDeleted } = useTaskUpdates();
  const { columns, isLoading: columnsLoading, ensureColumnsLoaded, createColumn, updateColumn, deleteColumn, reorderColumns } = useDynamicColumns();
  
  // Nova estrutura de estado usando KanbanState
  const [kanbanState, setKanbanState] = useState<KanbanState>({
    columns: {
      backlog: { id: 'backlog', title: 'Backlog', taskIds: [], order: 0 },
      planning: { id: 'planning', title: 'Planning', taskIds: [], order: 1 },
      inProgress: { id: 'inProgress', title: 'In Progress', taskIds: [], order: 2 },
      validation: { id: 'validation', title: 'Validation', taskIds: [], order: 3 },
      completed: { id: 'completed', title: 'Completed', taskIds: [], order: 4 }
    },
    tasks: {},
    columnOrder: ['backlog', 'planning', 'inProgress', 'validation', 'completed'] as KanbanColumnId[],
    syncStatus: {
      pending: [],
      syncing: [],
      failed: []
    },
    lastSync: Date.now()
  });
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [shouldRefetch, setShouldRefetch] = useState(0);
  const lastFetchTimeRef = useRef<number>(0);
  const initialLoadDoneRef = useRef<boolean>(false);
  const [highlightedColumn, setHighlightedColumn] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [hasCriticalError, setHasCriticalError] = useState<boolean>(false);
  
  // Usar hook useUser em vez de estado local
  const { user } = useUser();
  
  // Hooks para suporte offline
  const { isOnline, queueOfflineOperation, processOfflineQueue, offlineQueueSize } = useOfflineSupport();
  
  // Instâncias dos gerenciadores
  const syncManagerRef = useRef<KanbanSyncManager | null>(null);
  const dragDropHandlerRef = useRef<KanbanDragDropHandler | null>(null);
  const cacheRef = useRef<KanbanCache>(kanbanCache);
  
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
  
  useEffect(() => {
    setIsClient(true);
    
    // Inicializar gerenciadores
    if (!syncManagerRef.current) {
      syncManagerRef.current = new KanbanSyncManager(
        (status) => setSyncStatus(status)
      );
    }
    
    if (!dragDropHandlerRef.current) {
      dragDropHandlerRef.current = new KanbanDragDropHandler(
        syncManagerRef.current
      );
    }
    
    // Lazy loading: carregar colunas apenas quando necessário
    const initializeColumns = async () => {
      await ensureColumnsLoaded();
    };

    initializeColumns();
  }, [ensureColumnsLoaded]);
  
  // Converter Todo[] para KanbanState dinâmico
  const convertTodosToKanbanState = useCallback((todos: Todo[]): KanbanState => {
    const dynamicColumns: Record<string, KanbanColumnData> = {};
    const columnOrder: KanbanColumnId[] = [];
    
    // Criar colunas dinâmicas baseadas no hook
    columns.forEach(column => {
      dynamicColumns[column.id] = {
        id: column.id as KanbanColumnId,
        title: column.title,
        taskIds: [],
        order: column.order,
        color: column.color,
        isDefault: column.is_default,
        lastUpdated: new Date(Date.now())
      };
      columnOrder.push(column.id as KanbanColumnId);
    });
    
    const newState: KanbanState = {
      columns: dynamicColumns,
      tasks: {},
      columnOrder,
      syncStatus: {
        pending: [],
        syncing: [],
        failed: []
      },
      lastSync: Date.now()
    }

    // Conversor de prioridade numérica -> string do KanbanTask
    const getPriorityString = (
      priority: number | null | undefined
    ): 'low' | 'medium' | 'high' => {
      if (priority == null) return 'medium';
      if (priority <= 2) return 'high';
      if (priority === 3) return 'medium';
      return 'low';
    };
    
    todos.forEach(todo => {
      const status = (
        (todo.kanban_column as KanbanColumnId) ??
        (columns[0]?.id as KanbanColumnId) ??
        'backlog'
      ) as KanbanColumnId;

      const task: KanbanTask = {
        id: todo.id,
        title: todo.title,
        description: todo.description || '',
        status,
        priority: getPriorityString(todo.priority),
        points: todo.points ?? undefined,
        projectId: todo.project_id ?? undefined,
        projectName: todo.project_name,
        projectColor: todo.project_color,
        createdAt: todo.created_at,
        updatedAt: todo.updated_at ?? undefined,
        order: todo.kanban_order ?? 0,
        completed: todo.completed
      }
      
      newState.tasks[task.id] = task
      const columnId = (task.status || 'inProgress') as KanbanColumnId;
      if (newState.columns[columnId]) {
        newState.columns[columnId].taskIds.push(task.id)
      }
    })
    
    // Ordenar tasks em cada coluna
    Object.values(newState.columns).forEach(column => {
      column.taskIds.sort((a, b) => {
        const taskA = newState.tasks[a]
        const taskB = newState.tasks[b]
        return (taskA?.order || 0) - (taskB?.order || 0)
      })
    })
    
    return newState
  }, [columns])
  
  // Manipulador para o evento personalizado 'kanban-move-card'
  useEffect(() => {
    const handleKanbanMoveCard = (event: CustomEvent) => {
      const detail = event.detail;
      if (!detail || !detail.active || !detail.over) return;
      
      if (dragDropHandlerRef.current) {
        dragDropHandlerRef.current.handleDragEnd(detail, kanbanState, setKanbanState);
      } else {
        // Fallback para o método local
        handleDragEnd(detail);
      }
    };
    
    window.addEventListener('kanban-move-card', handleKanbanMoveCard as EventListener);
    
    return () => {
      window.removeEventListener('kanban-move-card', handleKanbanMoveCard as EventListener);
    };
  }, [kanbanState]); // Dependência em kanbanState para garantir acesso aos dados mais recentes

  const updateTasksOnServer = useCallback(async (tasksToUpdate: Array<{ id: number; column?: KanbanColumnId; completed?: boolean; kanban_order?: number }>) => {
    if (tasksToUpdate.length === 0) return;

    // Processar em lotes de 10 tarefas para evitar requisições muito grandes
    const BATCH_SIZE = 10;
    const batches = [];
    
    for (let i = 0; i < tasksToUpdate.length; i += BATCH_SIZE) {
      batches.push(tasksToUpdate.slice(i, i + BATCH_SIZE));
    }

    try {
      // Processar cada lote sequencialmente para evitar sobrecarga
      for (const batch of batches) {
        const bulkResponse = await deduplicatedFetch(`/api/tasks/bulk`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ updates: batch }),
        });

        if (!bulkResponse.ok) {
          // Fallback: processar individualmente apenas as tarefas do lote atual
          for (const taskUpdate of batch) {
            const { id, column, completed, kanban_order } = taskUpdate;
            const updates = {
              ...(column && { kanban_column: column }),
              ...(completed !== undefined && { completed }),
              ...(kanban_order !== undefined && { kanban_order })
            };
            const resp = await deduplicatedFetch(`/api/tasks/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updates),
            });
            if (!resp.ok) {
              toast({
                variant: "destructive",
                title: t("Failed to update some tasks"),
                description: t("Please try refreshing"),
              });
            }
          }
        }
        
        // Pequeno delay entre lotes para evitar sobrecarga do servidor
        if (batches.length > 1 && batch !== batches[batches.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      setCards(prevCards =>
        prevCards
          .map(card => {
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
          })
          .sort((a, b) => (a.kanban_order || 0) - (b.kanban_order || 0))
      );
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to update tasks on server"),
        description: t("An unexpected error occurred"),
      });
      console.error(`Error updating tasks on server:`, error);
    }
  }, [toast, t]);

  const updateColumnOnServer = async (taskId: number, column: KanbanColumnId, completed: boolean, order?: number) => {
    await updateTasksOnServer([{ 
      id: taskId, 
      column, 
      completed,
      ...(order !== undefined && { kanban_order: order })
    }]);
  };
  
  const fetchAndDistributeTasks = useCallback(async (signal?: AbortSignal, options?: { silent?: boolean }): Promise<void> => {
    const now = Date.now();
    const cacheTime = 5000; 
    
    if (now - lastFetchTimeRef.current < cacheTime && initialLoadDoneRef.current) {
      return Promise.resolve();
    }
    
    // Verificar cache primeiro
    const cached = cacheRef.current.get('kanban-tasks');
    if (cached && initialLoadDoneRef.current) {
      const newState = convertTodosToKanbanState(cached);
      setKanbanState(newState);
      return Promise.resolve();
    }
    
    lastFetchTimeRef.current = now;
    
    try {
      if (!options?.silent) {
        setIsLoading(true);
      }

      const tasksResponse = await deduplicatedFetch("/api/tasks?all=true", {
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
      
      const tasksData = await tasksResponse.json();
      
      if (!tasksData.tasks || !Array.isArray(tasksData.tasks)) {
        console.error("Formato de resposta inválido para todas as tarefas:", tasksData);
        setIsLoading(false);
        return;
      }
      
      const allTasks = tasksData.tasks as Todo[];

      
      let orderCounter = 0;
      const tasksToUpdateOnServer: Array<{ id: number; column?: string; completed?: boolean; kanban_order?: number }> = [];

      const kanbanCards: KanbanCard[] = allTasks.map((task: Todo) => {
          let column: KanbanColumnId;
          let needsServerUpdate = false;
          let currentKanbanOrder = task.kanban_order;

          // Se a tarefa já tem uma coluna kanban definida, use ela
          if (task.kanban_column && 
              ["backlog", "planning", "inProgress", "validation", "completed"].includes(task.kanban_column)) {
            column = task.kanban_column as KanbanColumnId;
          } 
          // Se não tem coluna definida, determine baseado na data
          else {
            needsServerUpdate = true;
            if (task.completed) {
              column = "completed";
            } 
            else if (task.due_date) {
              const taskDate = new Date(task.due_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
              const todayTime = today.getTime();
              const tomorrowTime = tomorrow.getTime();
              const taskTime = taskDateOnly.getTime();
              
              if (taskTime === todayTime) {
                column = "planning"; // Hoje
              } else if (taskTime >= tomorrowTime) {
                column = "backlog"; // Futuro
              } else {
                column = "planning"; // Atrasado
              }
            }
            else {
              column = "inProgress"; // Sem data
            }
          }

          if (currentKanbanOrder == null) {
            currentKanbanOrder = orderCounter++;
            needsServerUpdate = true;
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
            kanban_order: currentKanbanOrder
          } as KanbanCard;
        }).sort((a, b) => {
          return (a.kanban_order || 0) - (b.kanban_order || 0);
        });

      if (tasksToUpdateOnServer.length > 0) {
        await updateTasksOnServer(tasksToUpdateOnServer as { id: number; column?: KanbanColumnId; completed?: boolean; kanban_order?: number }[]);
      }
      
      // Converter para nova estrutura e atualizar estado
      const newState = convertTodosToKanbanState(kanbanCards);
      setKanbanState(newState);
      
      // Atualizar cache
      cacheRef.current.set('kanban-tasks', kanbanCards, 'high');
      
      // Manter compatibilidade com código legado
      setCards(kanbanCards);
      initialLoadDoneRef.current = true;
    } catch (error: unknown) {
      if ((error as Error).name !== 'AbortError') {
        console.error("Erro ao buscar tarefas:", error);
        toast({
          variant: "destructive",
          title: t("Failed to load tasks"),
          description: t("Please refresh the page to try again"),
        });
        setHasCriticalError(true);
      }
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, [toast, t, updateTasksOnServer, convertTodosToKanbanState]);
  
  const fetchTasksRef = useRef(fetchAndDistributeTasks);
  useEffect(() => {
    fetchTasksRef.current = fetchAndDistributeTasks;
  }, [fetchAndDistributeTasks]);
  
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

          setCards(parsedCards);
          setIsLoading(false);
          initialLoadDoneRef.current = true;
        }
      } catch {
        console.error("Erro ao carregar dados do localStorage");
      }
    };
    
    loadFromLocalStorage();
    

    fetchTasksRef.current(controller.signal)
      .then(() => {
        if (mounted) {

        }
      })
      .catch(error => {
        if (mounted) {
          console.error("Erro na inicialização do Kanban:", error);
        }
      });
    
    // Debounce para polling automático
    let pollingTimeoutId: NodeJS.Timeout | null = null;
    
    const debouncedPolling = () => {
      if (pollingTimeoutId) {
        clearTimeout(pollingTimeoutId);
      }
      pollingTimeoutId = setTimeout(() => {
        if (mounted && document.visibilityState === 'visible') {
          fetchTasksRef.current(undefined, { silent: true }).catch(err => {
            console.error("Erro na atualização automática:", err);
          });
        }
      }, 1000); // 1s debounce
    };
    
    const intervalId = setInterval(() => {
      debouncedPolling();
    }, 300000); // Reduzido de 120s para 300s (5min)
    
    return () => {
      mounted = false;
      controller.abort();
      clearInterval(intervalId);
      if (pollingTimeoutId) {
        clearTimeout(pollingTimeoutId);
      }
    };
  }, [isClient]);
  
  useEffect(() => {
    if (!isClient || isLoading || cards.length === 0) return;
    
    // Debounce mais longo para localStorage (5s) para reduzir escritas
    const timeoutId = setTimeout(() => {
      try {
        const cardsJson = JSON.stringify(cards);
        const currentStored = localStorage.getItem('kanban-cards');
        
        // Só salva se realmente mudou para evitar escritas desnecessárias
        if (currentStored !== cardsJson) {
          localStorage.setItem('kanban-cards', cardsJson);
          console.debug('Cards salvos no localStorage:', cards.length, 'items');
        }
      } catch {
         console.error("Erro ao salvar no localStorage");
       }
    }, 5000); // Aumentado de 2s para 5s
    
    return () => clearTimeout(timeoutId);
  }, [cards, isLoading, isClient]);
  
  useEffect(() => {
    let isRefreshing = false;
    let visibilityTimeoutId: NodeJS.Timeout | null = null;
    let focusTimeoutId: NodeJS.Timeout | null = null;
    
    const debouncedRefresh = (timeoutRef: { current: NodeJS.Timeout | null }, delay: number = 2000) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (!isRefreshing && document.visibilityState === 'visible') {
          isRefreshing = true;
          fetchTasksRef.current(undefined, { silent: true })
            .finally(() => {
              isRefreshing = false;
            });
        }
      }, delay);
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const timeoutRef = { current: visibilityTimeoutId };
        debouncedRefresh(timeoutRef, 1500); // 1.5s debounce para visibilidade
        visibilityTimeoutId = timeoutRef.current;
      }
    };
    
    const handleFocus = () => {
      const timeoutRef = { current: focusTimeoutId };
      debouncedRefresh(timeoutRef, 3000); // 3s debounce para focus
      focusTimeoutId = timeoutRef.current;
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (visibilityTimeoutId) clearTimeout(visibilityTimeoutId);
      if (focusTimeoutId) clearTimeout(focusTimeoutId);
    };
  }, []);
  
  const createNewCard = useCallback(async (columnId: string) => {
    if (!newCardTitle.trim()) return;

    const column = columns.find(col => col.id === columnId);
    if (!column) return;

    try {
      const response = await deduplicatedFetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newCardTitle,
          kanban_column: columnId,
          priority: 'medium'
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar tarefa');
      }

      const newTodo = await response.json();
      
      // Atualizar estado local
      const newCard: KanbanCard = {
        ...newTodo,
        column: columnId as KanbanColumnId,
        description: newTodo.description || "",
        priority: newTodo.priority || 'medium',
        dueDate: newTodo.due_date,
        tags: newTodo.tags || [],
        assignee: newTodo.assignee,
        createdAt: newTodo.created_at,
        updatedAt: newTodo.updated_at
      };
      
      setCards(prev => [...prev, newCard]);

      setNewCardTitle("");
      setActiveColumn(null);
      
      toast({
        title: "Sucesso",
        description: "Tarefa criada com sucesso!",
      });
      
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast({
        title: "Erro",
        description: "Falha ao criar tarefa. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [newCardTitle, columns, toast]);
  
  const editCard = (taskId: number) => {
    const task = cards.find(card => card.id === taskId)
    if (task) {
      setSelectedTask(task)
      setShowTaskDetail(true)
    }
  };
  const deleteCard = async (cardId: number) => {
    try {
      const response = await deduplicatedFetch(`/api/tasks/${cardId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setCards(cards.filter(card => card.id !== cardId));
        
        toast({
          title: t("Task deleted successfully"),
        });
        
        // Notificar sobre a remoção da task
        notifyTaskDeleted(cardId);
      } else {
        toast({
          variant: "destructive",
          title: t("Failed to delete task"),
          description: t("Please try again"),
        });
        setShouldRefetch(prev => prev + 1);
      }
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      toast({
        variant: "destructive",
        title: t("Failed to delete task"),
        description: t("Please try again"),
      });
      setShouldRefetch(prev => prev + 1);
    }
  };
  
  const handleDragStart = (event: DragEndEvent) => {
    const { active } = event;
    setActiveCardId(Number(active.id));
    
    // Usar o novo handler se disponível
    if (dragDropHandlerRef.current) {
      dragDropHandlerRef.current.handleDragStart?.(event, (task) => {
        setActiveCardId(task?.id || null);
      });
    }
  };
  
  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setHighlightedColumn(null);
      return;
    }
    
    // Usar o novo handler se disponível
    if (dragDropHandlerRef.current) {
      dragDropHandlerRef.current.handleDragOver?.(event, (column) => {
        setHighlightedColumn(column);
      });
    }
    
    if (over.data?.current?.type === 'column') {
      const newColumn = over.data.current.column;
      setHighlightedColumn(newColumn);
    }
    else if (over.data?.current?.type === 'card') {
      const overCard = cards.find(card => card.id === over.id);
      if (overCard) {
        setHighlightedColumn(overCard.column);
      }
    }
  };
  
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCardId(null);
    setActiveColumn(null);
    setHighlightedColumn(null);
    
    // Usar o novo handler se disponível
    if (dragDropHandlerRef.current) {
      try {
        await dragDropHandlerRef.current.handleDragEnd(event, kanbanState, setKanbanState);
      } catch (error) {
        console.error('Sync error:', error);
        toast({
          variant: "destructive",
          title: t("Sync Error"),
          description: error instanceof Error ? error.message : "Erro desconhecido"
        });
      }
      return;
    }
    
    // Fallback para a implementação local existente
    const { active, over } = event;
    
    if (!over || !active) return;
    
    const activeId = Number(active.id);
    const overId = over.id as string;
    
    // Se o item foi solto na mesma posição, não fazer nada
    if (active.id === over.id) return;
    
    // Encontrar o card que está sendo movido
    const activeCard = cards.find(card => card.id === activeId);
    if (!activeCard) return;
    
    // Determinar a nova coluna
    let newColumnId: string;
    if (overId.startsWith('column-')) {
      newColumnId = overId.replace('column-', '');
    } else {
      // Se foi solto em outro card, usar a coluna desse card
      const overCard = cards.find(card => card.id === Number(overId));
      if (!overCard) return;
      newColumnId = overCard.column;
    }
    
    // Se a coluna não mudou, não fazer nada
    if (activeCard.column === newColumnId) return;
    
    // Verificar se a coluna de destino existe
    const targetColumn = columns.find(col => col.id === newColumnId);
    if (!targetColumn) return;
    
    try {
      // Atualizar localmente primeiro (optimistic update)
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === activeId 
            ? { ...card, column: newColumnId as KanbanColumnId, completed: newColumnId === 'completed' }
            : card
        )
      );
      
      // Atualizar no servidor
      await updateColumnOnServer(activeId, newColumnId as KanbanColumnId, newColumnId === 'completed');
      
      // Exibir toast de sucesso
      toast({
        title: t("Task moved successfully"),
        description: `${activeCard.title} ${t("moved to")} ${targetColumn.title}`,
      });
      
    } catch (error) {
      // Reverter mudança local em caso de erro
      setCards(prevCards => 
        prevCards.map(card => 
          card.id === activeId 
            ? { ...card, column: activeCard.column, completed: activeCard.completed }
            : card
        )
      );
      
      toast({
        variant: "destructive",
        title: t("Failed to move task"),
        description: t("Please try again"),
      });
    }
  };
  
  // Loading state que inclui colunas e cards
  const isFullyLoaded = !isLoading && !columnsLoading && columns.length > 0;
  
  const getColumnTitle = (columnId: string): string => {
    const column = columns.find(col => col.id === columnId);
    return column ? column.title : columnId;
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
  
  if (!isFullyLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Carregando colunas e tarefas...</span>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-4 px-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">{t("kanban")}</h2>
          
          {/* Indicadores de status */}
          <div className="flex items-center gap-2">
            {/* Status de conectividade */}
            <div className="flex items-center gap-1 text-sm">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? t('Online') : t('Offline')}
              </span>
            </div>
            
            {/* Status de sincronização */}
            {syncStatus && (
              <div className="flex items-center gap-1 text-sm">
                {syncStatus === 'syncing' && (
                  <>
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-xs text-blue-600">{t('Syncing')}</span>
                  </>
                )}
                {syncStatus === 'error' && (
                  <>
                    <div className="h-2 w-2 bg-red-500 rounded-full" />
                    <span className="text-xs text-red-600">{t('Sync Error')}</span>
                  </>
                )}
                {syncStatus === 'idle' && (
                  <>
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-green-600">{t('Synced')}</span>
                  </>
                )}
              </div>
            )}
            
            {/* Indicador de operações pendentes */}
            {offlineQueueSize > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-xs text-orange-600">
                  {offlineQueueSize} {t('pending')}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            // Evitar atualização se já estiver carregando
            if (isLoading) return;
            
            // Forçar atualização das tarefas
            setIsLoading(true);
            
            // Primeiro vamos buscar as tarefas
            fetchAndDistributeTasks()
              .then(() => {
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
        <div className="flex gap-4 h-full overflow-x-auto p-4 pb-8">
          {columns.map((column) => {
            const columnCards = cards.filter(card => card.column === column.id);
            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                <DroppableColumn 
                  title={column.title} 
                  columnKey={column.id} 
                  items={columnCards}
                  activeColumn={activeColumn}
                  setActiveColumn={setActiveColumn}
                  newCardTitle={newCardTitle}
                  setNewCardTitle={setNewCardTitle}
                  createNewCard={createNewCard}
                  onDeleteCard={deleteCard}
                  onEditCard={editCard}
                  language={language}
                  highlightedColumn={highlightedColumn}
                  column={column}
                  showActions={!column.is_default}
                />
              </div>
            );
          })}
          
          {/* Botão para adicionar nova coluna */}
          <div className="flex-shrink-0">
            <AddColumnButton/>
          </div>
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
          onDeleted={(id) => {
            setCards(prev => prev.filter(card => card.id !== id));
            setShowTaskDetail(false);
            setSelectedTask(null);
          }}
          user={user}
        />
      )}
    </>
  );
}