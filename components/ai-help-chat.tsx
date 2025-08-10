"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, Send, X } from "lucide-react"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export function AIHelpChat() {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const endRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("ai-help-chat-history")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          const safe: ChatMessage[] = parsed
            .map((m: any) => {
              const role: ChatMessage["role"] = m?.role === "assistant" ? "assistant" : "user"
              const content = typeof m?.content === "string" ? m.content : ""
              return { role, content }
            })
          setMessages(safe)
        }
      }
    } catch {}
  }, [])

  React.useEffect(() => {
    try {
      localStorage.setItem("ai-help-chat-history", JSON.stringify(messages))
    } catch {}
  }, [messages])

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, loading, open])

  React.useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setTimeout(() => inputRef.current?.focus(), 0))
      return () => cancelAnimationFrame(id)
    }
  }, [open])

  const send = async () => {
    const value = input.trim()
    if (!value || loading) return
    const userMessage: ChatMessage = { role: "user", content: value }
    const next: ChatMessage[] = [...messages, userMessage]
    setMessages(next)
    setInput("")
    setLoading(true)
    inputRef.current?.focus()
    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: next.slice(-10) }),
      })
      if (res.ok) {
        const data = await res.json()
        const reply: string = data.reply || ""
        const assistantMessage: ChatMessage = { role: "assistant", content: reply }
        setMessages((prev) => [...prev, assistantMessage])
      } else if (res.status === 401) {
        const assistantMessage: ChatMessage = { role: "assistant", content: "Você precisa estar logado para usar a ajuda por IA." }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        let errorText = "Não foi possível obter uma resposta agora."
        try {
          const err = await res.json()
          if (typeof err?.error === "string" && err.error.trim().length > 0) {
            errorText = err.error
          }
        } catch {}
        const assistantMessage: ChatMessage = { role: "assistant", content: errorText }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch {
      const assistantMessage: ChatMessage = { role: "assistant", content: "Falha de rede. Tente novamente." }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  React.useEffect(() => {
    if (open && !loading) {
      inputRef.current?.focus()
    }
  }, [messages, open, loading])

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          type="button"
          size="icon"
          className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg ${open ? "animate-wiggle" : "animate-pulse-glow"}`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen((v) => {
              const next = !v
              if (!v && next) {
                setTimeout(() => inputRef.current?.focus(), 50)
              }
              return next
            })
          }}
        >
          {open ? <X className="h-6 w-6 sm:h-7 sm:w-7" /> : <Bot className="h-7 w-7 sm:h-8 sm:w-8" />}
        </Button>
      </div>

      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-[92vw] max-w-sm sm:max-w-md">
          <Card className="border shadow-xl bg-background text-foreground">
            <div className="px-3 py-2 border-b text-sm font-medium">Ajuda Rápida</div>
            <div className="h-80">
              <ScrollArea className="h-full px-3 py-2">
                <div className="space-y-3">
                  {messages.length === 0 && (
                    <div className="text-sm text-muted-foreground">Faça uma pergunta sobre o app.</div>
                  )}
                  {messages.map((m, idx) => (
                    <div key={idx} className={m.role === "user" ? "text-right" : "text-left"}>
                      <div className={
                        m.role === "user"
                          ? "inline-block rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm"
                          : "inline-block rounded-lg bg-muted px-3 py-2 text-sm"
                      }>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="text-left">
                      <div className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-2">
                        <span className="sr-only">Digitando</span>
                        <span className="h-2 w-2 rounded-full bg-foreground/70 animate-typing" />
                        <span className="h-2 w-2 rounded-full bg-foreground/70 animate-typing [animation-delay:.15s]" />
                        <span className="h-2 w-2 rounded-full bg-foreground/70 animate-typing [animation-delay:.3s]" />
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              </ScrollArea>
            </div>
            <div className="flex items-center gap-2 p-3 border-t">
              <Input
                placeholder="Digite sua pergunta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={loading}
                ref={inputRef}
              />
              <Button type="button" size="icon" onClick={(e) => { e.preventDefault(); e.stopPropagation(); send(); }} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}


