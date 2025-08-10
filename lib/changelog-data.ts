import { ChangelogItem } from "@/components/changelog-entry";

interface ChangelogData {
  date: Date;
  version: string;
  author?: {
    name: string;
    role?: string;
    initials?: string;
  };
  entries: ChangelogItem[];
  isNew?: boolean;
}

export const CHANGELOG_DATA: ChangelogData[] = [
  {
    date: new Date(),
    version: "2.9.0",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "feedback-system",
        title: "Sistema de Feedback de Usuários",
        description:
          "Colete sugestões e ideias diretamente no app e priorize com votos.",
        items: [
          {
            type: "feature",
            content:
              "Envio de feedback pelo app com tipo (bug, sugestão, UX, integração) e impacto",
          },
          {
            type: "feature",
            content:
              "Endpoint de API para feedback com autenticação e notificação por e-mail",
          },
          {
            type: "feature",
            content:
              "Votação (upvote) de feedback para priorização pela comunidade",
          },
        ],
      },
      {
        id: "product-roadmap",
        title: "Roadmap de Produto",
        description:
          "Visualize o status das ideias e funcionalidades em andamento.",
        items: [
          {
            type: "feature",
            content:
              "Página de roadmap com ideias agrupadas por status (Triagem, Planejado, Em Progresso, Concluído)",
          },
          { type: "feature", content: "Filtros por status, tipo e busca" },
          {
            type: "feature",
            content: "Paginação e ordenação por relevância (upvotes) e data",
          },
        ],
      },
    ],
    isNew: true,
  },
  {
    date: new Date(),
    version: "2.8.8",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "tasks-kanban-realtime",
        title: "Tarefas, Kanban e Atualizações em Tempo Real",
        description:
          "Melhorias de produtividade e consistência na experiência de tarefas, com status, filtros e sincronização.",
        items: [
          {
            type: "improvement",
            content:
              "Seleção e atualização do status da tarefa com ícones e cores consistentes",
          },
          {
            type: "improvement",
            content:
              "Exibição e filtragem de tarefas concluídas na lista de tarefas",
          },
          {
            type: "improvement",
            content:
              "Atualizações de criação, conclusão e exclusão refletidas automaticamente no Kanban e nas listas",
          },
          {
            type: "improvement",
            content:
              "Melhorias de desempenho e estabilidade ao arrastar e reorganizar no Kanban",
          },
          {
            type: "improvement",
            content:
              "Notificação local ao criar novas tarefas para sincronizar outras visões",
          },
          {
            type: "bugfix",
            content:
              "Correções em loops de atualização e remoção de código obsoleto em listas de tarefas e Kanban",
          },
        ],
      },
      {
        id: "calendar-filters",
        title: "Calendário com Filtros por Projeto e Melhorias Visuais",
        description:
          "Novo poder de filtragem e UI refinada na visão de calendário.",
        items: [
          {
            type: "feature",
            content:
              "Filtros de projetos na visão de calendário com seleção rápida",
          },
          {
            type: "improvement",
            content:
              "Badges, ícones e responsividade aprimorados no calendário",
          },
          {
            type: "improvement",
            content:
              "Renderização otimizada de células e dias para melhor desempenho",
          },
        ],
      },
      {
        id: "attachments-and-api",
        title: "Anexos e Robustez de API",
        description:
          "Rotas de upload/download e APIs de tarefas/comentários mais seguras e resilientes.",
        items: [
          {
            type: "improvement",
            content:
              "Validações e tratamento de erros aprimorados nas rotas de upload e download de anexos",
          },
          {
            type: "improvement",
            content:
              "Aprimorada a manipulação de projetos nas rotas de tarefas e comentários",
          },
          {
            type: "improvement",
            content: "Respostas mais consistentes e previsíveis nas APIs",
          },
        ],
      },
      {
        id: "editing-experience",
        title: "Editor de Texto Rico nas Tarefas",
        description:
          "Editor unificado com barra avançada aplicado em diálogos e detalhes de tarefas.",
        items: [
          {
            type: "feature",
            content:
              "Substituição do campo de texto por editor de texto rico nos diálogos e detalhes de tarefas",
          },
          {
            type: "improvement",
            content:
              "Padronização de data-testid em componentes para suporte a testes automatizados",
          },
        ],
      },
    ],
    isNew: true,
  },
  {
    date: new Date(),
    version: "2.8.4",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "rich-text-editor-toolbar",
        title: "Barra de Ferramentas Rica para Comentários - Estilo Trello Pro",
        description:
          "Sistema completo de formatação de texto com barra de ferramentas avançada e preview em tempo real",
        items: [
          {
            type: "feature",
            content:
              "Barra de ferramentas completa com formatação de texto: **negrito**, *itálico*, sublinhado",
          },
          {
            type: "feature",
            content:
              "Botões para listas com marcadores e listas numeradas com inserção inteligente",
          },
          {
            type: "feature",
            content: "Dialog de inserção de links com campos para texto e URL",
          },
          {
            type: "feature",
            content:
              "Sistema de anexos de arquivos com suporte a imagens, PDFs e documentos",
          },
          {
            type: "feature",
            content:
              "Menu dropdown com opções avançadas: código inline, citações e linha divisória",
          },
          {
            type: "feature",
            content: "Preview em tempo real com renderização Markdown completa",
          },
          {
            type: "feature",
            content:
              "Atalhos de teclado profissionais: Ctrl+B (negrito), Ctrl+I (itálico), Ctrl+U (sublinhado), Ctrl+K (link)",
          },
          {
            type: "feature",
            content:
              "Auto-resize da área de texto conforme o conteúdo digitado",
          },
          {
            type: "feature",
            content: "Tabs para alternar entre modo de edição e preview",
          },
          {
            type: "improvement",
            content:
              "Interface responsiva que se adapta perfeitamente a dispositivos móveis",
          },
          {
            type: "improvement",
            content:
              "Animações suaves na barra de ferramentas com efeitos hover elegantes",
          },
          {
            type: "improvement",
            content:
              "Estados visuais claros para botões ativos e desabilitados",
          },
          {
            type: "improvement",
            content:
              "Tooltips informativos em todos os botões da barra de ferramentas",
          },
          {
            type: "improvement",
            content:
              "Suporte completo a HTML e Markdown com renderização segura",
          },
          {
            type: "improvement",
            content: "Design consistente com o sistema de design do Trello",
          },
        ],
      },
    ],
  },
  {
    date: new Date(),
    version: "2.8.3",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "comments-trello-style",
        title: "Melhorias no Sistema de Comentários - Estilo Trello",
        description:
          "Sistema de comentários aprimorado com interface mais elegante e funcionalidades avançadas",
        items: [
          {
            type: "improvement",
            content:
              "Interface de comentários redesenhada para ser mais similar ao Trello com design mais limpo e moderno",
          },
          {
            type: "feature",
            content:
              "Suporte completo a Markdown nos comentários: **negrito**, *itálico*, `código`, listas e links",
          },
          {
            type: "feature",
            content:
              "Sistema de curtidas nos comentários com animação suave e contador visual",
          },
          {
            type: "feature",
            content:
              "Campo de entrada expandível com dicas de formatação e atalhos de teclado (Ctrl+Enter)",
          },
          {
            type: "feature",
            content:
              "Formatação inteligente de datas com tooltips informativos mostrando data/hora completa",
          },
          {
            type: "improvement",
            content:
              "Animações suaves para interações: hover, likes, edição e transições",
          },
          {
            type: "improvement",
            content:
              "Melhor experiência em dispositivos móveis com botões otimizados para toque",
          },
          {
            type: "improvement",
            content:
              "Atalhos de teclado para produtividade: Ctrl+Enter para enviar, Esc para cancelar",
          },
          {
            type: "improvement",
            content:
              'Indicador visual de comentários editados com badge "editado"',
          },
          {
            type: "improvement",
            content:
              "Tooltips informativos em todos os botões de ação para melhor usabilidade",
          },
        ],
      },
    ],
  },
  {
    date: new Date(),
    version: "2.8.2",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "task-comments-system",
        title: "Sistema de Comentários em Tarefas",
        description:
          "Implementado sistema completo de comentários nas tarefas, similar ao Trello",
        items: [
          {
            type: "feature",
            content:
              "Adicionado sistema completo de comentários nas tarefas com autenticação de usuário",
          },
          {
            type: "feature",
            content:
              "CRUD completo de comentários: criar, visualizar, editar e deletar comentários próprios",
          },
          {
            type: "feature",
            content:
              "Interface intuitiva com avatar do usuário, nome e data de criação dos comentários",
          },
          {
            type: "feature",
            content:
              "Ícone de lixeira vermelho para deletar comentários com confirmação visual no hover",
          },
          {
            type: "feature",
            content:
              "Menu dropdown para editar comentários próprios com controle de permissões",
          },
          {
            type: "improvement",
            content:
              "Layout consistente entre projeto e etiquetas com formato de chip/badge colorido",
          },
          {
            type: "improvement",
            content:
              'Estados de carregamento padronizados com texto "Carregando..." em todas as seções',
          },
          {
            type: "improvement",
            content:
              "Correção das rotas da API para compatibilidade com Next.js moderno",
          },
          {
            type: "improvement",
            content:
              "Traduções completas em português para todas as funcionalidades de comentários",
          },
          {
            type: "bugfix",
            content:
              'Corrigido problema de tradução onde "Unknown project" mostrava "Carregando Projetos"',
          },
        ],
      },
    ],
    isNew: true,
  },
  {
    date: new Date(),
    version: "2.8.1",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "reports-points-time-enhancement",
        title: "Aprimoramento dos Relatórios com Pontos e Tempo Estimado",
        description:
          "Adicionados campos de pontos e tempo estimado nos relatórios para melhor análise de produtividade",
        items: [
          {
            type: "feature",
            content:
              'Adicionadas colunas "Pontos" e "Tempo Estimado" nos relatórios Web, PDF e Excel',
          },
          {
            type: "feature",
            content:
              "Estatísticas de pontos totais, média de pontos, tempo total estimado e tempo médio nos relatórios",
          },
          {
            type: "feature",
            content:
              "Gráfico de distribuição de pontos nos relatórios Web para análise visual da dificuldade das tarefas",
          },
          {
            type: "improvement",
            content:
              "Formatação visual colorida dos pontos nos relatórios PDF (verde para fácil, vermelho para difícil)",
          },
          {
            type: "improvement",
            content:
              "Conversão automática de tempo estimado para formato legível (dias, horas, minutos)",
          },
          {
            type: "improvement",
            content:
              "Colunas redimensionáveis e tooltips nas tabelas dos relatórios Web para melhor usabilidade",
          },
          {
            type: "improvement",
            content:
              "Seleção personalizada de colunas permite incluir apenas os campos necessários",
          },
        ],
      },
      {
        id: "markdown-task-support",
        title: "Suporte a Markdown nas Tarefas",
        description:
          "Adicionado suporte a formatação markdown nas descrições de tarefas",
        items: [
          {
            type: "feature",
            content:
              "Adicionado suporte a formatação markdown nas descrições de tarefas",
          },
          {
            type: "improvement",
            content:
              "As descrições de tarefas agora suportam formatação como negrito, itálico, listas, cabeçalhos, links e código",
          },
          {
            type: "improvement",
            content:
              "Melhor visualização de conteúdo formatado nos detalhes das tarefas",
          },
          {
            type: "improvement",
            content:
              "Mantida a compatibilidade com o sistema existente de checkboxes e listas",
          },
        ],
      },
    ],
  },
  {
    date: new Date(),
    version: "2.8.0",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "pomodoro-mobile-bugfix",
        title: "Correção do Histórico de Pomodoro em Dispositivos Móveis",
        description:
          "Corrigido problema que impedia o registro de sessões do Pomodoro em dispositivos móveis",
        items: [
          {
            type: "bugfix",
            content:
              "Corrigido problema crítico que impedia o registro das sessões de Pomodoro em dispositivos móveis quando o timer era concluído",
          },
          {
            type: "improvement",
            content:
              "Melhorado o tratamento de requisições da API no endpoint de log do Pomodoro para garantir compatibilidade com dispositivos móveis",
          },
          {
            type: "improvement",
            content:
              "Adicionados headers anti-cache nas respostas da API para evitar problemas em navegadores mobile",
          },
        ],
      },
      {
        id: "pomodoro-history",
        title: "Histórico de Pomodoro",
        description:
          "Novo histórico de sessões do Pomodoro para acompanhar seu progresso",
        items: [
          {
            type: "feature",
            content:
              "Adicionado histórico completo das sessões de Pomodoro (trabalho e pausas)",
          },
          {
            type: "feature",
            content:
              "Registro detalhado de data, hora, duração e tipo de cada sessão",
          },
          {
            type: "feature",
            content: "Visualização de sessões associadas a tarefas específicas",
          },
          {
            type: "improvement",
            content:
              "Interface intuitiva com paginação para navegar pelo histórico",
          },
          {
            type: "improvement",
            content:
              "Distinção visual por cores entre os diferentes tipos de sessões",
          },
        ],
      },
      {
        id: "deezer-integration",
        title: "Integração com Deezer",
        description: "Nova opção de player de música com integração ao Deezer",
        items: [
          {
            type: "feature",
            content:
              "Adicionado player do Deezer para reproduzir playlists durante o trabalho",
          },
          {
            type: "feature",
            content:
              "Configuração do Deezer através das configurações do sistema",
          },
          {
            type: "feature",
            content:
              "Player persistente que continua tocando durante a navegação",
          },
          {
            type: "feature",
            content:
              "Suporte completo para contas premium do Deezer sem limitações de prévia",
          },
          {
            type: "improvement",
            content:
              "Interface unificada que permite escolher entre Spotify e Deezer",
          },
          {
            type: "improvement",
            content:
              "Controles de playback adaptados para funcionar com ambos os serviços",
          },
        ],
      },
      {
        id: "pomodoro-improvements",
        title: "Melhorias no Pomodoro",
        description:
          "Aprimoramentos visuais e funcionais no componente de Pomodoro",
        items: [
          {
            type: "improvement",
            content:
              "Interface centralizada e mais intuitiva para melhor experiência visual",
          },
          {
            type: "improvement",
            content:
              "Ajuste no posicionamento do botão de configurações para fácil acesso",
          },
          {
            type: "improvement",
            content:
              "Seletor de tarefas com largura alinhada ao componente do timer",
          },
          {
            type: "improvement",
            content: "Melhor visualização do histórico de sessões do Pomodoro",
          },
          {
            type: "bugfix",
            content:
              "Correção de erros de tipagem nos componentes do histórico",
          },
        ],
      },
      {
        id: "drag-drop-enhancements",
        title: "Melhorias no Sistema de Arrastar e Soltar",
        description:
          "Aprimoramentos nos componentes de arrastar e soltar para Playlists e Kanban",
        items: [
          {
            type: "improvement",
            content:
              "Implementação mais fluida para arrastar itens nas playlists do Deezer e Spotify",
          },
          {
            type: "improvement",
            content:
              "Reorganização facilitada de cards no Kanban com feedback visual melhorado",
          },
          {
            type: "improvement",
            content:
              "Animações suaves ao arrastar e soltar elementos na interface",
          },
          {
            type: "improvement",
            content:
              "Indicadores visuais aprimorados para áreas de soltura dos itens",
          },
          {
            type: "bugfix",
            content:
              "Correção de problemas de performance ao arrastar múltiplos itens",
          },
        ],
      },
    ],
  },
  {
    date: new Date(),
    version: "2.7.1",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "pomodoro-enhancements-ux",
        title: "Melhorias no Temporizador Pomodoro",
        description:
          "Aprimoramentos significativos na funcionalidade e experiência de usuário do Pomodoro.",
        items: [
          {
            type: "improvement",
            content:
              "Transição entre os modos (Trabalho, Pausa Curta, Pausa Longa) agora aguarda o início manual pelo usuário após a mudança de aba.",
          },
          {
            type: "improvement",
            content:
              "Adicionado feedback visual dinâmico: a cor do texto do timer e da aba ativa agora mudam para refletir o modo atual (Trabalho, Pausa Curta, Pausa Longa).",
          },
          {
            type: "improvement",
            content:
              "Sincronizadas as configurações do Pomodoro (tempos, ciclos) entre a instância na página inicial e a página dedicada do Pomodoro.",
          },
          {
            type: "improvement",
            content:
              "Refatorada a lógica de estilização do Pomodoro para melhor manutenibilidade, centralizando a função de obtenção de estilos.",
          },
          {
            type: "bugfix",
            content:
              'Corrigido erro "Maximum update depth exceeded" no Pomodoro causado por um loop de atualizações de estado.',
          },
          {
            type: "bugfix",
            content:
              'Resolvido problema de "Cannot access before initialization" no Pomodoro relacionado à ordem de declaração de funções.',
          },
          {
            type: "bugfix",
            content:
              "Corrigida dessincronização de configurações do Pomodoro entre a página inicial e a página dedicada.",
          },
          {
            type: "bugfix",
            content:
              'Corrigida a exibição do texto "Ciclo" no temporizador Pomodoro (anteriormente mostrava "cycleStage").',
          },
        ],
      },
      {
        id: "api-task-testing-enhancements",
        title: "Melhorias na Confiabilidade da API de Tarefas",
        description:
          "Aumento significativo da cobertura de testes automatizados para a API de gerenciamento de tarefas, garantindo maior estabilidade e prevenindo regressões.",
        items: [
          {
            type: "improvement",
            content:
              "Implementados testes unitários abrangentes para a rota `/api/tasks`, cobrindo diversos cenários de criação, leitura, e tratamento de erros.",
          },
          {
            type: "improvement",
            content:
              "Aprimorada a configuração do ambiente de teste para simular de forma eficaz as dependências externas, como banco de dados e autenticação.",
          },
        ],
      },
    ],
    isNew: true,
  },
  {
    date: new Date(),
    version: "2.7.0",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "spotify-player",
        title: "Player do Spotify",
        description:
          "Novo player do Spotify para ouvir música enquanto trabalha",
        items: [
          {
            type: "feature",
            content:
              "Adicionado player do Spotify para reproduzir playlists durante o trabalho",
          },
          {
            type: "feature",
            content:
              "Configuração da playlist através das configurações do sistema",
          },
          {
            type: "feature",
            content:
              "Player persistente que continua tocando durante a navegação",
          },
          {
            type: "improvement",
            content: "Interface minimalista com opções de expandir/minimizar",
          },
        ],
      },
      {
        id: "task-enhancements",
        title: "Melhorias nas Tarefas",
        description:
          "Novas funcionalidades para melhor gerenciamento e organização das tarefas",
        items: [
          {
            type: "feature",
            content:
              "Novo campo para definir o tempo estimado de conclusão de cada tarefa",
          },
          {
            type: "feature",
            content:
              "Suporte para diferentes unidades de tempo: minutos, horas e dias",
          },
          {
            type: "feature",
            content:
              "Sistema de anexos com suporte para links, imagens e arquivos",
          },
          {
            type: "feature",
            content: "Upload de arquivos e imagens diretamente nas tarefas",
          },
          {
            type: "improvement",
            content: "Interface intuitiva para inserção do tempo estimado",
          },
          {
            type: "improvement",
            content:
              "Conversão automática entre unidades de tempo para facilitar o planejamento",
          },
          {
            type: "improvement",
            content: "Visualização organizada dos anexos com ícones por tipo",
          },
          {
            type: "improvement",
            content:
              "Gerenciamento simplificado de anexos com opções de adicionar e remover",
          },
        ],
      },
      {
        id: "enhanced-reports",
        title: "Sistema de Relatórios Aprimorado",
        description:
          "Melhorias significativas no sistema de relatórios com múltiplos formatos de exportação",
        items: [
          {
            type: "feature",
            content:
              "Adicionado suporte para três formatos de exportação: Web, PDF e Excel",
          },
          {
            type: "feature",
            content:
              "Novo formato PDF otimizado com cabeçalhos de tabela em todas as páginas",
          },
          {
            type: "feature",
            content:
              "Estatísticas detalhadas com design consistente em todas as páginas do relatório",
          },
          {
            type: "improvement",
            content:
              "Interface simplificada para seleção de formato com ícones intuitivos",
          },
          {
            type: "improvement",
            content:
              "Instruções de uso detalhadas para cada formato de exportação",
          },
          {
            type: "improvement",
            content:
              "Visualização aprimorada de estatísticas com cores uniformes em todos os elementos",
          },
          {
            type: "improvement",
            content:
              "Adicionada seção de solução de problemas para auxiliar usuários",
          },
        ],
      },
      {
        id: "reports-howto",
        title: "Como Usar os Novos Relatórios",
        description:
          "Guia rápido para aproveitar ao máximo o sistema de relatórios aprimorado",
        items: [
          {
            type: "improvement",
            content:
              'Acesse o sistema de relatórios pelo menu principal, clicando em "Relatórios", ou diretamente em /app/reports',
          },
          {
            type: "improvement",
            content:
              "Selecione o tipo de relatório (Todas as Tarefas, Tarefas Concluídas, etc.) e defina o período desejado",
          },
          {
            type: "improvement",
            content:
              "Utilize os filtros por projetos, etiquetas e prioridades para relatórios mais precisos",
          },
          {
            type: "improvement",
            content:
              "Personalize as colunas a serem exibidas no relatório para focar apenas nas informações relevantes",
          },
          {
            type: "improvement",
            content:
              "Escolha o formato de exportação: Web (HTML para visualização rápida), PDF (para compartilhamento profissional) ou Excel (para análise detalhada)",
          },
          {
            type: "improvement",
            content:
              'Use a aba "Histórico de Relatórios" para acessar facilmente relatórios gerados anteriormente',
          },
        ],
      },
    ],
    isNew: true,
  },
  {
    date: new Date(),
    version: "2.6.0",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "kanban-board-feature",
        title: "Novo Quadro Kanban",
        description:
          "Adicionado um quadro Kanban para visualização e gerenciamento de tarefas",
        items: [
          {
            type: "feature",
            content:
              "Implementação de quadro Kanban com colunas para Backlog, Planejamento, Em Progresso, Validação e Concluídas",
          },
          {
            type: "feature",
            content:
              "Funcionalidade de arrastar e soltar para mover tarefas entre colunas",
          },
          {
            type: "feature",
            content:
              "Atualização automática do status da tarefa ao mover entre colunas",
          },
          {
            type: "improvement",
            content:
              "Interface visual moderna e responsiva para o quadro Kanban",
          },
          {
            type: "improvement",
            content:
              "Integração com o sistema de projetos existente para exibir cores e nomes de projetos nos cartões",
          },
          {
            type: "improvement",
            content:
              "Suporte para criação rápida de tarefas diretamente em qualquer coluna",
          },
        ],
      },
    ],
    isNew: false,
  },
  {
    date: new Date("2024-04-10"),
    version: "2.5.1",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "pomodoro-interface-improvements",
        title: "Melhorias na Interface do Pomodoro",
        description:
          "Ajustes na interface do Pomodoro e correções de bugs importantes",
        items: [
          {
            type: "improvement",
            content:
              "Ocultação da descrição da tarefa no seletor do Pomodoro para uma interface mais limpa",
          },
          {
            type: "improvement",
            content:
              "Ajustes adicionais na interface para uma experiência mais focada durante as sessões",
          },
          {
            type: "improvement",
            content:
              "Otimização do layout do temporizador para melhor visualização em todos os dispositivos",
          },
          {
            type: "bugfix",
            content:
              'Corrigido erro "A `<Select.Item />` must have a value prop that is not an empty string" no seletor de tarefas do Pomodoro',
          },
          {
            type: "bugfix",
            content:
              "Resolvido problema com a exibição das tarefas disponíveis no seletor do Pomodoro",
          },
          {
            type: "bugfix",
            content: "Melhorada a estabilidade geral do componente Pomodoro",
          },
        ],
      },
    ],
    isNew: false,
  },
  {
    date: new Date("2024-04-01"),
    version: "2.5.0",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "pomodoro-feature",
        title: "Novo Temporizador Pomodoro",
        description:
          "Adicionado temporizador Pomodoro para gerenciamento de tempo e produtividade",
        items: [
          {
            type: "feature",
            content:
              "Implementação do sistema Pomodoro com temporizadores configuráveis",
          },
          {
            type: "feature",
            content: "Seleção de tarefas para sessões de foco Pomodoro",
          },
          {
            type: "feature",
            content:
              "Alternância automática entre períodos de trabalho e pausa",
          },
          {
            type: "feature",
            content: "Notificações sonoras e visuais ao final de cada sessão",
          },
          {
            type: "feature",
            content:
              "Configurações personalizáveis para durações de trabalho e pausas",
          },
        ],
      },
    ],
    isNew: false,
  },
  {
    date: new Date("2024-03-28"),
    version: "2.4.2",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "pomodoro-and-ui-improvements",
        title: "Melhorias na Interface e Correções",
        description: "Atualizações na interface do usuário e correções de bugs",
        items: [
          {
            type: "improvement",
            content:
              "Adicionados efeitos visuais ao passar o mouse sobre botões e tarefas",
          },
          {
            type: "improvement",
            content:
              "Melhoria na visualização de descrições de tarefas com opção de expandir/recolher",
          },
          {
            type: "improvement",
            content:
              "Interface mais responsiva com feedback visual ao interagir com elementos",
          },
          {
            type: "improvement",
            content:
              "Tradução completa das configurações do Pomodoro para português",
          },
          {
            type: "bugfix",
            content:
              "Corrigido problema em que o botão de expandir descrição abria os detalhes da tarefa",
          },
          {
            type: "bugfix",
            content:
              'Corrigido problema com o botão "Iniciar Pomodoro" que abria a tarefa em vez de ir para a página do Pomodoro',
          },
          {
            type: "bugfix",
            content:
              "Corrigida duplicação de elementos na visualização de detalhes da tarefa",
          },
        ],
      },
    ],
    isNew: false,
  },
  {
    date: new Date("2024-03-15"),
    version: "2.4.1",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "project-assignment-fix",
        title: "Correção na Atribuição de Projetos",
        description:
          "Correção de bug no sistema de atribuição de projetos para tarefas",
        items: [
          {
            type: "bugfix",
            content:
              "Corrigido problema que impedia a persistência de projetos ao editar tarefas",
          },
          {
            type: "improvement",
            content:
              "Implementada API dedicada para gerenciar a associação entre tarefas e projetos",
          },
          {
            type: "improvement",
            content:
              "Aprimorada a interface de edição de tarefas para garantir a exibição correta do projeto associado",
          },
          {
            type: "improvement",
            content:
              "Atualizado o componente de detalhes da tarefa para buscar informações de projeto via API",
          },
        ],
      },
    ],
    isNew: false,
  },
  {
    date: new Date("2024-03-01"),
    version: "2.4.0",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "notification-system",
        title: "Sistema de Notificações de Tarefas",
        description:
          "Implementação de um sistema completo de notificações para tarefas",
        items: [
          {
            type: "feature",
            content:
              "Adicionado sistema de notificações para tarefas atrasadas, tarefas de hoje e tarefas próximas",
          },
          {
            type: "feature",
            content:
              "Notificações sonoras quando novas tarefas estiverem disponíveis",
          },
          {
            type: "feature",
            content:
              "Notificações de desktop para alertar sobre tarefas pendentes",
          },
          {
            type: "feature",
            content:
              "Capacidade de marcar tarefas como concluídas diretamente a partir do menu de notificações",
          },
          {
            type: "feature",
            content:
              "Nova página de notificações para visualizar todas as tarefas que precisam de atenção",
          },
          {
            type: "improvement",
            content:
              "Integração com as configurações do usuário para controlar notificações sonoras e de desktop",
          },
          {
            type: "improvement",
            content:
              "Possibilidade de configurar quantos dias à frente o sistema deve verificar para tarefas",
          },
          {
            type: "improvement",
            content:
              "Código refatorado para usar a biblioteca de áudio centralizada para todas as notificações sonoras",
          },
          {
            type: "bugfix",
            content:
              "Corrigido problema que impedia a marcação correta de notificações como lidas",
          },
        ],
      },
      {
        id: "ui-improvements",
        title: "Melhorias na Interface",
        description:
          "Atualizações na interface da landing page e no upload de fotos de perfil",
        items: [
          {
            type: "improvement",
            content:
              "Redesign da landing page com nova paleta de cores consistente com o resto do aplicativo",
          },
          {
            type: "improvement",
            content:
              "Uso de variáveis de tema em vez de cores fixas para melhor suporte ao modo claro/escuro",
          },
          {
            type: "improvement",
            content:
              "Interface mais moderna e atraente para destacar recursos do aplicativo",
          },
          {
            type: "bugfix",
            content:
              "Corrigido problema com distorção de imagens no upload de fotos de perfil",
          },
          {
            type: "improvement",
            content:
              "Implementado processamento inteligente de imagens para perfil, garantindo recorte adequado",
          },
          {
            type: "improvement",
            content:
              "Melhor experiência de usuário ao selecionar e fazer upload de fotos",
          },
        ],
      },
    ],
    isNew: false,
  },
  {
    date: new Date("2024-02-15"),
    version: "2.3.0",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "recent-updates",
        title: "Melhoria na Interface do Usuário",
        description: "Adicionada página de changelog e melhorias na interface",
        items: [
          {
            type: "feature",
            content:
              "Adicionada página de Changelog para acompanhar as novidades do sistema",
          },
          {
            type: "improvement",
            content:
              "Melhorado o estilo e comportamento dos checkboxes em descrições de tarefas",
          },
          {
            type: "improvement",
            content:
              "Adicionado suporte para marcar texto como concluído nas listas de verificação",
          },
          {
            type: "improvement",
            content:
              "Melhorada a interação com links nas descrições de tarefas",
          },
          {
            type: "improvement",
            content:
              "Melhor suporte para itens com marcadores (bullets) em descrições",
          },
          {
            type: "bugfix",
            content:
              "Corrigido problema com duplicação do botão de adicionar etiquetas",
          },
          {
            type: "bugfix",
            content:
              "Corrigido problema em que os checkboxes não respondiam adequadamente aos cliques",
          },
        ],
      },
    ],
    isNew: false,
  },
  {
    date: new Date("2024-01-10"),
    version: "2.0.0",
    author: {
      name: "Igor Silva",
      role: "Desenvolvedor",
      initials: "IS",
    },
    entries: [
      {
        id: "initial-release",
        title: "Lançamento Inicial",
        description: "Primeira versão pública do To-Do-Ist",
        items: [
          {
            type: "feature",
            content: "Criação e gerenciamento de tarefas",
          },
          {
            type: "feature",
            content: "Organização em projetos",
          },
          {
            type: "feature",
            content: "Definição de prioridades e datas de vencimento",
          },
          {
            type: "feature",
            content: "Visualização de tarefas por dia, semana e mês",
          },
          {
            type: "feature",
            content: "Tema claro/escuro",
          },
        ],
      },
    ],
  },
];

export function getChangelogData(): ChangelogData[] {
  // Calcular a data de 30 dias atrás
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Filtrar os changelogs, marcando como "isNew" apenas se forem mais recentes que 30 dias
  return CHANGELOG_DATA.map((entry) => {
    // Verificar se a data do changelog é mais recente que 30 dias atrás
    const isRecent = new Date(entry.date) > thirtyDaysAgo;

    // Se o changelog está marcado como isNew=true no código, mas não é recente,
    // eliminaremos a flag isNew
    if (entry.isNew && !isRecent) {
      return {
        ...entry,
        isNew: false,
      };
    }

    // Caso contrário, mantemos o valor original de isNew
    return entry;
  });
}
