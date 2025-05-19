-- Arquivo de diagnóstico para problemas nas tarefas e notificações
-- Execute estas consultas uma a uma para identificar possíveis problemas

-- 1. Verificar se há tarefas sem usuário válido
SELECT 
    t.id as task_id, 
    t.title as task_title, 
    t.user_id as task_user_id,
    u.id as user_exists,
    u.email as user_email
FROM 
    todos t
LEFT JOIN 
    users u ON t.user_id = u.id
WHERE 
    u.id IS NULL;

-- 2. Verificar se há projetos sem usuário válido
SELECT 
    p.id as project_id, 
    p.name as project_name, 
    p.user_id as project_user_id,
    u.id as user_exists,
    u.email as user_email
FROM 
    projects p
LEFT JOIN 
    users u ON p.user_id = u.id
WHERE 
    u.id IS NULL;

-- 3. Verificar se há etiquetas sem usuário válido
SELECT 
    l.id as label_id, 
    l.name as label_name, 
    l.user_id as label_user_id,
    u.id as user_exists,
    u.email as user_email
FROM 
    labels l
LEFT JOIN 
    users u ON l.user_id = u.id
WHERE 
    u.id IS NULL;

-- 4. Verificar associações incorretas entre tarefas e projetos
SELECT 
    tp.todo_id,
    t.title as task_title, 
    t.user_id as task_user_id,
    tu.email as task_user_email,
    tp.project_id, 
    p.name as project_name,
    p.user_id as project_user_id,
    pu.email as project_user_email
FROM 
    todo_projects tp
JOIN 
    todos t ON tp.todo_id = t.id
JOIN 
    projects p ON tp.project_id = p.id
JOIN
    users tu ON t.user_id = tu.id
JOIN
    users pu ON p.user_id = pu.id
WHERE 
    t.user_id != p.user_id;

-- 5. Verificar associações incorretas entre tarefas e etiquetas
SELECT 
    tl.todo_id,
    t.title as task_title, 
    t.user_id as task_user_id,
    tu.email as task_user_email,
    tl.label_id, 
    l.name as label_name,
    l.user_id as label_user_id,
    lu.email as label_user_email
FROM 
    todo_labels tl
JOIN 
    todos t ON tl.todo_id = t.id
JOIN 
    labels l ON tl.label_id = l.id
JOIN
    users tu ON t.user_id = tu.id
JOIN
    users lu ON l.user_id = lu.id
WHERE 
    t.user_id != l.user_id;

-- 6. Verificar se um usuário consegue ver tarefas de outro usuário pelas associações
WITH task_references AS (
    -- Tarefas acessíveis através de projetos
    SELECT 
        p.user_id as "viewing_user_id",
        t.id as "accessed_task_id",
        t.user_id as "task_owner_id",
        'project' as "access_path",
        p.id as "relationship_id",
        p.name as "relationship_name"
    FROM 
        projects p
    JOIN 
        todo_projects tp ON p.id = tp.project_id
    JOIN 
        todos t ON tp.todo_id = t.id
    WHERE 
        p.user_id != t.user_id
    
    UNION ALL
    
    -- Tarefas acessíveis através de etiquetas
    SELECT 
        l.user_id as "viewing_user_id",
        t.id as "accessed_task_id",
        t.user_id as "task_owner_id",
        'label' as "access_path",
        l.id as "relationship_id",
        l.name as "relationship_name"
    FROM 
        labels l
    JOIN 
        todo_labels tl ON l.id = tl.label_id
    JOIN 
        todos t ON tl.todo_id = t.id
    WHERE 
        l.user_id != t.user_id
)
SELECT 
    tr.viewing_user_id,
    vu.email as "viewing_user_email",
    tr.accessed_task_id,
    t.title as "accessed_task_title",
    tr.task_owner_id,
    tu.email as "task_owner_email",
    tr.access_path,
    tr.relationship_id,
    tr.relationship_name
FROM 
    task_references tr
JOIN 
    users vu ON tr.viewing_user_id = vu.id
JOIN 
    todos t ON tr.accessed_task_id = t.id
JOIN 
    users tu ON tr.task_owner_id = tu.id
ORDER BY 
    tr.viewing_user_id, tr.access_path;

-- 7. Correção: Remover relações incorretas entre tarefas e projetos
-- DELETE FROM 
--     todo_projects
-- WHERE 
--     (todo_id, project_id) IN (
--         SELECT 
--             tp.todo_id, 
--             tp.project_id
--         FROM 
--             todo_projects tp
--         JOIN 
--             todos t ON tp.todo_id = t.id
--         JOIN 
--             projects p ON tp.project_id = p.id
--         WHERE 
--             t.user_id != p.user_id
--     );

-- 8. Correção: Remover relações incorretas entre tarefas e etiquetas
-- DELETE FROM 
--     todo_labels
-- WHERE 
--     (todo_id, label_id) IN (
--         SELECT 
--             tl.todo_id, 
--             tl.label_id
--         FROM 
--             todo_labels tl
--         JOIN 
--             todos t ON tl.todo_id = t.id
--         JOIN 
--             labels l ON tl.label_id = l.id
--         WHERE 
--             t.user_id != l.user_id
--     );

-- NOVAS CONSULTAS PARA DIAGNÓSTICO DE NOTIFICAÇÕES

-- 9. Verificar possíveis problemas na tabela task_notifications_read
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'task_notifications_read';

-- 10. Verificar se há registros duplicados na tabela de notificações lidas
SELECT 
    user_id, 
    COUNT(*) as count
FROM 
    task_notifications_read 
GROUP BY 
    user_id 
HAVING 
    COUNT(*) > 1;

-- 11. Identificar tarefas com data de vencimento passada que podem estar gerando notificações extras
SELECT 
    t.id, 
    t.title, 
    t.user_id, 
    u.email,
    t.due_date
FROM 
    todos t
JOIN 
    users u ON t.user_id = u.id
WHERE 
    t.due_date < CURRENT_DATE
    AND t.completed = false
ORDER BY 
    t.due_date ASC;

-- 12. Verificar consultas utilizadas pelas notificações
-- Simulação da consulta getTasksForNotifications para usuário específico
-- Substitua 123 pelo ID do usuário que relatou problemas
SELECT 
    t.id, 
    t.title, 
    t.user_id,
    u.email as user_email,
    t.due_date
FROM 
    todos t
JOIN 
    users u ON t.user_id = u.id
WHERE 
    t.due_date < CURRENT_DATE
    AND t.completed = false
    -- Verifique se a cláusula de usuário está realmente filtrando
    AND t.user_id = 123 
ORDER BY 
    t.due_date ASC
LIMIT 10;

-- 13. Verificar possível problema de cache ou conexão persistente
SELECT 
    pid, 
    usename, 
    application_name,
    client_addr,
    state, 
    query_start, 
    wait_event_type,
    wait_event, 
    query
FROM 
    pg_stat_activity 
WHERE 
    state != 'idle'
    AND query LIKE '%todos%'
ORDER BY 
    query_start DESC;

-- 14. Correção: Limpar registros problemáticos de notificações
-- DELETE FROM task_notifications_read
-- WHERE id NOT IN (
--     SELECT MAX(id)
--     FROM task_notifications_read
--     GROUP BY user_id
-- );

-- 15. Verificar se há índices apropriados para consultas de tarefas
SELECT 
    tablename, 
    indexname, 
    indexdef
FROM 
    pg_indexes
WHERE 
    tablename IN ('todos', 'task_notifications_read');

-- 16. Criar índice para melhorar performance (se não existir)
-- CREATE INDEX IF NOT EXISTS todos_user_id_due_date_idx ON todos (user_id, due_date);
-- CREATE INDEX IF NOT EXISTS todos_user_id_completed_idx ON todos (user_id, completed);

-- 17. Verificação de integridade na tabela de notificações
-- Esta consulta deve retornar 0 linhas se tudo estiver correto
SELECT 
    tnr.id,
    tnr.user_id,
    u.email
FROM 
    task_notifications_read tnr
LEFT JOIN 
    users u ON tnr.user_id = u.id
WHERE 
    u.id IS NULL;

-- ATENÇÃO: As consultas de correção estão comentadas.
-- Verifique os resultados das consultas de diagnóstico antes e execute as correções apenas se necessário. 