import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      reportType,
      dateRange,
      format,
      projectIds,
      labelIds,
      priorities,
      customColumns,
    } = body;

    if (!reportType || !dateRange) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

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
        customColumns: customColumns || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const projectIdsParam = searchParams.get("projectIds") || "";
    const labelIdsParam = searchParams.get("labelIds") || "";
    const prioritiesParam = searchParams.get("priorities") || "";
    const projectIds = projectIdsParam
      ? projectIdsParam
          .split(",")
          .filter(Boolean)
          .map((id) => parseInt(id, 10))
      : [];
    const labelIds = labelIdsParam
      ? labelIdsParam
          .split(",")
          .filter(Boolean)
          .map((id) => parseInt(id, 10))
      : [];
    const priorities = prioritiesParam
      ? prioritiesParam
          .split(",")
          .filter(Boolean)
          .map((p) => parseInt(p, 10))
      : [];

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing date range parameters" },
        { status: 400 }
      );
    }

    const whereClause: any = {
      user_id: session.user.id,
      AND: [
        {
          OR: [
            { due_date: null },
            {
              due_date: {
                gte: new Date(startDate),
                lte: new Date(endDate),
              },
            },
          ],
        },
      ],
    };

    if (type === "completed") whereClause.completed = true;
    if (type === "pending") whereClause.completed = false;
    if (type === "overdue") {
      whereClause.completed = false;
      whereClause.due_date = { lt: new Date() };
    }

    if (priorities.length > 0) whereClause.priority = { in: priorities };

    if (projectIds.length > 0) {
      whereClause.todo_projects = {
        some: { project_id: { in: projectIds } },
      };
    }

    const tasksRaw = await prisma.todos.findMany({
      where: whereClause,
      include: {
        todo_projects: { include: { projects: true } },
        todo_labels: { include: { labels: true } },
      },
      orderBy: [{ due_date: "asc" }, { priority: "asc" }],
    });

    let tasks = tasksRaw.map((t: any) => ({
      ...t,
      project_id: t.todo_projects?.[0]?.project_id ?? null,
      project_name: t.todo_projects?.[0]?.projects?.name ?? null,
      project_color: t.todo_projects?.[0]?.projects?.color ?? null,
      labels: (t.todo_labels || []).map((tl: any) => tl.labels),
    }));

    if (labelIds.length > 0) {
      tasks = tasks.filter(
        (task: any) =>
          Array.isArray(task.labels) &&
          task.labels.some((l: any) => labelIds.includes(l.id))
      );
    }

    try {
      const taskIds = tasks
        .map((t: any) => t.id)
        .filter((id: any) => typeof id === "number");
      if (taskIds.length > 0) {
        const sums = await prisma.pomodoroLog.groupBy({
          by: ["taskId"],
          where: {
            userId: String(session.user.id),
            mode: "work",
            taskId: { in: taskIds },
            completedAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          _sum: { duration: true },
        });
        const map = new Map<number, number>();
        for (const row of sums) {
          if (row.taskId != null) {
            map.set(Number(row.taskId), Number(row._sum.duration || 0));
          }
        }
        tasks = tasks.map((t: any) => ({
          ...t,
          pomodoro_minutes: map.get(t.id) || 0,
        }));
      }
    } catch {}

    return NextResponse.json({
      tasks,
      filters: {
        type,
        startDate,
        endDate,
        projectIds,
        labelIds,
        priorities,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch report data" },
      { status: 500 }
    );
  }
}
