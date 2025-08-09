"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/lib/i18n"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Project } from "@/lib/projects"
import { CodeEditor } from "@/components/ui/code-editor"

type Snippet = {
  id: number
  title: string
  content: string
  language: string | null
  project_id: number | null
  tags?: any
  created_at: string
}

export default function SnippetsPage() {
  const { t } = useTranslation()
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [language, setLanguage] = useState<string>("none")
  const [projectId, setProjectId] = useState<string>("none")
  const [projects, setProjects] = useState<Project[]>([])
  const [query, setQuery] = useState("")

  const fetchSnippets = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (projectId && projectId !== "none") params.set("projectId", projectId)
      if (language && language !== "none") params.set("language", language)
      if (query.trim()) params.set("q", query.trim())
      const res = await fetch(`/api/snippets?${params.toString()}`)
      const data = await res.json()
      setSnippets(data.snippets || [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSnippets()
  }, [projectId, language])

  useEffect(() => {
    const loadProjects = async () => {
      const res = await fetch("/api/projects")
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects || [])
      }
    }
    loadProjects()
  }, [])

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return
    const res = await fetch("/api/snippets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content, language: language !== 'none' ? language : undefined, projectId: projectId !== 'none' ? Number(projectId) : undefined }),
    })
    if (res.ok) {
      setTitle("")
      setContent("")
      setLanguage("none")
      setProjectId("none")
      fetchSnippets()
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t("snippets.title", "Snippets")}</h1>
        <p className="text-muted-foreground">{t("snippets.subtitle", "Quick notes and code")}</p>
      </div>

      <Card className="mb-6">
        <CardHeader />
        <CardContent className="space-y-3">
          <Input placeholder={t("snippets.form.title", "Title")} value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={language} onValueChange={(v) => setLanguage(v)}>
            <SelectTrigger>
              <SelectValue placeholder={t("snippets.form.language", "Language")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("snippets.form.language", "Language")}</SelectItem>
              <SelectItem value="ts">TypeScript</SelectItem>
              <SelectItem value="js">JavaScript</SelectItem>
              <SelectItem value="py">Python</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
              <SelectItem value="md">Markdown</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectId} onValueChange={(v) => setProjectId(v)}>
            <SelectTrigger>
              <SelectValue placeholder={t("snippets.form.project", "Project")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("snippets.form.noProject", "No Project")}</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CodeEditor value={content} onChange={setContent} language={language === 'none' ? undefined : language} height="320px" />
          <div className="flex justify-end">
            <Button onClick={handleCreate} disabled={!title.trim() || !content.trim()} data-testid="snippets-save">
              {t("snippets.form.save", "Save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <Input placeholder={t("snippets.search.placeholder", "Search")} value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button variant="outline" onClick={fetchSnippets}>{t("snippets.search.cta", "Search")}</Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : snippets.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("snippets.empty", "No snippets found")}</p>
        ) : (
          snippets.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{s.title}</div>
                  {s.language && <div className="text-xs text-muted-foreground">{s.language}</div>}
                </div>
                <CodeEditor value={s.content} onChange={() => {}} language={s.language ?? undefined} height="240px" />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


