import React from "react"
import { requireAuth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card } from "@/components/ui/card"
import { FeedbackUpvoteButton } from "@/components/feedback-dialog"
import Link from "next/link"
import { RoadmapFilters } from "@/components/roadmap-filters"

export default async function RoadmapPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireAuth()

  const sp = await searchParams
  const status = sp.status || undefined
  const type = sp.type || undefined
  const q = sp.q || undefined
  const page = Math.max(parseInt(sp.page || '1', 10), 1)
  const limit = Math.min(Math.max(parseInt(sp.limit || '20', 10), 1), 100)
  const skip = (page - 1) * limit

  const where: any = {}
  if (status) where.status = status
  if (type) where.type = type
  if (q) where.OR = [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }]

  const [items, total] = await Promise.all([
    (prisma as any).feedback.findMany({ where, orderBy: [{ upvotes: 'desc' }, { created_at: 'desc' }], skip, take: limit }) as Promise<any[]>,
    (prisma as any).feedback.count({ where }) as Promise<number>
  ])
  const groups: Record<string, typeof items> = { open: [], triage: [], planned: [], inProgress: [], done: [], declined: [] }
  for (const it of items) {
    const key = (it.status as keyof typeof groups) || "open"
    ;(groups[key] ?? groups.open).push(it)
  }

  const renderCol = (status: string, title: string) => (
    <div className="space-y-3">
      <div className="text-sm font-semibold">{title}</div>
      {groups[status as keyof typeof groups]?.map((f: any) => (
        <Card key={f.id} className="p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">{f.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{f.description}</div>
              <div className="text-xs text-muted-foreground mt-2">Tipo: {f.type} • Impacto: {f.severity}</div>
            </div>
            <FeedbackUpvoteButton id={f.id} initialUpvotes={f.upvotes} />
          </div>
        </Card>
      ))}
    </div>
  )

  const totalPages = Math.max(Math.ceil(total / limit), 1)

  return (
    <div className="p-4 md:p-6 space-y-4">
      <RoadmapFilters status={status} type={type} q={q} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderCol("open", "Em triagem")}
        {renderCol("planned", "Planejado")}
        {renderCol("inProgress", "Em progresso")}
        {renderCol("done", "Concluído")}
      </div>
      <div className="flex items-center gap-2 justify-center">
        <Link href={{ pathname: '/app/roadmap', query: { q, status, type, page: Math.max(page-1,1), limit } }} className="text-sm underline opacity-80">Anterior</Link>
        <div className="text-xs text-muted-foreground">Página {page} de {totalPages}</div>
        <Link href={{ pathname: '/app/roadmap', query: { q, status, type, page: Math.min(page+1,totalPages), limit } }} className="text-sm underline opacity-80">Próxima</Link>
      </div>
    </div>
  )
}


