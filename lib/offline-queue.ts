type PomodoroMode = "work" | "shortBreak" | "longBreak";

export type PomodoroLogPayload = {
  taskId?: number | null;
  duration: number;
  mode: PomodoroMode;
  createdAt?: number;
};

const STORAGE_KEY = "pomodoro-log-queue-v1";

function readQueue(): PomodoroLogPayload[] {
  try {
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeQueue(items: PomodoroLogPayload[]): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function enqueuePomodoroLog(payload: PomodoroLogPayload): void {
  const queue = readQueue();
  const item = { ...payload, createdAt: payload.createdAt || Date.now() };
  queue.push(item);
  writeQueue(queue);
}

async function sendPomodoroLog(payload: PomodoroLogPayload): Promise<boolean> {
  const res = await fetch("/api/pomodoro/log", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
    body: JSON.stringify({
      taskId: payload.taskId || undefined,
      duration: payload.duration,
      mode: payload.mode,
    }),
  });
  return res.ok;
}

export async function flushPomodoroQueue(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;
  const remaining: PomodoroLogPayload[] = [];
  for (const item of queue) {
    try {
      const ok = await sendPomodoroLog(item);
      if (!ok) remaining.push(item);
    } catch {
      remaining.push(item);
    }
  }
  writeQueue(remaining);
}

export async function trySendOrQueue(
  payload: PomodoroLogPayload
): Promise<void> {
  try {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueuePomodoroLog(payload);
      return;
    }
    const ok = await sendPomodoroLog(payload);
    if (!ok) enqueuePomodoroLog(payload);
  } catch {
    enqueuePomodoroLog(payload);
  }
}

let processorStarted = false;

export function startPomodoroQueueProcessor(): void {
  if (processorStarted) return;
  processorStarted = true;
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
      flushPomodoroQueue();
    });
    setInterval(() => {
      flushPomodoroQueue();
    }, 60_000);
  }
}
