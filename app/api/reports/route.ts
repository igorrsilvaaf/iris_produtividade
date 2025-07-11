import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import prisma from "../../../lib/prisma"



export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

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


    await new Promise(resolve => setTimeout(resolve, 1000))

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
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}

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
    const projectIdsParam = searchParams.get("projectIds") || "";
    const labelIdsParam = searchParams.get("labelIds") || "";
    const prioritiesParam = searchParams.get("priorities") || "";
    const projectIds = projectIdsParam ? projectIdsParam.split(',').filter(Boolean) : []
    const labelIds = labelIdsParam ? labelIdsParam.split(',').filter(Boolean) : []
    const priorities = prioritiesParam ? prioritiesParam.split(',').filter(Boolean) : []
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing date range parameters" },
        { status: 400 }
      )
    }

    let query = `
      SELECT 
        t.*, 
        p.name as project_name, 
        p.color as project_color,
        tp.project_id as project_id
      FROM 
        todos t
    `;
    
    const params = [session.user.id, startDate, endDate];
    let paramIndex = 4;
    
    if (projectIds.length > 0) {
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
      
      projectIds.forEach((id, index) => {
        query += index === 0 ? `$${paramIndex}` : `, $${paramIndex}`;
        params.push(parseInt(id, 10));
        paramIndex++;
      });
      
      query += `)`;
    } else {
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

    if (type === 'completed') {
      query += ` AND t.completed = true`;
    } else if (type === 'pending') {
      query += ` AND t.completed = false`;
    } else if (type === 'overdue') {
      query += ` AND t.completed = false AND t.due_date < NOW()`;
    }

    if (priorities.length > 0) {
      query += ` AND t.priority IN (`;
      priorities.forEach((_, index) => {
        query += index === 0 ? `$${paramIndex}` : `, $${paramIndex}`;
        params.push(parseInt(priorities[index], 10));
        paramIndex++;
      });
      query += `)`;
    }

    query += ` ORDER BY t.due_date ASC, t.priority ASC`;

    let tasks = await sql.query(query, params);

    if (labelIds.length > 0) {
      const hasProjectFilters = projectIds.length > 0;
      const taskIds = tasks.filter(t => t && t.id).map(t => t.id);
      
      if (taskIds.length > 0) {
        const labelQuery = `
          SELECT tl.todo_id, l.id, l.name, l.color
          FROM labels l
          JOIN todo_labels tl ON l.id = tl.label_id
          WHERE tl.todo_id = ANY($1)
        `;
        
        const allLabels = await sql.query(labelQuery, [taskIds]);
        
        const labelsByTaskId: Record<number, any[]> = {};
        
        if (Array.isArray(allLabels)) {
          allLabels.forEach((label: any) => {
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
        
        tasks.forEach((task) => {
          if (task && task.id) {
            task.labels = labelsByTaskId[task.id] || [];
          } else {
            task.labels = [];
          }
        });
        
        tasks = tasks.filter((task) => {
          if (!task.labels || task.labels.length === 0) return false;
          return task.labels.some((label: {id: number | string}) => labelIds.includes(label.id.toString()));
        });
      } else {
        tasks = [];
      }
    } else {
      const taskIds = tasks.filter(t => t && t.id).map(t => t.id);
      
      if (taskIds.length > 0) {
        const labelQuery = `
          SELECT tl.todo_id, l.id, l.name, l.color
          FROM labels l
          JOIN todo_labels tl ON l.id = tl.label_id
          WHERE tl.todo_id = ANY($1)
        `;
        
        const allLabels = await sql.query(labelQuery, [taskIds]);
        const labelsByTaskId: Record<number, any[]> = {};
        
        if (Array.isArray(allLabels)) {
          allLabels.forEach((label: any) => {
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
        
        tasks.forEach((task) => {
          if (task && task.id) {
            task.labels = labelsByTaskId[task.id] || [];
          } else {
            task.labels = [];
          }
        });
      }
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
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 }
    );
  }
}