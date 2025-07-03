-- Migração para implementar subcomentários
-- Execute estes comandos no seu banco de dados PostgreSQL

-- 1. Adicionar campo parent_id para suportar subcomentários
ALTER TABLE task_comments 
ADD COLUMN parent_id INTEGER REFERENCES task_comments(id) ON DELETE CASCADE;

-- 2. Criar índice para otimizar consultas de subcomentários
CREATE INDEX idx_task_comments_parent_id ON task_comments(parent_id);

-- 3. Comentário explicativo sobre a estrutura
-- parent_id = NULL: comentário principal
-- parent_id = ID: resposta ao comentário com esse ID 