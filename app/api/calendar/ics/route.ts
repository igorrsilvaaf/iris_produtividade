import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function escapeICalText(text: string): string {
  return text
    .replace(/[\\;,]/g, "\\$&")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
    });
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const tasks = await prisma.todos.findMany({
      where: { user_id: session.user.id },
      include: {
        todo_projects: { include: { projects: true } },
      },
      orderBy: [{ due_date: "asc" }],
    });

    const lines: string[] = [];
    lines.push("BEGIN:VCALENDAR");
    lines.push("VERSION:2.0");
    lines.push("PRODID:-//Íris//EN");
    lines.push("CALSCALE:GREGORIAN");
    lines.push("METHOD:PUBLISH");
    lines.push(`X-WR-CALNAME:Íris Tasks (${user.email})`);

    for (const t of tasks) {
      if (!t.due_date) continue;
      const due = new Date(t.due_date);
      const isAllDay = due.getUTCHours() === 0 && due.getUTCMinutes() === 0;
      const uid = `task-${t.id}@iris`;
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(
        `DTSTAMP:${
          new Date().toISOString().replace(/[-:]/g, "").split(".")[0]
        }Z`
      );
      if (isAllDay) {
        const y = due.getUTCFullYear();
        const m = String(due.getUTCMonth() + 1).padStart(2, "0");
        const d = String(due.getUTCDate()).padStart(2, "0");
        lines.push(`DTSTART;VALUE=DATE:${y}${m}${d}`);
        lines.push(`DTEND;VALUE=DATE:${y}${m}${d}`);
      } else {
        const yyyyMMddThhmmssZ =
          due.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        lines.push(`DTSTART:${yyyyMMddThhmmssZ}`);
        lines.push(`DTEND:${yyyyMMddThhmmssZ}`);
      }
      lines.push(`SUMMARY:${escapeICalText(t.title)}`);
      if (t.description)
        lines.push(`DESCRIPTION:${escapeICalText(t.description)}`);
      const project = t.todo_projects?.[0]?.projects;
      if (project?.name)
        lines.push(`CATEGORIES:${escapeICalText(project.name)}`);
      lines.push(t.completed ? "STATUS:COMPLETED" : "STATUS:NEEDS-ACTION");
      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");

    const content = lines.join("\r\n");
    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "no-cache",
        "Content-Disposition": "attachment; filename=iris-tasks.ics",
      },
    });
  } catch (e) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
