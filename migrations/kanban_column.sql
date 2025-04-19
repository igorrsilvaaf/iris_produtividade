-- Adiciona uma nova coluna 'kanban_column' à tabela 'todos'
ALTER TABLE todos ADD COLUMN IF NOT EXISTS kanban_column VARCHAR(20);

-- Atualiza as tarefas existentes para usar 'backlog' como coluna padrão se não estiverem concluídas
-- e 'completed' se estiverem concluídas
UPDATE todos
SET kanban_column = 
  CASE 
    WHEN completed = true THEN 'completed'
    ELSE 'backlog'
  END
WHERE kanban_column IS NULL;

-- Cria um índice para otimizar consultas por kanban_column
CREATE INDEX IF NOT EXISTS idx_todos_kanban_column ON todos(kanban_column);

-- Adiciona um comentário à coluna para documentação
COMMENT ON COLUMN todos.kanban_column IS 'Coluna do quadro Kanban (backlog, planning, inProgress, validation, completed)'; 