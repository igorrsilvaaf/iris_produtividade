-- Script para corrigir problemas nas notificações de tarefas
-- ATENÇÃO: Faça backup do banco de dados antes de executar este script

-- Fase 1: Diagnóstico

-- Verificar tarefas com usuário incorreto ou inválido
DO $$
DECLARE
    invalid_tasks INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_tasks
    FROM todos t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE u.id IS NULL;
    
    RAISE NOTICE 'Encontradas % tarefas com usuário inválido', invalid_tasks;
END $$;

-- Verificar associações incorretas entre tarefas e projetos
DO $$
DECLARE
    invalid_connections INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_connections
    FROM todo_projects tp
    JOIN todos t ON tp.todo_id = t.id
    JOIN projects p ON tp.project_id = p.id
    WHERE t.user_id != p.user_id;
    
    RAISE NOTICE 'Encontradas % associações incorretas entre tarefas e projetos', invalid_connections;
END $$;

-- Verificar associações incorretas entre tarefas e etiquetas
DO $$
DECLARE
    invalid_label_connections INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_label_connections
    FROM todo_labels tl
    JOIN todos t ON tl.todo_id = t.id
    JOIN labels l ON tl.label_id = l.id
    WHERE t.user_id != l.user_id;
    
    RAISE NOTICE 'Encontradas % associações incorretas entre tarefas e etiquetas', invalid_label_connections;
END $$;

-- Verificar duplicatas na tabela de notificações
DO $$
DECLARE
    duplicate_notifications INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_notifications
    FROM (
        SELECT user_id, COUNT(*) 
        FROM task_notifications_read 
        GROUP BY user_id 
        HAVING COUNT(*) > 1
    ) as duplicates;
    
    RAISE NOTICE 'Encontrados % usuários com notificações duplicadas', duplicate_notifications;
END $$;

-- Fase 2: Correção (descomente as seções necessárias após verificar o diagnóstico)

-- Remover relações incorretas entre tarefas e projetos
-- BEGIN;
-- DELETE FROM todo_projects
-- WHERE (todo_id, project_id) IN (
--     SELECT tp.todo_id, tp.project_id
--     FROM todo_projects tp
--     JOIN todos t ON tp.todo_id = t.id
--     JOIN projects p ON tp.project_id = p.id
--     WHERE t.user_id != p.user_id
-- );
-- COMMIT;

-- Remover relações incorretas entre tarefas e etiquetas
-- BEGIN;
-- DELETE FROM todo_labels
-- WHERE (todo_id, label_id) IN (
--     SELECT tl.todo_id, tl.label_id
--     FROM todo_labels tl
--     JOIN todos t ON tl.todo_id = t.id
--     JOIN labels l ON tl.label_id = l.id
--     WHERE t.user_id != l.user_id
-- );
-- COMMIT;

-- Limpar duplicatas na tabela de notificações
-- BEGIN;
-- WITH ranked_notifications AS (
--     SELECT 
--         id,
--         user_id,
--         ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY id DESC) as rn
--     FROM 
--         task_notifications_read
-- )
-- DELETE FROM task_notifications_read
-- WHERE id IN (
--     SELECT id FROM ranked_notifications WHERE rn > 1
-- );
-- COMMIT;

-- Criar índices necessários
-- CREATE INDEX IF NOT EXISTS todos_user_id_due_date_idx ON todos (user_id, due_date);
-- CREATE INDEX IF NOT EXISTS todos_user_id_completed_idx ON todos (user_id, completed);
-- CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos (user_id);

-- Verificar integridade após as correções
DO $$
DECLARE
    remaining_issues INTEGER;
BEGIN
    WITH issues AS (
        -- Tarefas com usuário inválido
        SELECT 'invalid_user_task' as issue_type, id as issue_id
        FROM todos t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE u.id IS NULL
        
        UNION ALL
        
        -- Associações incorretas entre tarefas e projetos
        SELECT 'invalid_project_connection' as issue_type, tp.todo_id as issue_id
        FROM todo_projects tp
        JOIN todos t ON tp.todo_id = t.id
        JOIN projects p ON tp.project_id = p.id
        WHERE t.user_id != p.user_id
        
        UNION ALL
        
        -- Associações incorretas entre tarefas e etiquetas
        SELECT 'invalid_label_connection' as issue_type, tl.todo_id as issue_id
        FROM todo_labels tl
        JOIN todos t ON tl.todo_id = t.id
        JOIN labels l ON tl.label_id = l.id
        WHERE t.user_id != l.user_id
    )
    SELECT COUNT(*) INTO remaining_issues FROM issues;
    
    IF remaining_issues > 0 THEN
        RAISE WARNING 'Ainda existem % problemas que precisam ser corrigidos', remaining_issues;
    ELSE
        RAISE NOTICE 'Nenhum problema encontrado após as correções!';
    END IF;
END $$; 