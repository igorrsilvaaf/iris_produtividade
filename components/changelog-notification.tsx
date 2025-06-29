"use client"

import { useEffect, useState, useCallback } from 'react'
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
import { cn } from '@/lib/utils'

export function ChangelogNotification() {
  const [open, setOpen] = useState(false)
  const [latestChangelog, setLatestChangelog] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const markVersionAsSeen = (version: string) => {
    localStorage.setItem('lastSeenChangelogVersion', version)
    
    const dismissedVersions = localStorage.getItem('dismissedChangelogVersions')
    const dismissedArray = dismissedVersions ? JSON.parse(dismissedVersions) : []
    
    if (!dismissedArray.includes(version)) {
      dismissedArray.push(version)
      localStorage.setItem('dismissedChangelogVersions', JSON.stringify(dismissedArray))
    }
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
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
      const lastSeenVersion = localStorage.getItem('lastSeenChangelogVersion')

      if (lastSeenVersion !== latestNewVersion) {
        const dismissedVersions = localStorage.getItem('dismissedChangelogVersions')
        const dismissedArray = dismissedVersions ? JSON.parse(dismissedVersions) : []
        
        if (!dismissedArray.includes(latestNewVersion)) {
          setLatestChangelog(latestNewVersion)
          setOpen(true)
        }
      }
    }
    
    checkForNewChangelog()
    
    const initialTimer = setTimeout(checkForNewChangelog, 2000)
    const periodicTimer = setInterval(checkForNewChangelog, 2 * 60 * 60 * 1000)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'lastSeenChangelogVersion' || e.key === 'dismissedChangelogVersions') {
        checkForNewChangelog()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForNewChangelog()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearTimeout(initialTimer)
      clearInterval(periodicTimer)
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isClient])

  useEffect(() => {
    if (!isClient) return
    
    const handleNavigateToChangelog = () => {
      const changelogData = getChangelogData()
      const newChanges = changelogData.filter(item => item.isNew)
      
      if (newChanges.length > 0) {
        const latestNewVersion = newChanges[0].version
        markVersionAsSeen(latestNewVersion)
        setOpen(false)
      }
    }
    
    window.addEventListener('navigateToChangelog', handleNavigateToChangelog)
    
    if (typeof window !== 'undefined' && window.location.pathname.includes('/app/changelog')) {
      handleNavigateToChangelog()
    }
    
    return () => {
      window.removeEventListener('navigateToChangelog', handleNavigateToChangelog)
    }
  }, [isClient])

  const handleDismiss = () => {
    if (latestChangelog) {
      markVersionAsSeen(latestChangelog)
    }
    setOpen(false)
  }

  const handleViewChangelog = () => {
    if (latestChangelog) {
      markVersionAsSeen(latestChangelog)
    }
    setOpen(false)
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('navigateToChangelog'))
    }
    
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
              <div className="mr-1">
                <Sparkles className="h-6 w-6" />
              </div>
              <span>
                {t('newChanges')}
              </span>
              <span className="text-sm bg-white/30 px-2 py-0.5 rounded-full ml-2 font-mono">
                v{latestChangelog}
              </span>
            </DialogTitle>
            <div>
              <DialogDescription className="text-white/90 mt-1">
                {t('newChangesDescription')}
              </DialogDescription>
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-5">
          <div className="border-l-4 border-primary/30 pl-3 py-2 mb-4 rounded-sm bg-primary/5">
            <p className="text-sm text-muted-foreground">
              {latestChangelog === '2.8.2' ? (
                <>
                  <span className="font-medium text-primary">Sistema de Comentários em Tarefas</span>
                  <br />
                  Agora você pode comentar em suas tarefas, assim como no Trello! Adicionamos um sistema completo 
                  de comentários que permite interação e colaboração diretamente nas tarefas.
                  <br /><br />
                  <span className="font-medium">Novas funcionalidades:</span> Criar, visualizar, editar e deletar 
                  comentários próprios. Interface intuitiva com avatar do usuário, nome e data. Ícone de lixeira 
                  vermelho para deletar e menu dropdown para editar comentários.
                  <br /><br />
                  <span className="font-medium text-primary">Melhorias no Layout</span>
                  <br />
                  Também padronizamos o visual entre projetos e etiquetas com formato de chip/badge colorido, 
                  e melhoramos os estados de carregamento em toda a aplicação para uma experiência mais consistente.
                  <br /><br />
                  <span className="font-medium">Como usar:</span> Abra qualquer tarefa e role até a seção de comentários 
                  na parte inferior. Digite seu comentário e clique em "Adicionar Comentário" para participar da conversa!
                </>
              ) : latestChangelog === '2.8.1' ? (
                <>
                  <span className="font-medium text-primary">Relatórios Aprimorados com Pontos e Tempo Estimado</span>
                  <br />
                  Seus relatórios ficaram ainda mais poderosos! Agora você pode incluir análises de pontos 
                  e tempo estimado em todos os formatos de relatório (Web, PDF e Excel), proporcionando 
                  insights mais profundos sobre sua produtividade.
                  <br /><br />
                  <span className="font-medium">Novas funcionalidades:</span> Estatísticas de pontos totais, 
                  média de dificuldade, tempo total estimado e tempo médio. Nos relatórios Web, você encontrará 
                  um novo gráfico de distribuição de pontos para análise visual.
                  <br /><br />
                  <span className="font-medium text-primary">Suporte a Markdown nas Tarefas</span>
                  <br />
                  Também adicionamos suporte completo a markdown nas descrições de tarefas! Formate seu texto 
                  com negrito, itálico, listas, títulos, links e blocos de código usando a sintaxe markdown 
                  como <code>**negrito**</code>, <code>*itálico*</code>, <code># título</code>, etc.
                  <br /><br />
                  <span className="font-medium">Melhorias na usabilidade:</span> As tabelas dos relatórios Web 
                  agora têm colunas redimensionáveis e tooltips para melhor visualização dos dados.
                </>
              ) : latestChangelog === '2.8.0' ? (
                <>
                  <span className="font-medium text-primary">Histórico de Pomodoro e Melhorias na Interface</span>
                  <br />
                  Adicionamos um histórico completo para o Pomodoro! Agora você pode visualizar todas as suas sessões anteriores, com detalhes de data, duração e tipo (trabalho ou pausa). A interface foi aprimorada com alinhamento centralizado e melhor organização visual.
                  <br /><br />
                  Também incluímos integração com o Deezer como alternativa ao Spotify, e aprimoramos o sistema de arrastar e soltar para uma experiência mais fluida tanto nas playlists quanto no quadro Kanban.
                  <br /><br />
                  <span className="font-medium">Novidades:</span> O botão de configurações do Pomodoro foi reposicionado para facilitar o acesso, e o seletor de tarefas agora tem a mesma largura do timer para uma aparência mais consistente.
                  <br /><br />
                  <span className="font-medium text-red-600">Correção importante:</span> Resolvemos um problema que impedia o registro das sessões de Pomodoro em dispositivos móveis. Agora você pode usar o timer Pomodoro em smartphones e tablets, e todas as suas sessões serão registradas corretamente no histórico.
                </>
              ) : latestChangelog === '2.7.1' ? (
                <>
                  <span className="font-medium text-primary">Melhorias no Temporizador Pomodoro</span>
                  <br />
                  Aprimoramos significativamente o temporizador Pomodoro! Agora, a transição entre os modos de trabalho e pausa aguarda seu comando. Adicionamos também um feedback visual dinâmico com cores que mudam conforme o modo ativo, e garantimos que suas configurações sejam consistentes em toda a aplicação.
                  <br /><br />
                  <span className="font-medium">Detalhes:</span> Corrigimos bugs importantes, incluindo o erro de "profundidade máxima de atualização" e problemas na sincronização das configurações entre diferentes partes do app.
                </>
              ) : latestChangelog === '2.7.0' ? (
                <>
                  <span className="font-medium text-primary">Melhorias nas Tarefas e Player do Spotify</span>
                  <br />
                  Adicionamos novas funcionalidades para melhorar o gerenciamento das suas tarefas: 
                  tempo estimado para conclusão com suporte a diferentes unidades (minutos, horas, dias) 
                  e um sistema completo de anexos que permite adicionar links, imagens e arquivos às suas tarefas.
                  <br /><br />
                  Além disso, agora você pode ouvir suas playlists favoritas do Spotify enquanto trabalha! 
                  Configure sua playlist nas configurações do sistema e o player ficará disponível em todas as páginas.
                  <br /><br />
                  <span className="font-medium">Como usar:</span> Ao criar ou editar uma tarefa, você encontrará 
                  os novos campos para definir o tempo estimado e gerenciar anexos. Para configurar o Spotify, 
                  acesse as configurações e vá até a aba "Spotify". Cole o link da sua playlist favorita e aproveite!
                </>
              ) : latestChangelog === '2.6.0' ? (
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
          </div>
        
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