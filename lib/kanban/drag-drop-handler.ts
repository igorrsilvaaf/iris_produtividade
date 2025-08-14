import { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core'
import { KanbanState, KanbanTask, MoveOperation, KanbanColumnId } from '../types/kanban'
import { KanbanValidations } from './validations'
import { KanbanSyncManager } from './sync-manager'
import { toast } from 'sonner'

export class KanbanDragDropHandler {
  private syncManager: KanbanSyncManager

  constructor(syncManager: KanbanSyncManager) {
    this.syncManager = syncManager
  }

  // Método principal para lidar com o fim do drag
  async handleDragEnd(
    event: DragEndEvent,
    currentState: KanbanState,
    updateState: (newState: KanbanState) => void
  ): Promise<void> {
    const { active, over } = event

    if (!over || !active) {
      return
    }

    const taskId = Number(active.id)
    const task = currentState.tasks[taskId]
    
    if (!task) {
      console.error(`Tarefa ${taskId} não encontrada`)
      return
    } 

    // Determinar coluna de destino
    const targetColumnId = this.getTargetColumn(over.id as string)
    const sourceColumnId = task.kanban_column
    
    // Se não houve mudança de posição, não fazer nada
    if (targetColumnId === sourceColumnId && !this.hasPositionChanged(event, currentState)) {
      return
    }

    // Calcular nova posição
    const newPosition = this.calculateNewPosition(event, currentState, targetColumnId)
    
    // Criar operação de movimento
    const moveOperation: MoveOperation = {
      taskId: taskId,
      fromColumn: sourceColumnId,
      toColumn: targetColumnId,
      position: newPosition
    }

    // Validar movimento
    const validation = KanbanValidations.validateMove(moveOperation, currentState)
    if (!validation.isValid) {
      toast.error('Movimento inválido', {
        description: validation.errors.join(', ')
      })
      return
    }

    // Aplicar mudança otimista no estado local
    const newState = this.applyOptimisticUpdate(currentState, moveOperation)
    updateState(newState)

    // Enviar para sincronização
    try {
      await this.syncManager.queueOperation({
        type: 'MOVE_TASK',
        taskId,
        payload: {
          kanban_column: targetColumnId,
          kanban_order: newPosition
        }
      })

      toast.success('Tarefa movida com sucesso')
    } catch (error) {
      // Reverter mudança otimista em caso de erro
      updateState(currentState)
      toast.error('Erro ao mover tarefa', {
        description: 'A alteração foi revertida'
      })
      console.error('Erro na sincronização:', error)
    }
  }

  // Determinar coluna de destino baseada no ID do drop target
  private getTargetColumn(overId: string): KanbanColumnId {
    // Se foi dropado diretamente em uma coluna
    if (['backlog', 'planning', 'inProgress', 'validation', 'completed'].includes(overId)) {
      return overId as KanbanColumnId
    }

    // Se foi dropado em uma tarefa, usar a coluna da tarefa
    const match = overId.match(/^(\w+)-/)
    if (match) {
      return match[1] as KanbanColumnId
    }

    // Fallback: tentar extrair da estrutura do ID
    return (overId.split('-')[0] || 'backlog') as KanbanColumnId
  }

  // Verificar se houve mudança de posição dentro da mesma coluna
  private hasPositionChanged(event: DragEndEvent, state: KanbanState): boolean {
    const { active, over } = event
    const taskId = active.id as string
    const task = state.tasks[Number(taskId)]
    
    if (!task || !over) return false

    const currentPosition = task.kanban_order
    const newPosition = this.calculateNewPosition(event, state, task.kanban_column)
    
    return currentPosition !== newPosition
  }

  // Calcular nova posição da tarefa na coluna
  private calculateNewPosition(event: DragEndEvent, state: KanbanState, targetColumn: string): number {
    const { over } = event
    
    if (!over) return 0

    const overId = over.id as string
    
    // Se foi dropado diretamente na coluna, colocar no final
    if (overId === targetColumn) {
      const columnTasks = state.columns[targetColumn]?.taskIds || []
      return columnTasks.length
    }

    // Se foi dropado em uma tarefa, calcular posição relativa
    const targetTask = state.tasks[Number(overId)]
    if (targetTask && targetTask.kanban_column === targetColumn) {
      return targetTask.kanban_order
    }

    // Fallback: colocar no final
    const columnTasks = state.columns[targetColumn]?.taskIds || []
    return columnTasks.length
  }

  // Aplicar mudança otimista no estado local
  private applyOptimisticUpdate(state: KanbanState, operation: MoveOperation): KanbanState {
    const { taskId, fromColumn, toColumn, position } = operation
    const task = state.tasks[taskId]
    
    if (!task) return state

    // Criar novo estado
    const newState: KanbanState = {
      tasks: { ...state.tasks },
      columns: { ...state.columns },
      columnOrder: state.columnOrder
    }

    // Atualizar tarefa
    newState.tasks[taskId] = {
      ...task,
      kanban_column: toColumn,
      kanban_order: position,
      updated_at: new Date().toISOString()
    }

    // Remover da coluna de origem
    if (fromColumn !== toColumn) {
      newState.columns[fromColumn] = {
        ...state.columns[fromColumn],
        taskIds: state.columns[fromColumn].taskIds.filter(id => id !== taskId)
      }
      
      // Reordenar tarefas restantes na coluna de origem
      this.reorderColumnTasks(newState, fromColumn)
    }

    // Adicionar à coluna de destino
    const targetColumnTasks = [...(state.columns[toColumn]?.taskIds || [])]
    
    // Se mudou de coluna, adicionar à nova posição
    if (fromColumn !== toColumn) {
      targetColumnTasks.splice(position, 0, taskId)
    } else {
      // Se é a mesma coluna, remover da posição atual e inserir na nova
      const currentIndex = targetColumnTasks.indexOf(taskId)
      if (currentIndex !== -1) {
        targetColumnTasks.splice(currentIndex, 1)
      }
      targetColumnTasks.splice(position, 0, taskId)
    }

    newState.columns[toColumn] = {
      ...state.columns[toColumn],
      taskIds: targetColumnTasks
    }

    // Reordenar tarefas na coluna de destino
    this.reorderColumnTasks(newState, toColumn)

    return newState
  }

  // Reordenar tarefas em uma coluna para manter consistência
  private reorderColumnTasks(state: KanbanState, columnId: string) {
    const column = state.columns[columnId]
    if (!column) return

    column.taskIds.forEach((taskId, index) => {
      if (state.tasks[taskId]) {
        state.tasks[taskId] = {
          ...state.tasks[taskId],
          kanban_order: index
        }
      }
    })
  }

  // Método para lidar com drag start (opcional, para feedback visual)
  handleDragStart(event: DragStartEvent, updateActiveTask: (task: KanbanTask | null) => void) {
    const taskId = event.active.id as string
    // Aqui você pode definir qual tarefa está sendo arrastada para feedback visual
    updateActiveTask(null) // Simplificado para evitar erro de tipo
  }

  // Método para lidar com drag over (opcional, para feedback visual)
  handleDragOver(event: DragOverEvent, updateOverColumn: (column: KanbanColumnId | null) => void) {
    const overId = event.over?.id as string
    if (overId) {
      const targetColumn = this.getTargetColumn(overId)
      updateOverColumn(targetColumn)
    } else {
      updateOverColumn(null)
    }
  }

  // Método para cancelar drag (limpar estados visuais)
  handleDragCancel(updateActiveTask: (task: KanbanTask | null) => void, updateOverColumn: (column: KanbanColumnId | null) => void) {
    updateActiveTask(null)
    updateOverColumn(null)
  }
}