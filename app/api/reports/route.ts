import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { 
      reportType, 
      dateRange, 
      format, 
      projectIds, 
      labelIds, 
      priorities,
      customColumns
    } = body

    if (!reportType || !dateRange) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Here would be the actual logic to generate the report based on parameters
    // This would connect to your database, query tasks based on filters and generate a file

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // For demonstration, we're just returning a success response
    // In a real implementation, you would generate and return the file
    return NextResponse.json({
      success: true,
      message: `Report generated successfully in ${format} format`,
      downloadUrl: `/api/reports/download?id=${Date.now()}&format=${format}`,
      filters: {
        reportType,
        dateRange,
        projectIds: projectIds || [],
        labelIds: labelIds || [],
        priorities: priorities || [],
        customColumns: customColumns || []
      }
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}

// Para buscar os dados reais das tarefas com base nos filtros
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const projectIds = searchParams.get("projectIds")?.split(',').filter(Boolean) || []
    const labelIds = searchParams.get("labelIds")?.split(',').filter(Boolean) || []
    const priorities = searchParams.get("priorities")?.split(',').filter(Boolean) || []

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing date range parameters" },
        { status: 400 }
      )
    }

    // Construir a consulta SQL base
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
    if (type === 'completed') {
      query += ` AND t.completed = true`;
    } else if (type === 'pending') {
      query += ` AND t.completed = false`;
    } else if (type === 'overdue') {
      query += ` AND t.completed = false AND t.due_date < NOW()`;
    }

    // Filtrar por projetos
    if (projectIds.length > 0) {
      query += ` AND tp.project_id IN (`;
      projectIds.forEach((_, index) => {
        query += index === 0 ? `$${paramIndex}` : `, $${paramIndex}`;
        params.push(parseInt(projectIds[index], 10));
        paramIndex++;
      });
      query += `)`;
    }

    // Filtrar por prioridades
    if (priorities.length > 0) {
      query += ` AND t.priority IN (`;
      priorities.forEach((_, index) => {
        query += index === 0 ? `$${paramIndex}` : `, $${paramIndex}`;
        params.push(parseInt(priorities[index], 10));
        paramIndex++;
      });
      query += `)`;
    }

    // Adicionar ordenação
    query += ` ORDER BY t.due_date ASC, t.priority ASC`;

    // Executar a consulta
    let tasks = await sql.query(query, params);

    // Se há filtros de etiquetas, precisamos fazer um processamento adicional
    if (labelIds.length > 0) {
      // Primeiro, recuperar todos os rótulos para cada tarefa
      for (const task of tasks) {
        const labelResults = await sql`
          SELECT l.id, l.name, l.color
          FROM labels l
          JOIN todo_labels tl ON l.id = tl.label_id
          WHERE tl.todo_id = ${task.id}
        `;
        task.labels = labelResults || [];
      }

      // Depois, filtrar tarefas que contêm pelo menos um dos rótulos especificados
      tasks = tasks.filter((task) => {
        if (!task.labels || task.labels.length === 0) return false;
        return task.labels.some((label) => labelIds.includes(label.id.toString()));
      });
    }

    return NextResponse.json({
      tasks,
      filters: {
        type,
        startDate,
        endDate,
        projectIds,
        labelIds,
        priorities
      }
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 }
    );
  }
} 