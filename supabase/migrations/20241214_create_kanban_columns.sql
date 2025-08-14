-- Criar tabela kanban_columns para suportar colunas dinâmicas no Kanban
CREATE TABLE kanban_columns (
  id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  color VARCHAR(7), -- Hex color code
  "order" INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índices para otimizar consultas
CREATE INDEX idx_kanban_columns_user_id ON kanban_columns(user_id);
CREATE INDEX idx_kanban_columns_order ON kanban_columns(user_id, "order");
CREATE UNIQUE INDEX idx_kanban_columns_user_title ON kanban_columns(user_id, title);

-- Inserir colunas padrão para todos os usuários existentes
INSERT INTO kanban_columns (id, user_id, title, "order", is_default)
SELECT 
  'col_backlog_' || u.id,
  u.id,
  'BACKLOG',
  0,
  true
FROM users u;

INSERT INTO kanban_columns (id, user_id, title, "order", is_default)
SELECT 
  'col_planning_' || u.id,
  u.id,
  'PLANNING',
  1,
  true
FROM users u;

INSERT INTO kanban_columns (id, user_id, title, "order", is_default)
SELECT 
  'col_inprogress_' || u.id,
  u.id,
  'IN PROGRESS',
  2,
  true
FROM users u;

INSERT INTO kanban_columns (id, user_id, title, "order", is_default)
SELECT 
  'col_completed_' || u.id,
  u.id,
  'COMPLETED',
  3,
  true
FROM users u;

-- Atualizar todos os todos existentes para usar as novas colunas
UPDATE todos SET kanban_column = 'BACKLOG' WHERE kanban_column = 'todo';
UPDATE todos SET kanban_column = 'IN PROGRESS' WHERE kanban_column = 'doing';
UPDATE todos SET kanban_column = 'COMPLETED' WHERE kanban_column = 'done';

-- Habilitar RLS (Row Level Security)
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can view their own kanban columns" ON kanban_columns
  FOR SELECT USING (auth.uid()::integer = user_id);

CREATE POLICY "Users can insert their own kanban columns" ON kanban_columns
  FOR INSERT WITH CHECK (auth.uid()::integer = user_id);

CREATE POLICY "Users can update their own kanban columns" ON kanban_columns
  FOR UPDATE USING (auth.uid()::integer = user_id);

CREATE POLICY "Users can delete their own kanban columns" ON kanban_columns
  FOR DELETE USING (auth.uid()::integer = user_id AND is_default = false);

-- Conceder permissões para roles anon e authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON kanban_columns TO authenticated;
GRANT SELECT ON kanban_columns TO anon;