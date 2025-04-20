import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";
import { generatePDF } from "../pdf-generator";
import type { ReportFilters } from "@/app/app/reports/utils";

const sql = neon(process.env.DATABASE_URL!);

const QUERY_TIMEOUT = 30000; // 30 segundos de timeout

export async function POST(request: NextRequest) {
  try {
    console.log("Endpoint de PDF chamado");
    
    // Get user session
    const session = await getSession();
    if (!session) {
      console.log("Acesso não autorizado");
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

    console.log("Parâmetros recebidos:", { 
      reportType, 
      startDate, 
      endDate, 
      projectIds: projectIds?.length || 0, 
      labelIds: labelIds?.length || 0, 
      priorities: priorities?.length || 0 
    });

    if (!reportType || !startDate || !endDate) {
      console.log("Parâmetros obrigatórios faltando");
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
        p.color as project_color
      FROM 
        todos t
      LEFT JOIN 
        todo_projects tp ON t.id = tp.todo_id
      LEFT JOIN 
        projects p ON tp.project_id = p.id
      WHERE 
        t.user_id = $1
        AND (t.due_date IS NULL OR (t.due_date >= $2 AND t.due_date <= $3))
    `;

    // Parâmetros para a consulta
    const params = [session.user.id, startDate, endDate];
    let paramIndex = 4;

    // Adicionar condições com base no tipo de relatório
    if (reportType === 'completed') {
      query += ` AND t.completed = true`;
    } else if (reportType === 'pending') {
      query += ` AND t.completed = false`;
    } else if (reportType === 'overdue') {
      query += ` AND t.completed = false AND t.due_date < NOW()`;
    }

    // Filtrar por projetos
    if (projectIds && projectIds.length > 0) {
      query += ` AND tp.project_id IN (`;
      projectIds.forEach((_, index) => {
        query += index === 0 ? `$${paramIndex}` : `, $${paramIndex}`;
        params.push(parseInt(projectIds[index], 10));
        paramIndex++;
      });
      query += `)`;
    }

    // Filtrar por prioridades
    if (priorities && priorities.length > 0) {
      query += ` AND t.priority IN (`;
      priorities.forEach((_, index) => {
        query += index === 0 ? `$${paramIndex}` : `, $${paramIndex}`;
        params.push(parseInt(priorities[index], 10));
        paramIndex++;
      });
      query += `)`;
    }

    // Adicionar ordenação e limite
    query += ` ORDER BY t.due_date ASC, t.priority ASC LIMIT 500`;
    
    console.log("Executando consulta SQL...");

    try {
      // Executar a consulta com timeout
      const queryPromise = sql.query(query, params);

      // Criar um promise de timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Query timeout")), QUERY_TIMEOUT);
      });
      
      // Executar a consulta com timeout
      let tasks = await Promise.race([queryPromise, timeoutPromise]) as any[];
      console.log(`Consulta SQL retornou ${tasks.length} tarefas`);
      
      // Verificar se a resposta da consulta é um array
      if (!Array.isArray(tasks)) {
        console.error("Resposta da consulta não é um array:", tasks);
        tasks = [];
      }
      
      // Se há filtros de etiquetas, precisamos fazer um processamento adicional
      if (labelIds && labelIds.length > 0) {
        console.log("Processando filtros de etiquetas");
        
        // Obter as IDs das tarefas para uma consulta em lote
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
            console.log(`Consulta de etiquetas retornou ${labelsResults.length} registros`);
            
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
            
            // Filtrar tarefas que contêm pelo menos um dos rótulos especificados
            const filteredTasks = tasks.filter((task) => {
              if (!task || !task.labels || !Array.isArray(task.labels) || task.labels.length === 0) return false;
              return task.labels.some((label: any) => 
                label && label.id && labelIds.includes(String(label.id))
              );
            });
            
            tasks = filteredTasks;
            console.log(`Após filtro de etiquetas, restam ${tasks.length} tarefas`);
          } catch (labelError) {
            console.error("Erro ao processar etiquetas:", labelError);
            // Continuar sem as etiquetas em caso de erro
          }
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
            console.error('Erro ao processar etiquetas:', e);
            sanitizedTask.labels = [];
          }
        }
        
        return sanitizedTask;
      });
      
      // Formar o título do relatório (se não foi fornecido)
      const reportTitle = title || `Relatório de ${reportType === 'tasks' ? 'Todas as Tarefas' : 
        reportType === 'completed' ? 'Tarefas Concluídas' : 
        reportType === 'pending' ? 'Tarefas Pendentes' : 
        reportType === 'overdue' ? 'Tarefas Atrasadas' : 
        'Análise de Produtividade'}`;
      
      // Criar estrutura de dados do relatório com os dados sanitizados
      const reportData = {
        title: reportTitle,
        period: { start: startDate, end: endDate },
        generatedAt: new Date().toISOString(),
        items: sanitizedTasks,
        filters: {
          projectIds,
          labelIds,
          priorities,
          customColumns
        } as ReportFilters
      };
  
      console.log("Iniciando geração do PDF com os dados coletados");
      
      try {
        // Gerar o PDF
        const pdfBuffer = generatePDF(reportData);
      
        // Formatar o nome do arquivo
        const date = new Date().toISOString().split('T')[0];
        const fileName = `Relatorio_${reportType.charAt(0).toUpperCase() + reportType.slice(1)}_${date}.pdf`;
        
        console.log("PDF gerado com sucesso, montando resposta");
        
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
        console.error("Erro específico ao gerar PDF:", pdfError);
        return NextResponse.json(
          { error: "Erro ao gerar PDF: " + (pdfError instanceof Error ? pdfError.message : String(pdfError)) },
          { status: 500 }
        );
      }
    } catch (dbError) {
      console.error("Erro na consulta ao banco de dados:", dbError);
      return NextResponse.json(
        { error: "Erro ao consultar o banco de dados: " + (dbError instanceof Error ? dbError.message : String(dbError)) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro geral na rota de PDF:", error);
    
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