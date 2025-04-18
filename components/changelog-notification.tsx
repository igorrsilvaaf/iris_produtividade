"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getChangelogData } from '@/lib/changelog-data'
import { useTranslation } from '@/lib/i18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function ChangelogNotification() {
  const [open, setOpen] = useState(false)
  const [latestChangelog, setLatestChangelog] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    const checkForNewChangelog = () => {
      const changelogData = getChangelogData()
      
      // Verificar se existem novidades no changelog (marcadas com isNew: true)
      const newChanges = changelogData.filter(item => item.isNew)
      
      if (newChanges.length === 0) return
      
      // Obter a versão mais recente que tem novidades
      const latestNewVersion = newChanges[0].version
      
      // Verificar no localStorage a última versão visualizada pelo usuário
      const lastSeenVersion = localStorage.getItem('lastSeenChangelogVersion')
      
      // Se a versão mais recente for diferente da última vista, mostrar a notificação
      if (lastSeenVersion !== latestNewVersion) {
        setLatestChangelog(latestNewVersion)
        setOpen(true)
      }
    }
    
    // Verificar após um curto delay para garantir que outros componentes foram carregados
    const timer = setTimeout(checkForNewChangelog, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    if (latestChangelog) {
      // Salvar a versão atual como vista no localStorage
      localStorage.setItem('lastSeenChangelogVersion', latestChangelog)
    }
    setOpen(false)
  }

  const handleViewChangelog = () => {
    if (latestChangelog) {
      // Salvar a versão atual como vista no localStorage
      localStorage.setItem('lastSeenChangelogVersion', latestChangelog)
    }
    setOpen(false)
    // Navegar para a página de changelog
    router.push('/app/changelog')
  }

  if (!open || !latestChangelog) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t('newChanges')}
            <span className="text-sm text-muted-foreground ml-2">
              v{latestChangelog}
            </span>
          </DialogTitle>
          <DialogDescription>
            {t('newChangesDescription')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 justify-between">
          <Button variant="outline" onClick={handleDismiss}>
            {t('dismiss')}
          </Button>
          <Button onClick={handleViewChangelog}>
            {t('viewChangelog')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 