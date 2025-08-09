"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { sql } from "@codemirror/lang-sql"
import { markdown } from "@codemirror/lang-markdown"
import { EditorView } from "@codemirror/view"

type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  className?: string
  readOnly?: boolean
}

function getExtensions(language?: string) {
  switch (language) {
    case "ts":
      return [javascript({ typescript: true })]
    case "js":
      return [javascript()]
    case "py":
      return [python()]
    case "sql":
      return [sql()]
    case "md":
      return [markdown()]
    default:
      return []
  }
}

export function CodeEditor({ value, onChange, language, height = "300px", className }: CodeEditorProps) {
  const [themeKey, setThemeKey] = useState(0)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const target = document.documentElement
    let lastIsDark = target.classList.contains('dark')
    const observer = new MutationObserver(() => {
      const nowIsDark = target.classList.contains('dark')
      if (nowIsDark !== lastIsDark) {
        lastIsDark = nowIsDark
        setThemeKey(prev => prev + 1)
      }
    })
    observer.observe(target, { attributes: true, attributeFilter: ['class'] })
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const onMQ = () => setThemeKey(prev => prev + 1)
    mql.addEventListener?.('change', onMQ)
    return () => {
      observer.disconnect()
      mql.removeEventListener?.('change', onMQ)
    }
  }, [])

  const theme = useMemo(() => {
    if (typeof window === 'undefined') return []
    const styles = getComputedStyle(document.documentElement)
    const coolGlow = (styles.getPropertyValue('--code-foreground') || styles.getPropertyValue('--cool-glow') || '').trim()
    const fallbackCoolGlow = '#00eaff'
    const foreground = (coolGlow || styles.getPropertyValue('--foreground'))?.trim() || fallbackCoolGlow
    const muted = styles.getPropertyValue('--muted')?.trim() || '#111827'
    const primary = styles.getPropertyValue('--primary')?.trim() || foreground || fallbackCoolGlow
    const isDark = document.documentElement.classList.contains('dark')
    const bg = (() => {
      if (wrapperRef.current) {
        return getComputedStyle(wrapperRef.current).backgroundColor || 'transparent'
      }
      return getComputedStyle(document.body).backgroundColor || 'transparent'
    })()
    return EditorView.theme({
      '&': { backgroundColor: bg, color: foreground },
      '.cm-editor': { backgroundColor: bg },
      '.cm-scroller': { backgroundColor: bg },
      '.cm-content': { caretColor: primary },
      '&.cm-editor.cm-focused': { outline: 'none' },
      '.cm-gutters': { backgroundColor: bg, color: (foreground + 'B3'), border: 'none' },
      '.cm-activeLineGutter': { backgroundColor: isDark ? muted : primary + '10' },
      '.cm-activeLine': { backgroundColor: isDark ? muted : primary + '10' },
      '.cm-selectionBackground, & ::selection': { backgroundColor: primary + '33' },
    }, { dark: isDark })
  }, [themeKey])

  return (
    <div ref={wrapperRef} className={className}>
      <CodeMirror
        value={value}
        height={height}
        extensions={[...getExtensions(language), theme]}
        onChange={(v) => onChange(v)}
        basicSetup={{ lineNumbers: true, highlightActiveLine: true, bracketMatching: true, foldGutter: true }}
      />
    </div>
  )
}


