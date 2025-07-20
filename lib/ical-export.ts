import { format } from "date-fns"
import type { Todo } from "@/lib/todos"

interface ICalExportOptions {
  calendarName?: string
  timezone?: string
  includeCompleted?: boolean
  includeDescription?: boolean
}

export function generateICalContent(
  tasks: Todo[], 
  options: ICalExportOptions = {}
): string {
  const {
    calendarName = "Íris Tasks",
    timezone = "UTC",
    includeCompleted = false,
    includeDescription = true
  } = options

  const now = new Date()
  const nowString = format(now, "yyyyMMdd'T'HHmmss'Z'")

  let ical = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Íris Task Manager//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${calendarName}`,
    `X-WR-TIMEZONE:${timezone}`,
    ""
  ].join("\r\n")

  tasks.forEach((task) => {
    if (!task.due_date) return
    if (!includeCompleted && task.completed) return

    const dueDate = new Date(task.due_date)
    const startDate = format(dueDate, "yyyyMMdd'T'HHmmss'Z'")
    
    // Para tarefas sem hora específica, definir como dia inteiro
    const isAllDay = dueDate.getHours() === 0 && dueDate.getMinutes() === 0
    
    let event = [
      "BEGIN:VEVENT",
      `UID:task-${task.id}@iris-task-manager`,
      `DTSTAMP:${nowString}`,
      isAllDay 
        ? `DTSTART;VALUE=DATE:${format(dueDate, "yyyyMMdd")}`
        : `DTSTART:${startDate}`,
      isAllDay 
        ? `DTEND;VALUE=DATE:${format(dueDate, "yyyyMMdd")}`
        : `DTEND:${startDate}`,
      `SUMMARY:${escapeICalText(task.title)}`,
    ]

    if (includeDescription && task.description) {
      event.push(`DESCRIPTION:${escapeICalText(task.description)}`)
    }

    if (task.project) {
      event.push(`CATEGORIES:${escapeICalText(task.project.name)}`)
    }

    if (task.priority) {
      event.push(`PRIORITY:${task.priority}`)
    }

    if (task.completed) {
      event.push("STATUS:COMPLETED")
    } else {
      event.push("STATUS:NEEDS-ACTION")
    }

    event.push("END:VEVENT")
    ical += "\r\n" + event.join("\r\n")
  })

  ical += "\r\nEND:VCALENDAR"

  return ical
}

function escapeICalText(text: string): string {
  return text
    .replace(/[\\;,]/g, "\\$&")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
}

export function downloadICalFile(
  tasks: Todo[], 
  filename: string = "iris-calendar.ics",
  options?: ICalExportOptions
): void {
  const content = generateICalContent(tasks, options)
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getCalendarStats(tasks: Todo[]) {
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const pending = total - completed
  const overdue = tasks.filter(t => {
    if (t.completed || !t.due_date) return false
    return new Date(t.due_date) < new Date()
  }).length

  return {
    total,
    completed,
    pending,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  }
} 