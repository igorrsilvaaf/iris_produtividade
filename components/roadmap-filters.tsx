"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export function RoadmapFilters({ status, type, q }: { status?: string; type?: string; q?: string }) {
  const [query, setQuery] = React.useState(q || "")
  const [st, setSt] = React.useState(status || "all")
  const [tp, setTp] = React.useState(type || "all")

  const router = useRouter()

  const doFilter = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (st && st !== 'all') params.set("status", st)
    if (tp && tp !== 'all') params.set("type", tp)
    const qs = params.toString()
    router.push(qs ? `/app/roadmap?${qs}` : "/app/roadmap")
  }

  return (
    <form onSubmit={doFilter} className="flex flex-wrap items-center gap-2">
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar feedbacks..." className="w-64" />
      <Select value={st} onValueChange={setSt}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="open">Em triagem</SelectItem>
          <SelectItem value="planned">Planejado</SelectItem>
          <SelectItem value="inProgress">Em progresso</SelectItem>
          <SelectItem value="done">Concluído</SelectItem>
          <SelectItem value="declined">Recusado</SelectItem>
        </SelectContent>
      </Select>
      <Select value={tp} onValueChange={setTp}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="bug">Bug</SelectItem>
          <SelectItem value="suggestion">Sugestão</SelectItem>
          <SelectItem value="ux">UX</SelectItem>
          <SelectItem value="performance">Performance</SelectItem>
          <SelectItem value="integration">Integração</SelectItem>
        </SelectContent>
      </Select>
      <button type="submit" className="inline-flex items-center rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm">Filtrar</button>
    </form>
  )
}


