import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";
import { generatePDF } from "../pdf-generator";
import type { ReportFilters } from "@/app/app/reports/utils";

const sql = neon(process.env.DATABASE_URL!);

const QUERY_TIMEOUT = 30000; // 30 segundos de timeout

export async function POST(request: NextRequest) {
  try {
    ("Endpoint de PDF chamado");
    
    // Get user session
    const session = await getSession();
    if (!session) {
      ("Acesso não autorizado");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      reportType, 
      startDate,
      endDate,
      projectIds, 
      labelIds, 
      priorities,
      customColumns,
      title
    } = body;

    // Garantir que os arrays de filtros sejam tratados corretamente
    const filteredProjectIds = Array.isArray(projectIds) ? projectIds : [];
    const filteredLabelIds = Array.isArray(labelIds) ? labelIds : [];
    const filteredPriorities = Array.isArray(priorities) ? priorities : [];
    const filteredCustomColumns = Array.isArray(customColumns) ? customColumns : [];

    ("Parâmetros recebidos:", { 
      reportType, 
      startDate, 
      endDate, 
      projectIds: filteredProjectIds.length || 0, 
      labelIds: filteredLabelIds.length || 0, 
      priorities: filteredPriorities.length || 0 
    });

    if (!reportType || !startDate || !endDate) {
      ("Parâmetros obrigatórios faltando");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Abordagem mais simples: buscar apenas as tarefas, sem as etiquetas incorporadas
    let query = `
      SELECT 
        t.*,
        p.name as project_name,
        p.color as project_color,
        tp.project_id as project_id
      FROM 
        todos t
    `;
    
    // Parâmetros para a consulta
    const params = [session.user.id, startDate, endDate];
    let paramIndex = 4;
    
    // Se há filtros de projeto, usar INNER JOIN para garantir que a filtragem seja eficaz
    if (filteredProjectIds.length > 0) {
      query += `
      INNER JOIN 
        todo_projects tp ON t.id = tp.todo_id
      INNER JOIN 
        projects p ON tp.project_id = p.id 
      WHERE 
        t.user_id = $1
        AND (t.due_date IS NULL OR (t.due_date >= $2 AND t.due_date <= $3))
        AND tp.project_id IN (
      `;
      
      filteredProjectIds.forEach((id, index) => {
        query += index === 0 ? `$${paramIndex}` : `, $${paramIndex}`;
        params.push(parseInt(id, 10));
        paramIndex++;
      });
      
      query += `)`;
      
      (`Aplicando filtro de projetos PDF: ${filteredProjectIds.join(', ')}`);
    } else {
      // Se não há filtros de projeto, usar LEFT JOIN para incluir todas as tarefas
      query += `
      LEFT JOIN 
        todo_projects tp ON t.id = tp.todo_id
      LEFT JOIN 
        projects p ON tp.project_id = p.id
      WHERE 
        t.user_id = $1
        AND (t.due_date IS NULL OR (t.due_date >= $2 AND t.due_date <= $3))
      `;
    }

    // Adicionar condições com base no tipo de relatório
    if (reportType === 'completed') {
      query += ` AND t.completed = true`;
    } else if (reportType === 'pending') {
      query += ` AND t.completed = false`;
    } else if (reportType === 'overdue') {
      query += ` AND t.completed = false AND t.due_date < NOW()`;
    }

    // Filtrar por prioridades, apenas se o array não estiver vazio
    if (filteredPriorities.length > 0) {
      query += ` AND t.priority IN (`;
      filteredPriorities.forEach((_, index) => {
        query += index === 0 ? `$${paramIndex}` : `, $${paramIndex}`;
        params.push(parseInt(filteredPriorities[index], 10));
        paramIndex++;
      });
      query += `)`;
    }

    // Adicionar ordenação e limite
    query += ` ORDER BY t.due_date ASC, t.priority ASC LIMIT 1000`;
    
    ("Executando consulta SQL...");
    ("Query:", query);
    ("Params:", params);
    try {
      // Executar a consulta com timeout
      const queryPromise = sql.query(query, params);

      // Criar um promise de timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Query timeout")), QUERY_TIMEOUT);
      });
      
      // Executar a consulta com timeout
      let tasks = await Promise.race([queryPromise, timeoutPromise]) as any[];
      
      // Verificar se a resposta da consulta é um array
      if (!Array.isArray(tasks)) {
        tasks = [];
      }
      
      // Buscar todas as etiquetas para todas as tarefas
      const taskIds = tasks.filter(t => t && t.id).map(t => t.id);
      
      if (taskIds.length > 0) {
        try {
          // Buscar todas as etiquetas para todas as tarefas em uma única consulta
          const labelsQuery = `
            SELECT tl.todo_id, l.id, l.name, l.color
            FROM todo_labels tl
            JOIN labels l ON tl.label_id = l.id
            WHERE tl.todo_id = ANY($1)
          `;
          
          const labelsResults = await sql.query(labelsQuery, [taskIds]);
          (`Consulta de etiquetas retornou ${labelsResults.length} registros`);
          
          // Agrupar etiquetas por ID de tarefa
          const labelsByTaskId: Record<number, any[]> = {};
          
          if (Array.isArray(labelsResults)) {
            labelsResults.forEach((label: any) => {
              if (label && label.todo_id) {
                if (!labelsByTaskId[label.todo_id]) {
                  labelsByTaskId[label.todo_id] = [];
                }
                labelsByTaskId[label.todo_id].push({
                  id: label.id,
                  name: label.name,
                  color: label.color
                });
              }
            });
          }
          
          // Adicionar etiquetas a cada tarefa
          tasks.forEach((task) => {
            if (task && task.id) {
              task.labels = labelsByTaskId[task.id] || [];
            } else {
              task.labels = [];
            }
          });
          
          // Se há filtros de etiquetas, aplicar o filtro apenas depois de ter carregado todas as etiquetas
          if (filteredLabelIds.length > 0) {
            (`Aplicando filtro de etiquetas: ${filteredLabelIds.join(', ')}`);
            
            // Verificamos se há tarefas com etiquetas
            if (Array.isArray(tasks) && tasks.length > 0 && tasks.some(t => t.labels && t.labels.length > 0)) {
              const filteredTasks = tasks.filter((task) => {
                if (!task || !task.labels || !Array.isArray(task.labels) || task.labels.length === 0) return false;
                
                return task.labels.some((label: any) => 
                  label && label.id && filteredLabelIds.includes(String(label.id))
                );
              });
              
              // Só substituímos se tivermos tarefas filtradas
              if (filteredTasks.length > 0) {
                tasks = filteredTasks;
                (`Após filtro de etiquetas, restam ${tasks.length} tarefas`);
              } else {
                // Se não encontramos nenhuma tarefa com as etiquetas solicitadas,
                // é provavelmente um erro do usuário, então vamos manter as tarefas originais
                (`Aviso: Filtro de etiquetas não encontrou resultados. Mantendo resultado original.`);
              }
            } else {
              (`Aviso: Não há etiquetas nas tarefas para filtrar.`);
            }
          }
        } catch (labelError) {
          ("Erro ao processar etiquetas:", labelError);
          // Continuar sem as etiquetas em caso de erro
        }
      }
      
      // Processar e sanitizar os dados antes de enviá-los para o gerador de PDF
      // Garantir que cada tarefa tenha todas as propriedades necessárias, mesmo se nulas
      const sanitizedTasks = tasks.map(task => {
        // Criar um objeto base com propriedades padrão para evitar undefined
        const sanitizedTask = {
          id: task.id || 0,
          title: task.title || '',
          description: task.description || '',
          due_date: task.due_date || null,
          priority: task.priority !== undefined ? task.priority : null,
          completed: task.completed !== undefined ? task.completed : false,
          kanban_column: task.kanban_column || '',
          points: task.points || null,
          estimated_time: task.estimated_time || null,
          created_at: task.created_at || new Date().toISOString(),
          updated_at: task.updated_at || new Date().toISOString(),
          project_name: task.project_name || '',
          project_color: task.project_color || '#cccccc',
          labels: []
        };
        
        // Processar labels se existirem
        if (task.labels) {
          try {
            // Se labels for string (JSON), tentar converter para array
            if (typeof task.labels === 'string') {
              sanitizedTask.labels = JSON.parse(task.labels);
            } else {
              sanitizedTask.labels = task.labels;
            }
            
            // Verificar se é um array
            if (!Array.isArray(sanitizedTask.labels)) {
              sanitizedTask.labels = [];
            }
          } catch (e) {
            ('Erro ao processar etiquetas:', e);
            sanitizedTask.labels = [];
          }
        }
        
        return sanitizedTask;
      });
      
      // Processar e sanitizar os dados antes de enviá-los para o gerador de PDF
      // Agora incluir os dados do relatório completo
      const reportData = {
        title: `Relatório de ${reportType === 'tasks' ? 'Todas as Tarefas' : 
                reportType === 'completed' ? 'Tarefas Concluídas' : 
                reportType === 'pending' ? 'Tarefas Pendentes' : 
                reportType === 'overdue' ? 'Tarefas Atrasadas' : 
                'Análise de Produtividade'}`,
        period: { 
          start: startDate, 
          end: endDate 
        },
        generatedAt: new Date().toISOString(),
        items: sanitizedTasks,
        filters: {
          projectIds: filteredProjectIds,
          labelIds: filteredLabelIds,
          priorities: filteredPriorities,
          customColumns: filteredCustomColumns
        }
      };
  
      ("Iniciando geração do PDF com os dados coletados");
      
      try {
        // Gerar o PDF
        const pdfBuffer = generatePDF(reportData);
      
        // Formatar o nome do arquivo
        const date = new Date().toISOString().split('T')[0];
        const fileName = `Relatorio_${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_${date}.pdf`;
        
        ("PDF gerado com sucesso, montando resposta");
        
        // Configurar os cabeçalhos da resposta
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
        headers.set('Content-Length', pdfBuffer.length.toString());
        
        // Retornar o PDF como resposta
        return new NextResponse(pdfBuffer, {
          status: 200,
          headers
        });
      } catch (pdfError) {
        ("Erro específico ao gerar PDF:", pdfError);
        return NextResponse.json(
          { error: "Erro ao gerar PDF: " + (pdfError instanceof Error ? pdfError.message : String(pdfError)) },
          { status: 500 }
        );
      }
    } catch (dbError) {
      ("Erro na consulta ao banco de dados:", dbError);
      return NextResponse.json(
        { error: "Erro ao consultar o banco de dados: " + (dbError instanceof Error ? dbError.message : String(dbError)) },
        { status: 500 }
      );
    }
  } catch (error) {
    ("Erro geral na rota de PDF:", error);
    
    // Tratamento especial para timeout
    if (error instanceof Error && error.message === "Query timeout") {
      return NextResponse.json(
        { error: "A consulta levou muito tempo para ser processada. Por favor, reduza o número de filtros ou o período do relatório." },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: "Falha ao gerar relatório PDF: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 