import { ChangelogItem } from "@/components/changelog-entry"

interface ChangelogData {
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

export const CHANGELOG_DATA: ChangelogData[] = [
  {
    date: new Date(),
    version: '2.2.0',
    author: {
      name: 'Igor Silva',
      role: 'Desenvolvedor',
      initials: 'IS'
    },
    entries: [
      {
        id: 'notification-system',
        title: 'Sistema de Notificações de Tarefas',
        description: 'Implementação de um sistema completo de notificações para tarefas',
        items: [
          {
            type: 'feature',
            content: 'Adicionado sistema de notificações para tarefas atrasadas, tarefas de hoje e tarefas próximas'
          },
          {
            type: 'feature',
            content: 'Notificações sonoras quando novas tarefas estiverem disponíveis'
          },
          {
            type: 'feature',
            content: 'Notificações de desktop para alertar sobre tarefas pendentes'
          },
          {
            type: 'feature',
            content: 'Capacidade de marcar tarefas como concluídas diretamente a partir do menu de notificações'
          },
          {
            type: 'feature',
            content: 'Nova página de notificações para visualizar todas as tarefas que precisam de atenção'
          },
          {
            type: 'improvement',
            content: 'Integração com as configurações do usuário para controlar notificações sonoras e de desktop'
          },
          {
            type: 'improvement',
            content: 'Possibilidade de configurar quantos dias à frente o sistema deve verificar para tarefas'
          },
          {
            type: 'improvement',
            content: 'Código refatorado para usar a biblioteca de áudio centralizada para todas as notificações sonoras'
          },
          {
            type: 'bugfix',
            content: 'Corrigido problema que impedia a marcação correta de notificações como lidas'
          }
        ]
      }
    ],
    isNew: true
  },
  {
    date: new Date('2024-04-15'),
    version: '2.1.0',
    author: {
      name: 'Igor Silva',
      role: 'Desenvolvedor',
      initials: 'IS'
    },
    entries: [
      {
        id: 'recent-updates',
        title: 'Melhoria na Interface do Usuário',
        description: 'Atualizações recentes para melhorar a experiência do usuário',
        items: [
          {
            type: 'feature',
            content: 'Adicionada página de Changelog para acompanhar as novidades do sistema'
          },
          {
            type: 'improvement',
            content: 'Melhorado o estilo e comportamento dos checkboxes em descrições de tarefas'
          },
          {
            type: 'improvement',
            content: 'Adicionado suporte para marcar texto como concluído nas listas de verificação'
          },
          {
            type: 'improvement',
            content: 'Melhorada a interação com links nas descrições de tarefas'
          },
          {
            type: 'improvement',
            content: 'Melhor suporte para itens com marcadores (bullets) em descrições'
          },
          {
            type: 'bugfix',
            content: 'Corrigido problema com duplicação do botão de adicionar etiquetas'
          },
          {
            type: 'bugfix',
            content: 'Corrigido problema em que os checkboxes não respondiam adequadamente aos cliques'
          }
        ]
      }
    ],
    isNew: false
  },
  {
    date: new Date('2024-01-10'),
    version: '1.0.0',
    author: {
      name: 'Igor Silva',
      role: 'Desenvolvedor',
      initials: 'IS'
    },
    entries: [
      {
        id: 'initial-release',
        title: 'Lançamento Inicial',
        description: 'Primeira versão pública do To-Do-Ist',
        items: [
          {
            type: 'feature',
            content: 'Criação e gerenciamento de tarefas'
          },
          {
            type: 'feature',
            content: 'Organização em projetos'
          },
          {
            type: 'feature',
            content: 'Definição de prioridades e datas de vencimento'
          },
          {
            type: 'feature',
            content: 'Visualização de tarefas por dia, semana e mês'
          },
          {
            type: 'feature',
            content: 'Tema claro/escuro'
          }
        ]
      }
    ]
  }
]

export function getChangelogData(): ChangelogData[] {
  return CHANGELOG_DATA
} 