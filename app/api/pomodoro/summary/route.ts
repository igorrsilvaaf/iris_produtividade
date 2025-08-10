import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = String(session.user.id);

    const logs = await prisma.pomodoroLog.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 2000,
    });

    const byDay: Record<string, number> = {};
    const byHour: Record<string, number> = {};
    const byMode: Record<string, number> = {
      work: 0,
      shortBreak: 0,
      longBreak: 0,
    };
    const byWeekday: Record<string, number> = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };
    const byDaypart: Record<string, number> = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

    for (const l of logs) {
      const d = l.completedAt || l.startedAt;
      const dayKey = new Date(d).toISOString().slice(0, 10);
      byDay[dayKey] = (byDay[dayKey] || 0) + l.duration;
      const hour = new Date(d).getHours();
      const hourKey = String(hour).padStart(2, "0");
      byHour[hourKey] = (byHour[hourKey] || 0) + l.duration;
      byMode[l.mode] = (byMode[l.mode] || 0) + l.duration;
      const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
        new Date(d).getDay()
      ];
      byWeekday[wd] = (byWeekday[wd] || 0) + l.duration;
      const dp =
        hour < 6
          ? "night"
          : hour < 12
          ? "morning"
          : hour < 18
          ? "afternoon"
          : "evening";
      byDaypart[dp] = (byDaypart[dp] || 0) + l.duration;
    }

    const totalMinutes = logs.reduce((a, b) => a + b.duration, 0);
    const days = Object.entries(byDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, minutes]) => ({ date, minutes }));
    const hours = Array.from({ length: 24 }, (_, h) => {
      const k = String(h).padStart(2, "0");
      return { hour: k, minutes: byHour[k] || 0 };
    });

    let bestHour = "00";
    let bestHourMinutes = 0;
    for (const h of hours) {
      if (h.minutes > bestHourMinutes) {
        bestHourMinutes = h.minutes;
        bestHour = h.hour;
      }
    }

    const taskIds = Array.from(
      new Set(logs.filter((l) => l.taskId != null).map((l) => Number(l.taskId)))
    );
    let byProject: Array<{ project: string; minutes: number }> = [];
    if (taskIds.length > 0) {
      const tasks = await prisma.todos.findMany({
        where: { id: { in: taskIds } },
        include: { todo_projects: { include: { projects: true } } },
      });
      const taskIdToProject: Record<number, string> = {};
      for (const t of tasks) {
        const p =
          (t as any).todo_projects?.[0]?.projects?.name || "Sem projeto";
        taskIdToProject[t.id] = p;
      }
      const map: Record<string, number> = {};
      for (const l of logs) {
        if (l.taskId == null) continue;
        const p = taskIdToProject[Number(l.taskId)] || "Sem projeto";
        map[p] = (map[p] || 0) + l.duration;
      }
      byProject = Object.entries(map)
        .map(([project, minutes]) => ({ project, minutes }))
        .sort((a, b) => b.minutes - a.minutes);
    }

    return NextResponse.json({
      success: true,
      totalMinutes,
      byMode,
      byWeekday,
      byDaypart,
      byProject,
      days,
      hours,
      insights: {
        bestHour,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao gerar resumo" },
      { status: 500 }
    );
  }
}
