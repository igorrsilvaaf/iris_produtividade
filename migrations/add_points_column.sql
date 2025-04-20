-- Adiciona uma nova coluna 'points' à tabela 'todos' para pontuação de tarefas (1-5)
ALTER TABLE todos ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 3;

-- Adiciona validação para garantir que os pontos estejam entre 1 e 5
ALTER TABLE todos ADD CONSTRAINT chk_todos_points CHECK (points BETWEEN 1 AND 5);

-- Cria um índice para otimizar consultas por pontos
CREATE INDEX IF NOT EXISTS idx_todos_points ON todos(points);

-- Adiciona um comentário à coluna para documentação
COMMENT ON COLUMN todos.points IS 'Pontuação da tarefa (1-5)'; 