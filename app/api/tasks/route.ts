import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  createTask,
  getCompletedTasks,
  getInboxTasks,
  getTasksForNotifications,
  searchTasks,
  getAllTasksForUser,
} from "@/lib/todos";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const completed = searchParams.get("completed");
    const overdue = searchParams.get("overdue");
    const searchText = searchParams.get("search");
    const all = searchParams.get("all");

    let tasks = [];

    if (all === "true") {
      tasks = await getAllTasksForUser(userId);
    } else if (searchText) {
      tasks = await searchTasks(userId, searchText);
    } else if (completed === "true") {
      tasks = await getCompletedTasks(userId);
    } else if (overdue === "true") {
      const taskGroups = await getTasksForNotifications(userId);
      tasks = taskGroups.overdueTasks;
    } else {
      tasks = await getInboxTasks(userId);
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const dueDateValue = body.due_date || null;
    const projectIdValue = body.project_id || null;
    const attachmentsValue = body.attachments || [];
    const estimatedTimeValue = body.estimated_time || null;

    try {
      const task = await createTask({
        userId: session.user.id,
        title: body.title,
        description: body.description,
        dueDate: dueDateValue,
        priority: body.priority || 4,
        projectId: projectIdValue,
        kanbanColumn: body.kanban_column || null,
        points: body.points || 3,
        attachments: attachmentsValue,
        estimatedTime: estimatedTimeValue,
      });

      // Vincular automaticamente PR/Issue do GitHub quando aplicável
      try {
        const prMatch = /PR\s*#(\d+)/i.exec(body.title || "");
        const issueMatch = /Issue\s*#(\d+)/i.exec(body.title || "");
        if (prMatch || issueMatch) {
          const integ = await prisma.user_integrations.findUnique({
            where: { user_id: session.user.id },
          });
          const repo =
            (integ as any)?.github_repo ||
            process.env.GITHUB_DEFAULT_REPO ||
            null;
          const pat =
            (integ as any)?.github_pat || process.env.GITHUB_PAT || null;
          if (repo && pat) {
            const num = Number(prMatch?.[1] || issueMatch?.[1]);
            const isPr = !!prMatch;
            const apiUrl = isPr
              ? `https://api.github.com/repos/${repo}/pulls/${num}`
              : `https://api.github.com/repos/${repo}/issues/${num}`;
            const webUrl = isPr
              ? `https://github.com/${repo}/pull/${num}`
              : `https://github.com/${repo}/issues/${num}`;
            const resp = await fetch(apiUrl, {
              headers: {
                Authorization: `Bearer ${pat}`,
                Accept: "application/vnd.github+json",
              },
              cache: "no-store",
            });
            if (resp.ok) {
              const links = Array.isArray((task as any).external_links)
                ? ((task as any).external_links as any[])
                : [];
              if (!links.includes(webUrl)) links.push(webUrl);
              await prisma.todos.update({
                where: { id: task.id },
                data: { external_links: links, updated_at: new Date() },
              });
            }
          }
        }
      } catch {}

      return NextResponse.json({
        success: true,
        task: {
          ...task,
          attachments: task.attachments || [],
        },
      });
    } catch (createError) {
      return NextResponse.json(
        {
          error: `Erro ao criar tarefa: ${
            createError instanceof Error
              ? createError.message
              : String(createError)
          }`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
