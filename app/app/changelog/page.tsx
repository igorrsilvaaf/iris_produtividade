"use client"

import React from 'react'
import { FileText } from 'lucide-react'
import { getChangelogData } from '@/lib/changelog-data'
import { ChangelogEntry } from '@/components/changelog-entry'
import { useTranslation } from '@/lib/i18n'

export default function ChangelogPage() {
  const { t } = useTranslation()
  const changelogData = getChangelogData()

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <div className="p-2 bg-primary/10 rounded-full">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">{t('changelog')}</h1>
      </div>
      
      <div className="pb-12">
        {changelogData.map((entry, index) => (
          <ChangelogEntry
            key={`${entry.version}-${index}`}
            date={entry.date}
            version={entry.version}
            author={entry.author}
            entries={entry.entries}
            isNew={entry.isNew}
          />
        ))}
      </div>
    </div>
  )
} 