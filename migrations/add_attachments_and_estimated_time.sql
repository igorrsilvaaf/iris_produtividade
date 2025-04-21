-- Adiciona coluna para armazenar anexos (URLs de arquivos ou imagens)
ALTER TABLE todos ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';

-- Adiciona coluna para armazenar tempo estimado (em minutos)
ALTER TABLE todos ADD COLUMN IF NOT EXISTS estimated_time INTEGER;

-- Cria um índice para otimizar consultas por tempo estimado
CREATE INDEX IF NOT EXISTS idx_todos_estimated_time ON todos(estimated_time);

-- Adiciona comentários às colunas para documentação
COMMENT ON COLUMN todos.attachments IS 'Anexos da tarefa (arquivos, imagens, links)';
COMMENT ON COLUMN todos.estimated_time IS 'Tempo estimado para conclusão da tarefa (em minutos)'; 