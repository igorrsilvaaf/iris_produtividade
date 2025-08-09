"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/lib/i18n"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Project } from "@/lib/projects"
import { CodeEditor } from "@/components/ui/code-editor"
import { DeleteSnippetDialog } from "@/components/delete-snippet-dialog"

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
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editContent, setEditContent] = useState("")
  const [editLanguage, setEditLanguage] = useState<string>("none")
  const [editProjectId, setEditProjectId] = useState<string>("none")

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

  const startEdit = (s: Snippet) => {
    setEditingId(s.id)
    setEditTitle(s.title)
    setEditContent(s.content)
    setEditLanguage(s.language ?? "none")
    setEditProjectId(s.project_id != null ? String(s.project_id) : "none")
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async () => {
    if (editingId == null) return
    const body: any = {
      title: editTitle.trim(),
      content: editContent,
    }
    if (editLanguage !== "none") body.language = editLanguage
    if (editProjectId !== "none") body.projectId = Number(editProjectId)
    const res = await fetch(`/api/snippets/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      const data = await res.json()
      const updated = data.snippet as Snippet
      setSnippets((prev) => prev.map((it) => (it.id === updated.id ? { ...it, ...updated } : it)))
      setEditingId(null)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{t("snippets.title")}</h1>
        <p className="text-muted-foreground">{t("snippets.subtitle")}</p>
      </div>

      <Card className="mb-6">
        <CardHeader />
        <CardContent className="space-y-3">
          <Input placeholder={t("snippets.form.title")} value={title} onChange={(e) => setTitle(e.target.value)} />
          <Select value={language} onValueChange={(v) => setLanguage(v)}>
            <SelectTrigger>
              <SelectValue placeholder={t("snippets.form.language")} />
            </SelectTrigger>
              <SelectContent>
               <SelectItem value="none">{t("plainText")}</SelectItem>
              <SelectItem value="ts">TypeScript</SelectItem>
              <SelectItem value="tsx">TSX</SelectItem>
              <SelectItem value="js">JavaScript</SelectItem>
              <SelectItem value="jsx">JSX</SelectItem>
              <SelectItem value="py">Python</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
              <SelectItem value="md">Markdown</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="yml">YML</SelectItem>
              <SelectItem value="bash">Bash</SelectItem>
              <SelectItem value="sh">Shell</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
              <SelectItem value="php">PHP</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="toml">TOML</SelectItem>
            </SelectContent>
          </Select>
          <Select value={projectId} onValueChange={(v) => setProjectId(v)}>
            <SelectTrigger>
              <SelectValue placeholder={t("snippets.form.project")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{t("snippets.form.noProject")}</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CodeEditor value={content} onChange={setContent} language={language === 'none' ? undefined : language} height="320px" />
          <div className="flex justify-end">
            <Button onClick={handleCreate} disabled={!title.trim() || !content.trim()} data-testid="snippets-save">{t("snippets.form.save")}</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <div className="flex items-center gap-2">
          <Input placeholder={t("snippets.search.placeholder")} value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button variant="outline" onClick={fetchSnippets}>{t("snippets.search.cta")}</Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : snippets.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("snippets.empty")}</p>
        ) : (
          snippets.map((s) => (
            <Card key={s.id}>
              <CardContent className="p-4 space-y-3">
                {editingId === s.id ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      <Select value={editLanguage} onValueChange={(v) => setEditLanguage(v)}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder={t("snippets.form.language")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t("plainText")}</SelectItem>
                          <SelectItem value="ts">TypeScript</SelectItem>
                          <SelectItem value="tsx">TSX</SelectItem>
                          <SelectItem value="js">JavaScript</SelectItem>
                          <SelectItem value="jsx">JSX</SelectItem>
                          <SelectItem value="py">Python</SelectItem>
                          <SelectItem value="sql">SQL</SelectItem>
                          <SelectItem value="md">Markdown</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="css">CSS</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="yaml">YAML</SelectItem>
                          <SelectItem value="yml">YML</SelectItem>
                          <SelectItem value="bash">Bash</SelectItem>
                          <SelectItem value="sh">Shell</SelectItem>
                          <SelectItem value="go">Go</SelectItem>
                          <SelectItem value="rust">Rust</SelectItem>
                          <SelectItem value="php">PHP</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="c">C</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                          <SelectItem value="xml">XML</SelectItem>
                          <SelectItem value="toml">TOML</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={editProjectId} onValueChange={(v) => setEditProjectId(v)}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder={t("snippets.form.project")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t("snippets.form.noProject")}</SelectItem>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <CodeEditor value={editContent} onChange={setEditContent} language={editLanguage === 'none' ? undefined : editLanguage} height="240px" />
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={cancelEdit}>{t("cancelButton")}</Button>
                      <Button onClick={saveEdit} disabled={!editTitle.trim() || !editContent.trim()}>{t("save")}</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{s.title}</div>
                      <div className="flex items-center gap-2">
                        {s.language && <div className="text-xs text-muted-foreground">{s.language}</div>}
                        <Button size="sm" variant="outline" onClick={() => startEdit(s)}>{t("edit")}</Button>
                        <DeleteSnippetDialog
                          snippetId={s.id}
                          onDeleted={(id) => setSnippets((prev) => prev.filter((it) => it.id !== id))}
                        >
                          <Button size="sm" variant="destructive">{t("Delete")}</Button>
                        </DeleteSnippetDialog>
                      </div>
                    </div>
                    <CodeEditor value={s.content} onChange={() => {}} language={s.language ?? undefined} height="240px" readOnly />
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}


