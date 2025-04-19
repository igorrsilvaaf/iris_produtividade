// @ts-nocheck
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor, closestCorners } from "@dnd-kit/core"
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

// Definir o tipo para a função de tradução para evitar problemas de tipo
type TranslationFunction = (key: string) => string;

type KanbanColumn = "backlog" | "planning" | "inProgress" | "validation" | "completed"

type KanbanCard = Todo & {
  column: KanbanColumn
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
  
  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="mb-2 cursor-move shadow-sm hover:shadow-md transition-shadow bg-card" 
      data-card-id={card.id} 
      data-type="card" 
      data-column={card.column}
      {...attributes} 
      {...listeners}
    >
      <CardContent className="p-3 pb-0">
        <div className="font-medium mb-1">{card.title}</div>
        {card.description && (
          <div className="text-sm text-muted-foreground mb-2">
            {card.description.length > 50 
              ? `${card.description.substring(0, 50)}...`
              : card.description}
          </div>
        )}
        {card.due_date && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(card.due_date), 'PPP', { locale: localeObj })}
          </div>
        )}
        {card.project_name && (
          <Badge 
            variant="outline" 
            className="text-xs mb-2" 
            style={{ borderColor: card.project_color || '#888', color: card.project_color || '#888' }}
          >
            {card.project_name}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-2 pt-1 flex justify-end">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => {
          e.stopPropagation();
          onEdit(card.id);
        }}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => {
          e.stopPropagation();
          onDelete(card.id);
        }}>
          <Trash2 className="h-4 w-4" />
        </Button>
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
}) => {
  const { t } = useTranslation();
  
  // Configuração para tornar a coluna um alvo para soltar
  const { setNodeRef } = useSortable({
    id: `column-${columnKey}`,
    data: {
      type: 'column',
      column: columnKey
    }
  });
  
  // Mensagem quando não há tarefas
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
    <div className="rounded-lg bg-muted/20 shadow-sm mb-4 w-full min-w-[280px]" ref={setNodeRef} data-type="column" data-column={columnKey}>
      <Card className="h-full">
        <CardHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            <Badge variant="outline" className="ml-2">
              {items.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <ScrollArea className="h-[calc(100vh-260px)] pr-2">
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
                placeholder={t("addCard")}
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
                <Button 
                  size="sm" 
                  onClick={() => createNewCard(columnKey)}
                  disabled={!newCardTitle.trim()}
                >
                  {t("addCard")}
                </Button>
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
            <Button
              variant="outline"
              className="w-full mt-3 border-dashed"
              onClick={() => setActiveColumn(columnKey)}
            >
              <Plus className="h-4 w-4 mr-1" /> {t("addCard")}
            </Button>
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
  
  const activeCard = activeCardId ? cards.find(card => card.id === activeCardId) : null;
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
  
  // Função para obter todas as tarefas existentes e distribuí-las nas colunas apropriadas
  const fetchAndDistributeTasks = useCallback(async (signal?: AbortSignal) => {
    const now = Date.now();
    const cacheTime = 1000; // 1 segundo
    
    if (now - lastFetchTimeRef.current < cacheTime) {
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Buscando tarefas para Kanban...");
      
      // Buscar todas as tarefas
      const tasksResponse = await fetch("/api/tasks", {
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
        return;
      }
      
      // Buscar tarefas de hoje
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
      
      // Buscar tarefas próximas (IMPORTANTE para a coluna backlog)
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
      
      // Continuar com a tarefa principal
      const tasksData = await tasksResponse.json();
      
      if (!tasksData.tasks || !Array.isArray(tasksData.tasks)) {
        console.error("Formato de resposta inválido para todas as tarefas:", tasksData);
        setIsLoading(false);
        return;
      }
      
      // Garantir que temos arrays de tarefas válidos
      const allTasks = tasksData.tasks as Todo[];
      const todayList = Array.isArray(todayData.tasks) ? todayData.tasks : [];
      const upcomingList = Array.isArray(upcomingData.tasks) ? upcomingData.tasks : [];
      
      console.log(`Total de tarefas: ${allTasks.length}, Hoje: ${todayList.length}, Próximas: ${upcomingList.length}`);
      
      // Log para verificar IDs das tarefas próximas
      if (upcomingList.length > 0) {
        console.log("Tarefas em Próximos:");
        upcomingList.forEach((task: any) => {
          console.log(`- ID ${task.id}, Título: "${task.title}"`);
        });
      } else {
        console.log("Nenhuma tarefa na lista de Próximos");
      }
      
      // Converter para KanbanCards
      const kanbanCards: KanbanCard[] = allTasks.map((task: Todo) => {
        let column: KanbanColumn;
        
        // Se a tarefa já tem uma coluna definida no kanban, manter
        if (task.kanban_column && 
            ["backlog", "planning", "inProgress", "validation", "completed"].includes(task.kanban_column)) {
          column = task.kanban_column as KanbanColumn;
          console.log(`Tarefa ID ${task.id} mantém coluna definida: ${column}`);
        } 
        // Se não tem definição de coluna, distribui baseado no status da tarefa
        else {
          // Tarefas concluídas vão para a coluna "completed"
          if (task.completed) {
            column = "completed";
            console.log(`Tarefa concluída ID ${task.id} => coluna: completed`);
          } 
          // Tarefas de hoje vão para "planning"
          else if (todayList.some((t: any) => t.id === task.id)) {
            column = "planning";
            console.log(`Tarefa de hoje ID ${task.id} => coluna: planning`);
          } 
          // Tarefas próximas vão para "backlog"
          // Verificar explicitamente se a tarefa está na lista de próximos
          else if (upcomingList.some((t: any) => t.id === task.id)) {
            column = "backlog";
            console.log(`Tarefa em Próximos ID ${task.id} => coluna: backlog`);
          }
          // Qualquer outra tarefa não categorizada vai para backlog
          else {
            column = "backlog";
            console.log(`Tarefa não categorizada ID ${task.id} => coluna: backlog`);
            
            // Atualizar a tarefa no servidor para definir a coluna como backlog
            // para garantir que ela apareça corretamente na próxima vez
            try {
              (async () => {
                await fetch(`/api/tasks/${task.id}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    kanban_column: "backlog",
                    completed: false,
                  }),
                });
                console.log(`Tarefa ID ${task.id} atualizada no servidor como backlog`);
              })();
            } catch (error) {
              console.error(`Erro ao atualizar tarefa ID ${task.id}:`, error);
            }
          }
        }
        
        // Log para depuração da distribuição
        console.log(`Tarefa ID ${task.id}: "${task.title}" => coluna: ${column}`);
        
        return {
          ...task,
          column
        };
      });
      
      console.log("Tarefas distribuídas para o Kanban:", kanbanCards.length);
      
      setCards(kanbanCards);
      
      // Log resumido da distribuição final
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
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Erro ao buscar tarefas:", error);
        toast({
          variant: "destructive",
          title: t("Failed to load tasks"),
          description: t("Please refresh the page to try again"),
        });
      }
    } finally {
      lastFetchTimeRef.current = now;
      setIsLoading(false);
    }
  }, [toast, t]);
  
  // Carregar tarefas quando o componente é montado
  useEffect(() => {
    const controller = new AbortController();
    fetchAndDistributeTasks(controller.signal);
    
    // Configurar atualização periódica das tarefas para manter sincronizado com outras páginas
    const intervalId = setInterval(() => {
      console.log("Atualizando tarefas do Kanban automaticamente...");
      fetchAndDistributeTasks();
    }, 30000); // Atualizar a cada 30 segundos
    
    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, [fetchAndDistributeTasks, shouldRefetch]);
  
  // Atualizar a coluna de uma tarefa no servidor
  const updateTaskColumn = async (taskId: number, column: KanbanColumn): Promise<void> => {
    try {
      // Verifica se a coluna está mudando para "completed" e atualiza o status completed
      const completed = column === "completed";
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kanban_column: column,
          completed: completed,
        }),
      });
      
      if (!response.ok) {
        toast({
          variant: "destructive",
          title: t("Failed to update task"),
          description: t("Please try again"),
        });
        // Recarregar tarefas se houver falha
        setShouldRefetch(prev => prev + 1);
        throw new Error(`Failed to update task: ${response.status}`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to update task"),
        description: t("Please try again"),
      });
      // Recarregar tarefas se houver falha
      setShouldRefetch(prev => prev + 1);
      throw error;
    }
  };
  
  // Criar nova tarefa
  const createNewCard = async (column: KanbanColumn) => {
    if (!newCardTitle.trim()) return;
    
    try {
      console.log(`Criando nova tarefa no Kanban, coluna: ${column}`);
      setIsLoading(true);
      
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newCardTitle,
          description: "",
          kanban_column: column,
          completed: column === "completed",
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Tarefa criada com sucesso: ID ${data.task.id}, coluna: ${column}`);
        
        // Forçar sincronização com servidor para garantir que a tarefa seja salva com a coluna correta
        try {
          await fetch(`/api/tasks/${data.task.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              kanban_column: column,
              completed: column === "completed",
            }),
          });
          console.log(`Coluna da tarefa ${data.task.id} definida como ${column}`);
        } catch (error) {
          console.error("Erro ao definir coluna da tarefa:", error);
        }
        
        // Atualizar a lista de tarefas completa para garantir sincronização
        fetchAndDistributeTasks();
        
        setNewCardTitle("");
        setActiveColumn(null);
        
        toast({
          title: t("taskCreated"),
          description: newCardTitle,
        });
      } else {
        toast({
          variant: "destructive",
          title: t("Failed to create task"),
          description: t("Please try again"),
        });
        // Recarregar se houver erro
        setShouldRefetch(prev => prev + 1);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to create task"),
        description: t("Please try again"),
      });
      // Recarregar se houver erro
      setShouldRefetch(prev => prev + 1);
    }
  };
  
  // Editar tarefa
  const editCard = (taskId: number) => {
    // Redirecionar para a página de edição da tarefa
    window.location.href = `/tasks/${taskId}`;
  };
  
  // Excluir tarefa
  const deleteCard = async (cardId: number) => {
    try {
      const response = await fetch(`/api/tasks/${cardId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        // Remover o cartão do estado
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
        // Recarregar se houver erro
        setShouldRefetch(prev => prev + 1);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to delete task"),
        description: t("Please try again"),
      });
      // Recarregar se houver erro
      setShouldRefetch(prev => prev + 1);
    }
  };
  
  const handleDragStart = (event: any) => {
    const { active } = event;
    setActiveCardId(active.id);
  };
  
  const handleDragOver = (event: any) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeCard = cards.find(card => card.id === active.id);
    
    // Verificar se o over é um elemento de coluna
    if (over.data?.current?.type === 'column') {
      const newColumn = over.data.current.column as KanbanColumn;
      
      if (activeCard && activeCard.column !== newColumn) {
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
  };
  
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveCardId(null);
    setActiveColumn(null);
    
    if (!over) return;
    
    const activeCardData = cards.find(card => card.id === active.id);
    
    if (!activeCardData) return;
    
    // Se estamos largando sobre uma coluna
    if (over.data?.current?.type === 'column') {
      const newColumn = over.data.current.column as KanbanColumn;
      
      if (activeCardData.column !== newColumn) {
        console.log(`Movendo tarefa ID ${active.id} para coluna ${newColumn}`);
        
        // Atualizar estado
        setCards(cards.map(card => {
          if (card.id === active.id) {
            return {
              ...card,
              column: newColumn,
              completed: newColumn === "completed"
            };
          }
          return card;
        }));
        
        // Atualizar no servidor
        updateTaskColumn(active.id, newColumn)
          .then(() => {
            console.log(`Tarefa ID ${active.id} movida com sucesso para ${newColumn}`);
            
            // Notificar usuário
            toast({
              title: t("Task moved"),
              description: t(`Task moved to ${newColumn}`),
            });
          })
          .catch(error => {
            console.error(`Erro ao mover tarefa ID ${active.id}:`, error);
          });
      }
    } 
    // Se estamos largando sobre outro cartão
    else if (over.data?.current?.type === 'card') {
      const overCard = cards.find(card => card.id === over.id);
      
      if (overCard && activeCardData.column !== overCard.column) {
        const newColumn = overCard.column;
        
        // Atualizar estado
        setCards(cards.map(card => {
          if (card.id === active.id) {
            return {
              ...card,
              column: newColumn,
              completed: newColumn === "completed"
            };
          }
          return card;
        }));
        
        // Atualizar no servidor
        updateTaskColumn(active.id, newColumn);
      }
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
            // Forçar atualização das tarefas
            setShouldRefetch(prev => prev + 1);
            toast({
              title: t("Updating tasks"),
              description: t("Please wait...")
            });
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
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 p-4 w-full mx-auto pb-8 overflow-x-auto">
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
          />
        </div>
        
        <DragOverlay>
          {activeCardId && activeCard ? (
            <Card className="w-68 mb-2 shadow-lg">
              <CardContent className="p-3">
                <div className="font-medium">{activeCard.title}</div>
                {activeCard.description && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {activeCard.description.length > 50 
                      ? `${activeCard.description.substring(0, 50)}...`
                      : activeCard.description}
                  </div>
                )}
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
    </>
  );
}