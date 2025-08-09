import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateTask } from "@/lib/todos";

type UpdatePayload = {
  id: number;
  kanban_column?: string;
  completed?: boolean;
  kanban_order?: number;
};

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const updates = Array.isArray(body?.updates)
      ? (body.updates as UpdatePayload[])
      : [];

    if (updates.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    let updatedCount = 0;
    for (const item of updates) {
      if (!item || typeof item.id !== "number") continue;
      const payload: any = {};
      if (item.kanban_column !== undefined)
        payload.kanban_column = item.kanban_column;
      if (item.completed !== undefined) payload.completed = item.completed;
      if (item.kanban_order !== undefined)
        payload.kanban_order = item.kanban_order;
      try {
        await updateTask(item.id, userId, payload);
        updatedCount += 1;
      } catch (_e) {}
    }

    return NextResponse.json({ updated: updatedCount });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to apply bulk updates" },
      { status: 500 }
    );
  }
}
