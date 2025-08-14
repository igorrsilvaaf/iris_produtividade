import { KanbanTask, KanbanState, ValidationResult, MoveOperation } from '../types/kanban'

// Validações de integridade para operações do Kanban
export class KanbanValidations {
  
  // Validar movimento de tarefa
  static validateMove(operation: MoveOperation, currentState: KanbanState): ValidationResult {
    const { taskId, fromColumn, toColumn, position } = operation
    
    // Verificar se a tarefa existe
    const task = currentState.tasks[taskId]
    if (!task) {
      return {
        isValid: false,
        errors: [`Tarefa ${taskId} não encontrada`]
      }
    }

    // Verificar se a coluna de origem está correta
    if (task.kanban_column !== fromColumn) {
      return {
        isValid: false,
        errors: [`Tarefa ${taskId} não está na coluna ${fromColumn}`]
      }
    }

    // Verificar se as colunas são válidas
    const validColumns = ['backlog', 'planning', 'inProgress', 'validation', 'completed']
    if (!validColumns.includes(fromColumn) || !validColumns.includes(toColumn)) {
      return {
        isValid: false,
        errors: ['Coluna inválida especificada']
      }
    }

    // Verificar regras de negócio para movimentos
    const businessRuleValidation = this.validateBusinessRules(task, fromColumn, toColumn)
    if (!businessRuleValidation.isValid) {
      return businessRuleValidation
    }

    // Verificar se a posição é válida
    const targetColumnTasks = Object.values(currentState.tasks)
      .filter(t => t.kanban_column === toColumn && t.id !== taskId)
    
    if (position < 0 || position > targetColumnTasks.length) {
      return {
        isValid: false,
        errors: [`Posição ${position} inválida para coluna ${toColumn}`]
      }
    }

    return { isValid: true, errors: [] }
  }

  // Validar regras de negócio para movimentos
  private static validateBusinessRules(task: KanbanTask, fromColumn: string, toColumn: string): ValidationResult {
    const errors: string[] = []

    // Regra: Tarefas sem título não podem sair do backlog
    if (fromColumn === 'backlog' && toColumn !== 'backlog' && !task.title?.trim()) {
      errors.push('Tarefas sem título não podem sair do backlog')
    }

    // Regra: Tarefas sem descrição não podem ir para inProgress
    if (toColumn === 'inProgress' && !task.description?.trim()) {
      errors.push('Tarefas sem descrição não podem ir para Em Progresso')
    }

    // Regra: Tarefas não podem pular etapas críticas
    const columnOrder = ['backlog', 'planning', 'inProgress', 'validation', 'completed']
    const fromIndex = columnOrder.indexOf(fromColumn)
    const toIndex = columnOrder.indexOf(toColumn)
    
    // Permitir movimento para trás ou para próxima etapa
    if (toIndex > fromIndex + 1) {
      errors.push('Não é possível pular etapas do processo')
    }

    // Regra: Tarefas com prioridade alta não podem ficar muito tempo em uma coluna
    if (task.priority === 'high' && this.isTaskStale(task)) {
      errors.push('Tarefa de alta prioridade está há muito tempo na mesma etapa')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Verificar se tarefa está há muito tempo na mesma posição
  private static isTaskStale(task: KanbanTask): boolean {
    if (!task.updated_at) return false
    
    const daysSinceUpdate = (Date.now() - new Date(task.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceUpdate > 3 // Mais de 3 dias
  }

  // Validar estado completo do Kanban
  static validateKanbanState(state: KanbanState): ValidationResult {
    const errors: string[] = []

    // Verificar se todas as colunas existem
    const requiredColumns = ['backlog', 'planning', 'inProgress', 'validation', 'completed']
    for (const column of requiredColumns) {
      if (!state.columns[column]) {
        errors.push(`Coluna ${column} não encontrada`)
      }
    }

    // Verificar consistência das tarefas
    for (const [taskId, task] of Object.entries(state.tasks)) {
      // Verificar se a tarefa tem ID válido
      if (task.id.toString() !== taskId) {
        errors.push(`Inconsistência no ID da tarefa ${taskId}`)
      }

      // Verificar se a coluna da tarefa existe
      if (!state.columns[task.kanban_column]) {
        errors.push(`Tarefa ${taskId} está em coluna inexistente: ${task.kanban_column}`)
      }

      // Verificar se a tarefa está na lista da coluna
      const columnTasks = state.columns[task.kanban_column]?.taskIds || []
      if (!columnTasks.includes(Number(taskId))) {
        errors.push(`Tarefa ${taskId} não está na lista da coluna ${task.kanban_column}`)
      }
    }

    // Verificar se todas as tarefas das colunas existem
    for (const [columnId, column] of Object.entries(state.columns)) {
      for (const taskId of column.taskIds) {
        if (!state.tasks[taskId]) {
          errors.push(`Tarefa ${taskId} referenciada na coluna ${columnId} não existe`)
        }
      }
    }

    // Verificar ordem das tarefas
    for (const [columnId, column] of Object.entries(state.columns)) {
      const tasks = column.taskIds.map(id => state.tasks[id]).filter(Boolean)
      
      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].kanban_order !== i) {
          errors.push(`Ordem incorreta da tarefa ${tasks[i].id} na coluna ${columnId}`)
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar dados de tarefa
  static validateTask(task: Partial<KanbanTask>): ValidationResult {
    const errors: string[] = []

    // Campos obrigatórios
    if (!task.title?.trim()) {
      errors.push('Título é obrigatório')
    }

    if (task.title && task.title.length > 200) {
      errors.push('Título não pode ter mais de 200 caracteres')
    }

    if (task.description && task.description.length > 2000) {
      errors.push('Descrição não pode ter mais de 2000 caracteres')
    }

    // Validar prioridade
    if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
      errors.push('Prioridade deve ser low, medium ou high')
    }

    // Validar coluna
    if (task.kanban_column && !['backlog', 'planning', 'inProgress', 'validation', 'completed'].includes(task.kanban_column)) {
      errors.push('Coluna do Kanban inválida')
    }

    // Validar ordem
    if (task.kanban_order !== undefined && task.kanban_order < 0) {
      errors.push('Ordem do Kanban deve ser maior ou igual a 0')
    }

    // Validar datas
    if (task.due_date) {
      const dueDate = new Date(task.due_date)
      if (isNaN(dueDate.getTime())) {
        errors.push('Data de vencimento inválida')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar operação de criação
  static validateCreate(taskData: Partial<KanbanTask>): ValidationResult {
    const baseValidation = this.validateTask(taskData)
    
    if (!baseValidation.isValid) {
      return baseValidation
    }

    // Validações específicas para criação
    const errors: string[] = []

    // Novas tarefas devem começar no backlog
    if (taskData.kanban_column && taskData.kanban_column !== 'backlog') {
      errors.push('Novas tarefas devem ser criadas no backlog')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Validar operação de atualização
  static validateUpdate(taskId: string, updates: Partial<KanbanTask>, currentState: KanbanState): ValidationResult {
    const currentTask = currentState.tasks[Number(taskId)]
    
    if (!currentTask) {
      return {
        isValid: false,
        errors: [`Tarefa ${taskId} não encontrada`]
      }
    }

    // Criar tarefa atualizada para validação
    const updatedTask = { ...currentTask, ...updates }
    
    return this.validateTask(updatedTask)
  }
}