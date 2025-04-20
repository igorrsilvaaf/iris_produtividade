"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getChangelogData } from '@/lib/changelog-data'
import { useTranslation } from '@/lib/i18n'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function ChangelogNotification() {
  const [open, setOpen] = useState(false)
  const [latestChangelog, setLatestChangelog] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  // Detectar quando está no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    // Adicionar um estilo ao botão de fechar
    const style = document.createElement('style')
    style.innerHTML = `
      .changelog-dialog [data-state="open"].dialog-close {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 9999px;
        height: 2rem;
        width: 2rem;
        right: 1rem;
        top: 1rem;
      }
      .changelog-dialog [data-state="open"].dialog-close:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    
    const checkForNewChangelog = () => {
      const changelogData = getChangelogData()
      const newChanges = changelogData.filter(item => item.isNew)
      
      if (newChanges.length === 0) return
      
      const latestNewVersion = newChanges[0].version
      
      // Forçar a exibição da notificação para a versão 2.7.0
      if (latestNewVersion === '2.7.0') {
        localStorage.removeItem('lastSeenChangelogVersion')
      }
      
      const lastSeenVersion = localStorage.getItem('lastSeenChangelogVersion')
      
      if (lastSeenVersion !== latestNewVersion) {
        setLatestChangelog(latestNewVersion)
        setOpen(true)
      }
    }
    
    const timer = setTimeout(checkForNewChangelog, 1500)
    
    return () => clearTimeout(timer)
  }, [isClient])

  const handleDismiss = () => {
    if (latestChangelog) {
      localStorage.setItem('lastSeenChangelogVersion', latestChangelog)
    }
    setOpen(false)
  }

  const handleViewChangelog = () => {
    if (latestChangelog) {
      localStorage.setItem('lastSeenChangelogVersion', latestChangelog)
    }
    setOpen(false)
    router.push('/app/changelog')
  }

  if (!open || !latestChangelog) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className={cn(
          "sm:max-w-[550px] md:max-w-[650px] rounded-xl p-0 overflow-hidden border-none shadow-xl changelog-dialog"
        )}
      >
        <div className="bg-gradient-to-r from-primary/80 to-primary p-6 text-white">
          <DialogHeader className="text-white pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <motion.div
                initial={{ rotate: -20, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  delay: 0.1
                }}
              >
                <Sparkles className="h-6 w-6 mr-1" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {t('newChanges')}
              </motion.span>
              <motion.span 
                className="text-sm bg-white/30 px-2 py-0.5 rounded-full ml-2 font-mono"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                v{latestChangelog}
              </motion.span>
            </DialogTitle>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <DialogDescription className="text-white/90 mt-1">
                {t('newChangesDescription')}
              </DialogDescription>
            </motion.div>
          </DialogHeader>
        </div>
        
        <div className="p-5">
          <motion.div
            className="border-l-4 border-primary/30 pl-3 py-2 mb-4 rounded-sm bg-primary/5"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <p className="text-sm text-muted-foreground">
              {latestChangelog === '2.7.0' ? (
                <>
                  <span className="font-medium text-primary">Sistema de Relatórios Aprimorado</span>
                  <br />
                  Agora você pode exportar relatórios em três formatos diferentes: Web, PDF e Excel. 
                  O novo formato PDF inclui cabeçalhos em todas as páginas e estatísticas 
                  com design consistente para uma experiência profissional.
                  <br /><br />
                  <span className="font-medium">Como acessar:</span> Vá para o menu principal e clique em "Relatórios" 
                  ou acesse diretamente em <span className="text-primary cursor-pointer hover:underline" 
                  onClick={() => { setOpen(false); router.push('/app/reports'); }}>
                    Relatórios
                  </span>.
                </>
              ) : (
                t('latestUpdateInfo')
              )}
            </p>
          </motion.div>
        
          <DialogFooter className="flex flex-row justify-between gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="h-10 px-5"
            >
              {t('dismiss')}
            </Button>
            <Button 
              onClick={handleViewChangelog}
              className="h-10 bg-primary hover:bg-primary/90 gap-1 group px-5"
            >
              {t('viewChangelog')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
} 