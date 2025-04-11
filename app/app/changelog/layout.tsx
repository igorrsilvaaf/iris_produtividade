import React from 'react'

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
} 