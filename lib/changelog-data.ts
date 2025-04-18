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
    version: '2.5.0',
    author: {
      name: 'Igor Silva',
      role: 'Desenvolvedor',
      initials: 'IS'
    },
    entries: [
      {
        id: 'pomodoro-interface-improvements',
        title: 'Melhorias na Interface do Pomodoro',
        description: 'Ajustes na interface do Pomodoro e correções de bugs importantes',
        items: [
          {
            type: 'improvement',
            content: 'Ocultação da descrição da tarefa no seletor do Pomodoro para uma interface mais limpa'
          },
          {
            type: 'improvement',
            content: 'Ajustes adicionais na interface para uma experiência mais focada durante as sessões'
          },
          {
            type: 'improvement',
            content: 'Otimização do layout do temporizador para melhor visualização em todos os dispositivos'
          },
          {
            type: 'bugfix',
            content: 'Corrigido erro "A `<Select.Item />` must have a value prop that is not an empty string" no seletor de tarefas do Pomodoro'
          },
          {
            type: 'bugfix',
            content: 'Resolvido problema com a exibição das tarefas disponíveis no seletor do Pomodoro'
          },
          {
            type: 'bugfix',
            content: 'Melhorada a estabilidade geral do componente Pomodoro'
          }
        ]
      }
    ],
    isNew: true
  },
  {
    date: new Date(),
    version: '2.4.0',
    author: {
      name: 'Igor Silva',
      role: 'Desenvolvedor',
      initials: 'IS'
    },
    entries: [
      {
        id: 'pomodoro-and-ui-improvements',
        title: 'Melhorias no Pomodoro e Interface',
        description: 'Atualizações na interface do usuário e correções no sistema Pomodoro',
        items: [
          {
            type: 'improvement',
            content: 'Adicionados efeitos visuais ao passar o mouse sobre botões e tarefas'
          },
          {
            type: 'improvement',
            content: 'Melhoria na visualização de descrições de tarefas com opção de expandir/recolher'
          },
          {
            type: 'improvement',
            content: 'Interface mais responsiva com feedback visual ao interagir com elementos'
          },
          {
            type: 'improvement',
            content: 'Tradução completa das configurações do Pomodoro para português'
          },
          {
            type: 'bugfix',
            content: 'Corrigido problema em que o botão de expandir descrição abria os detalhes da tarefa'
          },
          {
            type: 'bugfix',
            content: 'Corrigido problema com o botão "Iniciar Pomodoro" que abria a tarefa em vez de ir para a página do Pomodoro'
          },
          {
            type: 'bugfix',
            content: 'Corrigida duplicação de elementos na visualização de detalhes da tarefa'
          }
        ]
      }
    ],
    isNew: true
  },
  {
    date: new Date(),
    version: '2.3.0',
    author: {
      name: 'Igor Silva',
      role: 'Desenvolvedor',
      initials: 'IS'
    },
    entries: [
      {
        id: 'project-assignment-fix',
        title: 'Correção na Atribuição de Projetos',
        description: 'Correção de bug no sistema de atribuição de projetos para tarefas',
        items: [
          {
            type: 'bugfix',
            content: 'Corrigido problema que impedia a persistência de projetos ao editar tarefas'
          },
          {
            type: 'improvement',
            content: 'Implementada API dedicada para gerenciar a associação entre tarefas e projetos'
          },
          {
            type: 'improvement',
            content: 'Aprimorada a interface de edição de tarefas para garantir a exibição correta do projeto associado'
          },
          {
            type: 'improvement',
            content: 'Atualizado o componente de detalhes da tarefa para buscar informações de projeto via API'
          }
        ]
      }
    ],
    isNew: false
  },
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
      },
      {
        id: 'ui-improvements',
        title: 'Melhorias na Interface',
        description: 'Atualizações na interface da landing page e no upload de fotos de perfil',
        items: [
          {
            type: 'improvement',
            content: 'Redesign da landing page com nova paleta de cores consistente com o resto do aplicativo'
          },
          {
            type: 'improvement',
            content: 'Uso de variáveis de tema em vez de cores fixas para melhor suporte ao modo claro/escuro'
          },
          {
            type: 'improvement',
            content: 'Interface mais moderna e atraente para destacar recursos do aplicativo'
          },
          {
            type: 'bugfix',
            content: 'Corrigido problema com distorção de imagens no upload de fotos de perfil'
          },
          {
            type: 'improvement',
            content: 'Implementado processamento inteligente de imagens para perfil, garantindo recorte adequado'
          },
          {
            type: 'improvement',
            content: 'Melhor experiência de usuário ao selecionar e fazer upload de fotos'
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