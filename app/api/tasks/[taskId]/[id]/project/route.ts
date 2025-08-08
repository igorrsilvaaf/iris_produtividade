import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTaskProject, setTaskProject } from "@/lib/todos";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const resolvedParams = await params;
    const taskId = Number.parseInt(resolvedParams.id);
    const projectIds = await getTaskProject(taskId, userId);

    return NextResponse.json({ projectIds });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to fetch task project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const taskId = Number.parseInt(resolvedParams.id);

    if (isNaN(taskId) || taskId <= 0) {
      return NextResponse.json({ message: "Invalid task ID" }, { status: 400 });
    }

    const body = await request.json();
    const { projectIds } = body;

    if (projectIds !== null && projectIds !== undefined) {
      if (!Array.isArray(projectIds)) {
        return NextResponse.json(
          { message: "Invalid project IDs format" },
          { status: 400 }
        );
      }
      const invalid = projectIds.some(
        (id: any) => isNaN(Number(id)) || Number(id) <= 0
      );
      if (invalid) {
        return NextResponse.json(
          { message: "Invalid project ID in list" },
          { status: 400 }
        );
      }
    }

    const userId = session.user.id;

    const normalizedIds = Array.isArray(projectIds)
      ? projectIds.map((id: any) => Number(id))
      : [];
    await setTaskProject(
      taskId,
      userId,
      normalizedIds.length > 0 ? normalizedIds : null
    );

    return NextResponse.json({
      message: "Task project updated successfully",
      data: { taskId, projectIds: normalizedIds },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || "Failed to update task project",
        error: error.toString(),
      },
      { status: 500 }
    );
  }
}
