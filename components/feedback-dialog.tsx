"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Lightbulb, Send, ThumbsUp } from "lucide-react"
import { toast } from "@/hooks/use-toast"

type Props = { className?: string }

export function FeedbackDialog({ className }: Props) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [type, setType] = React.useState("suggestion")
  const [severity, setSeverity] = React.useState("medium")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")

  const submit = async () => {
    const t = title.trim()
    const d = description.trim()
    if (!t || !d || loading) return
    setLoading(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ type, severity, title: t, description: d }),
      })
      if (res.ok) {
        setTitle("")
        setDescription("")
        setOpen(false)
        toast({ title: "Feedback enviado", description: "Obrigado por contribuir" })
      } else {
        const err = await res.json().catch(() => ({}))
        console.error("Feedback error", err)
        toast({ title: "Falha ao enviar feedback", description: err?.error || "Tente novamente" })
      }
    } catch (e: any) {
      console.error("Feedback network error", e)
      toast({ title: "Falha de rede", description: "Não foi possível contatar o servidor." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="icon"
          className={cn(
            "h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg",
            open ? "animate-wiggle" : "animate-pulse-glow",
            className
          )}
        >
          <Lightbulb className="h-7 w-7 sm:h-8 sm:w-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar Feedback</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="suggestion">Sugestão</SelectItem>
                <SelectItem value="ux">UX</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="integration">Integração</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Impacto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea rows={6} placeholder="Descreva seu feedback" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="button" onClick={submit} disabled={loading || !title.trim() || !description.trim()}>
              <Send className="h-4 w-4" />
              <span className="ml-2">Enviar</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function FeedbackUpvoteButton({ id, initialUpvotes, disabled }: { id: number; initialUpvotes?: number; disabled?: boolean }) {
  const [count, setCount] = React.useState(initialUpvotes ?? 0)
  const [done, setDone] = React.useState(false)

  const upvote = async () => {
    if (done || disabled) return
    setDone(true)
    setCount((c) => c + 1)
    await fetch(`/api/feedback/${id}/upvote`, { method: "POST", credentials: "include" })
  }

  return (
    <Button type="button" size="sm" variant={done ? "secondary" : "default"} onClick={upvote} disabled={done || disabled}>
      <ThumbsUp className="h-4 w-4" />
      <span className="ml-1 text-xs">{count}</span>
    </Button>
  )
}


