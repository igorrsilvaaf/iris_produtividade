"use client"

import React from 'react'
import { useTranslation } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { ptBR, enUS } from 'date-fns/locale'

export interface ChangelogItem {
  id: string
  title: string
  description?: string
  items: {
    type: 'feature' | 'improvement' | 'bugfix'
    content: string
  }[]
}

export interface ChangelogEntryProps {
  date: Date
  version: string
  author?: {
    name: string
    role?: string
    initials?: string
  }
  entries: ChangelogItem[]
  isNew?: boolean
}

export function ChangelogEntry({ 
  date, 
  version, 
  author, 
  entries, 
  isNew = false 
}: ChangelogEntryProps) {
  const { t, language } = useTranslation()
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return t('newFeatures')
      case 'improvement':
        return t('improvements')
      case 'bugfix':
        return t('bugFixes')
      default:
        return type
    }
  }

  // Determinar o locale baseado no idioma atual
  const locale = language === 'pt' ? ptBR : enUS

  return (
    <div className="mb-16">
      <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4 sm:justify-between">
        <div>
          <div className="text-sm text-muted-foreground">
            {format(date, 'MMMM d', { locale })}
          </div>
          <h2 className="text-2xl font-bold flex flex-wrap items-center gap-2">
            {entries[0].title}
            <span className="text-muted-foreground text-base font-normal ml-2">v{version}</span>
            {isNew && (
              <Badge className="bg-blue-500 hover:bg-blue-500/90">
                {t('new')}
              </Badge>
            )}
          </h2>
        </div>
        
        {author && (
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Avatar className="h-8 w-8 bg-gray-300">
              <AvatarFallback>{author.initials || author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium">{author.name}</div>
              {author.role && (
                <div className="text-xs text-muted-foreground">{author.role}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        {entries.map((entry) => (
          <div key={entry.id} className="space-y-4">
            {entry.description && (
              <p className="text-muted-foreground">{entry.description}</p>
            )}
            
            <div className="space-y-6">
              {['feature', 'improvement', 'bugfix'].map((type) => {
                const items = entry.items.filter(item => item.type === type)
                if (items.length === 0) return null
                
                return (
                  <div key={type} className="space-y-2">
                    <h3 className="text-sm font-medium">{getTypeLabel(type)}</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {items.map((item, index) => (
                        <li key={index} className="text-sm">{item.content}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 