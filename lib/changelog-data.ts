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
    isNew: true
  },
  {
    date: new Date('2024-10-10'),
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