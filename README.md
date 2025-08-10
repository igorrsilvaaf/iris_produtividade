# Íris produtividade: Sistema de Gerenciamento de Tarefas

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Componentes Principais](#componentes-principais)
5. [Modelos de Dados](#modelos-de-dados)
6. [Funcionalidades](#funcionalidades)
7. [Internacionalização (i18n)](#internacionalização-i18n)
8. [Fluxos de Trabalho](#fluxos-de-trabalho)
9. [API Endpoints](#api-endpoints)
10. [APIs e Integrações Detalhadas](#apis-e-integrações-detalhadas)
11. [Guia de Uso](#guia-de-uso)
12. [Performance e Otimização](#performance-e-otimização)
13. [Segurança](#segurança)
14. [Manutenção e Suporte](#manutenção-e-suporte)

## Visão Geral

Íris produtividade é um sistema avançado de gerenciamento de tarefas desenvolvido com Next.js (App Router), TypeScript e Prisma (PostgreSQL). O sistema permite criar, organizar, priorizar e acompanhar tarefas em diferentes contextos (Hoje, Caixa de Entrada, Próximos, Projetos, Etiquetas), com recursos de produtividade como Pomodoro, Kanban, calendário, notificações e integrações.

### Principais Características

- Interface amigável e responsiva
- Organização de tarefas por projetos e etiquetas
- Sistema de priorização (Grave, Alta, Média, Baixa)
- Funcionalidade de calendário para visualização temporal
- Temporizador Pomodoro integrado
- Suporte para múltiplos idiomas (Português e Inglês)
- Temas claro e escuro
- Visualização Kanban para gerenciamento de fluxo de trabalho
- Integração com Spotify para reprodução de música durante sessões de trabalho
- Sistema de notificações para tarefas próximas do vencimento

### Requisitos de Ambiente

- Node.js 20+
- PostgreSQL 14+
- pnpm 9+

Variáveis de ambiente principais:

```env
DATABASE_URL=postgresql://user:pass@host:5432/iris
NEXTAUTH_SECRET=uma_chave_segura
NEXT_PUBLIC_APP_URL=http://localhost:3000
EMAIL_SERVER_HOST=smtp.seudominio.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=usuario
EMAIL_SERVER_PASSWORD=senha
EMAIL_FROM="Íris <noreply@seudominio.com>"
GEMINI_API_KEY=chave_da_api_gemini
# Alternativas/outs:
GOOGLE_GEMINI_API_KEY=chave_da_api_gemini
GITHUB_PAT=token
GITHUB_DEFAULT_REPO=owner/repo
COOKIE_DOMAIN=seudominio.com
```

Scripts úteis:

```bash
pnpm dev
pnpm build && pnpm start
pnpm lint
pnpm test
pnpm test:e2e
```

## Arquitetura do Sistema

O Íris produtividade segue a arquitetura do Next.js App Router, com separação entre rotas de aplicação (`app/app/**`) e rotas de API (`app/api/**`). A camada de domínio fica em `lib/**`, com Prisma para acesso a dados e utilitários para regras de negócio. UI utiliza Tailwind + Radix (shadcn/ui) com tema claro/escuro.

### Estrutura de Diretórios

```bash
Íris produtividade/
├── app/                # Rotas e páginas do Next.js App Router
│   ├── api/            # API endpoints
│   ├── app/            # Páginas do aplicativo autenticado
│   └── layout.tsx      # Layout principal
├── components/         # Componentes reutilizáveis
│   ├── ui/             # Componentes básicos de UI
│   └── ...             # Componentes específicos de domínio
├── lib/                # Lógica de negócios e utilitários
│   ├── stores/         # Stores de estado global
│   ├── i18n.ts         # Configuração de internacionalização
│   └── ...             # Outros utilitários
├── styles/             # Estilos globais
└── public/             # Arquivos estáticos

Outros:
- `prisma/schema.prisma`: definição do banco
- `tailwind.config.ts` e `postcss.config.mjs`: estilos
- `next.config.mjs`: build e imagens
- `app/metadata.ts`: metadados e `NEXT_PUBLIC_APP_URL`
```

### Fluxo de Dados

O sistema segue um padrão de fluxo de dados unidirecional:

1. Ações do usuário geram eventos
2. Handlers/Actions disparam chamadas à API (`app/api/**`)
3. API processa solicitações e atualiza o banco via Prisma
4. Componentes revalidam/atualizam estado e UI

## Tecnologias Utilizadas

### Frontend
- **React**: Biblioteca para construção de interfaces
- **Next.js**: Framework React para renderização híbrida
- **TypeScript**: Linguagem tipada baseada em JavaScript
- **Tailwind CSS**: Framework CSS utilitário
- **Shadcn/ui**: Componentes de UI acessíveis e personalizáveis
- **Zustand**: Gerenciamento de estado global
- **React Hook Form**: Gerenciamento de formulários
- **date-fns**: Manipulação de datas

### Backend
- **Next.js API Routes**: Endpoints de API
- **PostgreSQL**: Banco de dados relacional
- **Prisma**: ORM
- **Autenticação própria** baseada em sessão (`lib/auth.ts` + `sessions`)

### DevOps
- **Node.js**: Ambiente de execução JavaScript
- **npm / pnpm**: Gerenciador de pacotes
- **Git**: Controle de versão

## Componentes Principais

### Componentes de Tarefas

#### Todo (`components/Todo.tsx`)
Componente que representa uma tarefa individual na interface.

**Características:**
- Exibe título, descrição, prazo, prioridade e pontos da tarefa
- Funcionalidades para marcar como concluída e excluir
- Suporte a diferentes estados visuais (concluída/pendente)
- Persistência de estado no localStorage
- Integração com sistema de internacionalização
- Tooltips informativos para melhorar a experiência do usuário

**Propriedades:**
```typescript
interface TodoProps {
  todo?: TodoType
  onComplete?: (id: number) => void
  onDelete?: (id: number) => void
  onClick?: (todo: TodoType) => void
}
```

#### TaskList (`components/task-list.tsx`)
Componente que exibe uma lista de tarefas com funcionalidades avançadas.

**Características:**
- Ordenação por prioridade, título ou data de vencimento
- Filtros personalizáveis
- Agrupamento por projeto ou etiqueta
- Integração com a API para gerenciamento de tarefas
- Suporte a animações e transições durante operações
- Exibição de estatísticas sobre as tarefas listadas

#### TaskDetail (`components/task-detail.tsx`)
Componente para visualização e edição detalhada de uma tarefa.

**Características:**
- Modo de visualização e edição
- Formulário completo para edição de todos os atributos
- Gerenciamento de etiquetas e projetos associados
- Histórico de alterações
- Upload e gerenciamento de anexos
- Estimativa de tempo e pontuação de dificuldade
- Comentários e anotações

#### AddTaskDialog (`components/add-task-dialog.tsx`)
Diálogo para criação de novas tarefas com interface completa.

**Características:**
- Formulário intuitivo com validação
- Seleção de projeto e etiquetas
- Definição de prioridade e data de vencimento
- Suporte a teclas de atalho
- Anexos e recursos avançados

#### EditTaskDialog (`components/edit-task-dialog.tsx`)
Diálogo especializado para edição de tarefas existentes.

**Características:**
- Carregamento automático dos dados da tarefa
- Validação em tempo real
- Histórico de alterações
- Gerenciamento avançado de atributos

### Componentes de Visualização e Organização

#### KanbanBoard (`components/kanban-board.tsx`)
Implementação de quadro Kanban para gerenciamento visual de fluxo de trabalho.

**Características:**
- Colunas configuráveis (Backlog, Planejamento, Em Progresso, Validação, Concluído)
- Drag-and-drop para mover tarefas entre colunas
- Estatísticas por coluna
- Filtros e ordenação avançados
- Personalização visual por coluna
- Animações suaves durante interações

#### CalendarView (`components/calendar-view.tsx`)
Visualização de tarefas em formato de calendário.

**Características:**
- Visualização mensal com navegação intuitiva
- Indicadores visuais para tarefas por dia
- Cores baseadas em prioridade
- Criação rápida de tarefas para datas específicas
- Resumo de tarefas por semana
- Vista resumida e detalhada

#### SearchTasks (`components/search-tasks.tsx`)
Componente de busca avançada para encontrar tarefas específicas.

**Características:**
- Busca por texto, projeto, etiqueta, prioridade
- Filtragem por período de tempo
- Resultados em tempo real
- Histórico de buscas recentes
- Sugestões inteligentes durante a digitação

### Componentes de Produtividade

#### PomodoroTimer (`components/pomodoro-timer.tsx`)
Timer Pomodoro para aplicação da técnica de gerenciamento de tempo.

**Características:**
- Temporizadores configuráveis para trabalho e pausa
- Notificações sonoras e visuais
- Estatísticas de sessões
- Personalização de tempos e sons
- Persistência de configurações
- Integração com reprodutor Spotify
- Feedback visual por cores para diferentes modos (trabalho, pausa curta, pausa longa)
- Integração com tarefas existentes
- Compatibilidade com dispositivos móveis através de interface adaptativa
- Registro automático de sessões via API
- Disparo de eventos personalizados para atualização do histórico

**Propriedades:**
```typescript
interface PomodoroTimerProps {
  selectedTaskId?: number | null    // ID da tarefa associada ao timer
  fullScreen?: boolean              // Modo tela cheia (para mobile)
  timerTextColorClass?: string      // Classe de estilo para o texto do timer
  activeTabStyleClass?: string      // Classe de estilo para a aba ativa
  playButtonColorClass?: string     // Classe de estilo para o botão de play
}
```

#### PomodoroHistory (`components/pomodoro-history.tsx`)
Componente para exibição do histórico de sessões do Pomodoro.

**Características:**
- Exibição de sessões de Pomodoro por tarefa
- Filtros por tipo de sessão (trabalho, pausa curta, pausa longa)
- Indicadores visuais codificados por cores para diferentes tipos de sessão
- Paginação para navegar pelo histórico extenso
- Atualização automática após conclusão de sessões
- Interface responsiva adaptada para desktop e mobile
- Detecção e tratamento de eventos personalizados para atualização em tempo real
- Compatibilidade total com dispositivos móveis

**Propriedades:**
```typescript
interface PomodoroHistoryProps {
  taskId?: string | null       // ID da tarefa para filtrar o histórico
  className?: string           // Classes CSS adicionais para estilização
}
```

**Fluxo de Trabalho do Pomodoro Completo:**
1. Usuário seleciona uma tarefa opcional para associar à sessão
2. Configura o temporizador (tempos de trabalho/pausa nas configurações)
3. Inicia a sessão de trabalho com o botão play
4. Recebe notificação ao término do período de trabalho
5. Sistema registra automaticamente a sessão via API
6. O histórico é atualizado para mostrar a nova sessão
7. O timer muda automaticamente para o modo de pausa
8. O ciclo continua alternando entre trabalho e pausas

#### PersistentSpotifyPlayer (`components/persistent-spotify-player.tsx`)
Reprodutor de música integrado para aumentar a produtividade.

**Características:**
- Autenticação com Spotify
- Reprodução de playlists e músicas
- Controles de reprodução (play, pause, skip)
- Volume e configurações
- Persistência durante navegação
- Sugestões de playlists para produtividade

### Componentes de Navegação e Layout

#### AppHeader (`components/app-header.tsx`)
Cabeçalho principal da aplicação.

**Características:**
- Menu de navegação principal
- Busca rápida de tarefas
- Notificações e alertas
- Acesso a configurações
- Perfil do usuário
- Adaptação responsiva para diferentes telas

#### AppSidebar (`components/app-sidebar.tsx`)
Barra lateral de navegação.

**Características:**
- Navegação por seções (Hoje, Caixa de Entrada, Projetos)
- Lista de projetos com favoritos
- Etiquetas disponíveis
- Acesso rápido a funcionalidades
- Expansão/retração para diferentes tamanhos de tela
- Indicadores visuais para notificações

#### RightColumn (`components/right-column.tsx`)
Coluna lateral direita com informações contextuais.

**Características:**
- Detalhes de tarefas selecionadas
- Sugestões e dicas
- Estatísticas rápidas
- Widgets personalizáveis
- Adaptação a diferentes tamanhos de tela

### Componentes de Autenticação

#### LoginForm (`components/login-form.tsx`)
Formulário de login para autenticação de usuários.

**Características:**
- Validação de campos
- Integração com Auth.js
- Suporte a login social
- Recuperação de senha
- Persistência de sessão
- Proteção contra tentativas excessivas

#### RegisterForm (`components/register-form.tsx`)
Formulário para registro de novos usuários.

**Características:**
- Validação avançada de dados
- Verificação de disponibilidade de email
- Termos e condições
- Personalização inicial de configurações
- Criação de projetos e tarefas iniciais

### Componentes de Configuração

#### SettingsForm (`components/settings-form.tsx`)
Formulário completo para configurações do sistema.

**Características:**
- Personalização da interface
- Preferências de notificações
- Configurações de idioma
- Ajustes do temporizador Pomodoro
- Integrações com serviços externos
- Backup e restauração de dados
- Preferências de visualização de tarefas

#### BackupRestore (`components/backup-restore.tsx`)
Componente para gerenciamento de backup e restauração de dados.

**Características:**
- Exportação de dados em formato JSON
- Importação de backups
- Verificação de integridade
- Agendamento de backups automáticos
- Restauração seletiva de dados

### Componentes de Integração

#### LanguageProvider (`components/language-provider.tsx`)
Provedor de contexto para gerenciamento de idiomas.

**Características:**
- Troca dinâmica de idiomas
- Detecção automática de preferências
- Persistência de configurações
- Suporte a múltiplos idiomas (PT, EN)

#### ThemeProvider (`components/theme-provider.tsx`)
Provedor para gerenciamento de temas visuais.

**Características:**
- Temas claro e escuro
- Detecção de preferências do sistema
- Troca dinâmica sem recarregamento
- Personalização de cores e estilos

#### ModeToggle (`components/mode-toggle.tsx`)
Alternador de modo claro/escuro.

**Características:**
- Interface intuitiva para troca de temas
- Animações durante a transição
- Persistência de preferências
- Adaptação a diferentes posições na UI

### Serviços e Utilitários

#### Lib/todos.ts
Biblioteca central para gerenciamento de tarefas.

**Funções Principais:**
- `getTodayTasks`: Obtém tarefas com vencimento para hoje
- `getInboxTasks`: Obtém todas as tarefas na caixa de entrada
- `getCompletedTasks`: Obtém tarefas concluídas
- `createTask`: Cria nova tarefa com todos os atributos
- `updateTask`: Atualiza tarefa existente
- `toggleTaskCompletion`: Alterna estado de conclusão
- `deleteTask`: Remove tarefa
- `getTaskById`: Obtém tarefa por ID
- `getTaskProject`: Obtém projeto associado a uma tarefa
- `setTaskProject`: Define projeto para uma tarefa
- `getUpcomingTasks`: Obtém tarefas futuras
- `searchTasks`: Busca tarefas por texto
- `getTasksForNotifications`: Obtém tarefas para notificações

#### Lib/projects.ts
Gerenciamento de projetos no sistema.

**Funções Principais:**
- `getProjects`: Lista todos os projetos
- `createProject`: Cria novo projeto
- `updateProject`: Atualiza projeto existente
- `deleteProject`: Remove projeto
- `getProjectTasks`: Obtém tarefas de um projeto específico
- `toggleProjectFavorite`: Alterna status de favorito

#### Lib/labels.ts
Gerenciamento de etiquetas para categorização.

**Funções Principais:**
- `getLabels`: Lista todas as etiquetas
- `createLabel`: Cria nova etiqueta
- `updateLabel`: Atualiza etiqueta existente
- `deleteLabel`: Remove etiqueta
- `getTaskLabels`: Obtém etiquetas de uma tarefa
- `setTaskLabels`: Define etiquetas para uma tarefa

#### Lib/i18n.ts
Sistema de internacionalização.

**Características:**
- Traduções para Português e Inglês
- Suporte a pluralização
- Formatação de datas e números
- Detecção automática de idioma
- Hook personalizado para uso em componentes

#### Lib/pomodoro-context.tsx
Contexto para gerenciamento do timer Pomodoro.

**Características:**
- Estado global para temporizador
- Configurações personalizáveis
- Persistência de estado
- Notificações integradas
- Estatísticas de sessões

#### Lib/audio-utils.ts e Lib/audio.ts
Utilitários para gerenciamento de áudio no sistema.

**Características:**
- Reprodução de notificações sonoras
- Controle de volume
- Carregamento e gerenciamento de recursos de áudio
- Integração com temporizador Pomodoro

## Modelos de Dados

Modelos Prisma principais (resumo): `users`, `sessions`, `todos`, `projects`, `labels`, `snippets`, `attachments`, `pomodoroLog`, `feedback` e relacionadas. Veja `prisma/schema.prisma` para definição completa.

### Todo (Tarefa)
```typescript
type Todo = {
  id: number
  title: string
  description: string | null
  due_date: string | null
  priority: number  // 1: Grave, 2: Alta, 3: Média, 4: Baixa
  completed: boolean
  created_at: string
  updated_at: string | null
  project_name?: string
  project_color?: string
  kanban_column?: "backlog" | "planning" | "inProgress" | "validation" | "completed" | null
  points?: number  // 1: Muito Fácil, 2: Fácil, 3: Médio, 4: Difícil, 5: Muito Difícil
  attachments?: any[]
  estimated_time?: number | null
}
```

### Project (Projeto)
```typescript
type Project = {
  id: number
  name: string
  color: string
  is_favorite: boolean
  user_id: number
  created_at: string
}
```

### Label (Etiqueta)
```typescript
type Label = {
  id: number
  name: string
  color: string
  user_id: number
  created_at: string
}
```

### User (Usuário)
```typescript
type User = {
  id: number
  email: string
  name: string | null
  created_at: string
  settings?: UserSettings
}
```

### UserSettings (Configurações do Usuário)
```typescript
type UserSettings = {
  theme: "light" | "dark" | "system"
  language: "pt" | "en"
  pomodoro: {
    workTime: number
    shortBreakTime: number
    longBreakTime: number
    longBreakInterval: number
    autoStartBreaks: boolean
    autoStartPomodoros: boolean
    alarmSound: string
    alarmVolume: number
  }
  notifications: {
    browser: boolean
    email: boolean
    dueDateReminder: boolean
    reminderTime: number  // horas antes do vencimento
  }
  spotify: {
    enabled: boolean
    showPlayer: boolean
    defaultPlaylist: string | null
  }
}
```

## Funcionalidades

### Gerenciamento de Tarefas

#### Criação de Tarefas
Os usuários podem criar tarefas com:
- Título (obrigatório)
- Descrição (opcional)
- Data/hora de vencimento (opcional)
- Nível de prioridade (Grave, Alta, Média, Baixa)
- Projeto associado (opcional)
- Etiquetas (opcional)
- Pontuação de dificuldade (1-5)
- Tempo estimado de conclusão
- Anexos (arquivos, links)
- Posição no quadro Kanban

#### Visualização de Tarefas
Diferentes visualizações são fornecidas:
- **Hoje**: Tarefas com vencimento para o dia atual
- **Caixa de Entrada**: Todas as tarefas não concluídas
- **Próximos**: Tarefas futuras
- **Concluídos**: Tarefas completadas
- **Projeto**: Tarefas agrupadas por projeto
- **Etiqueta**: Tarefas com uma etiqueta específica
- **Calendário**: Visualização temporal
- **Kanban**: Visualização de fluxo de trabalho

#### Edição de Tarefas
A edição de tarefas é realizada através do modal de detalhes, com dois modos:
- **Modo de Visualização**: Permite ver os detalhes da tarefa
- **Modo de Edição**: Permite modificar todos os atributos da tarefa

#### Gerenciamento de Projetos
Suporte completo para organização por projetos:
- Criação de projetos com cores personalizadas
- Marcação de projetos como favoritos
- Visualização de tarefas por projeto
- Estatísticas de progresso por projeto
- Filtros e ordenação dentro de projetos

#### Sistema de Etiquetas
Categorização flexível através de etiquetas:
- Criação de etiquetas com cores personalizadas
- Atribuição de múltiplas etiquetas a tarefas
- Filtragem de tarefas por etiqueta
- Visualização de tarefas por etiqueta

### Produtividade

#### Temporizador Pomodoro
Ferramenta completa para aplicação da técnica Pomodoro:
- Temporizadores configuráveis para trabalho e pausas
- Notificações sonoras e visuais
- Estatísticas de sessões
- Integração com tarefas
- Personalização completa de tempos e comportamentos

#### Integração com Spotify
Reprodução de música para aumentar a produtividade:
- Login com conta Spotify
- Reprodução de playlists de foco
- Controles de reprodução integrados
- Player persistente durante navegação
- Sugestões personalizadas

### Interface e Usabilidade

#### Temas
Suporte a diferentes temas visuais:
- Tema claro para uso diurno
- Tema escuro para redução de fadiga visual
- Detecção automática de preferências do sistema
- Personalização de cores e contrastes

#### Responsividade
Adaptação a diferentes dispositivos e tamanhos de tela:
- Layout responsivo para desktop, tablet e mobile
- Reorganização inteligente de componentes
- Comportamentos otimizados para touch e mouse
- Mudanças dinâmicas durante redimensionamento

#### Atalhos de Teclado
Suporte a atalhos para usuários avançados:
- Navegação entre seções
- Criação rápida de tarefas
- Edição e gerenciamento
- Customização de atalhos

### Integrações

#### Notificações
Sistema completo de alertas e lembretes:
- Notificações no navegador
- Lembretes próximos ao vencimento
- Resumo diário de tarefas
- Configurações personalizáveis

#### Backup e Restauração
Proteção contra perda de dados:
- Exportação completa de dados
- Importação de backups
- Verificação de integridade
- Programação de backups automáticos

## Internacionalização (i18n)

O Íris produtividade oferece suporte completo a múltiplos idiomas, atualmente:
- Português (Brasil)
- Inglês

O sistema de internacionalização gerencia:
- Traduções de textos da interface
- Formatação de datas adaptada ao idioma
- Formatação de números e valores
- Pluralização correta por idioma

A estrutura utiliza:
- Arquivo centralizado de traduções (`lib/i18n.ts`)
- Hook personalizado para acesso fácil em componentes
- Detecção automática de preferência do usuário
- Persistência de escolha de idioma

## Fluxos de Trabalho

### Fluxo de Criação de Tarefa
1. Usuário clica no botão de criação ou usa atalho
2. O componente `AddTaskDialog` é exibido
3. Usuário preenche detalhes da tarefa
4. Validação em tempo real é realizada
5. Ao confirmar, a função `createTask` é chamada
6. A API processa a solicitação e adiciona ao banco
7. Feedback visual é fornecido ao usuário
8. A lista de tarefas é atualizada para mostrar o novo item

### Fluxo de Edição de Tarefa
1. Usuário seleciona uma tarefa existente
2. O componente `TaskDetail` exibe os detalhes
3. Usuário clica em "Editar" para entrar no modo de edição
4. Modificações são realizadas nos campos
5. Ao salvar, a função `updateTask` é chamada
6. A API atualiza os dados no banco
7. Feedback visual confirma a operação
8. As visualizações são atualizadas com os novos dados

### Fluxo de Trabalho Kanban
1. Usuário acessa a visualização Kanban
2. O componente `KanbanBoard` carrega as tarefas por coluna
3. Tarefas podem ser arrastadas entre colunas
4. Ao soltar, a função `updateTask` atualiza o `kanban_column`
5. Transições visuais indicam o progresso das tarefas
6. Estatísticas são atualizadas por coluna

### Fluxo do Temporizador Pomodoro
1. Usuário inicia sessão Pomodoro
2. Temporizador começa contagem regressiva
3. Notificações são exibidas ao concluir períodos
4. Sessões são registradas para estatísticas
5. Integração opcional com tarefas ativas

## API Endpoints

A API do Íris produtividade segue os princípios REST e fornece os seguintes endpoints principais:

* Autenticação: `/api/auth/*` (login, registro, logout, etc.)
* Tarefas: `/api/tasks/*` (CRUD, listagem, filtros)
* Projetos: `/api/projects/*` (CRUD, listagem)
* Etiquetas: `/api/labels/*` (CRUD, listagem)
* Configurações: `/api/settings/*`
* Perfil: `/api/profile/*`
* Notificações: `/api/notifications/*`
* Anexos: `/api/attachments/*` e `/api/upload`
* Backup: `/api/backup/*` (exportar, importar)
* Relatórios: `/api/reports/pdf`
* Pomodoro: `/api/pomodoro/*` (registro e histórico de sessões)
* IA: `/api/ai/ask` (Gemini)

Observações da IA:
- A rota `/api/ai/ask` usa Gemini 1.5 Flash com contexto do projeto construído em runtime.
- Requer `GEMINI_API_KEY` ou `GOOGLE_GEMINI_API_KEY` no servidor.
- Implementado retry com contexto reduzido para erros 400/413 por tamanho e limitação a 10 mensagens recentes.

### Endpoints de Pomodoro

#### `POST /api/pomodoro/log`
Registra uma sessão de Pomodoro concluída no banco de dados.

**Payload:**
```json
{
  "taskId": number | null,   // ID da tarefa associada (opcional)
  "duration": number,        // Duração em minutos
  "mode": "work" | "shortBreak" | "longBreak"   // Tipo de sessão
}
```

**Resposta:**
```json
{
  "success": true,
  "pomodoroSession": {
    "id": string,
    "userId": string,
    "taskId": number | null,
    "duration": number,
    "mode": string,
    "startedAt": string,
    "completedAt": string
  }
}
```

**Observações:**
- Implementa cabeçalhos anti-cache para garantir compatibilidade com dispositivos móveis
- Headers adicionais: `Cache-Control: no-cache, no-store, must-revalidate`, `Pragma: no-cache`, `Expires: 0`
- Logs detalhados para depuração em situações problemáticas

#### `GET /api/pomodoro/log`
Recupera o histórico de sessões de Pomodoro com suporte a filtros e paginação.

**Parâmetros:**
- `taskId`: (opcional) Filtra por tarefa específica
- `page`: Página atual (padrão: 1)
- `limit`: Limite de registros por página (padrão: 50)
- `t`: Cache buster timestamp para evitar problemas de cache em dispositivos móveis

**Resposta:**
```json
{
  "success": true,
  "pomodoroLogs": [
    {
      "id": string,
      "userId": string,
      "taskId": number | null,
      "duration": number,
      "mode": string,
      "startedAt": string,
      "completedAt": string,
      "task": {
        "id": number,
        "title": string
      } | null
    }
  ],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "totalPages": number
  }
}
```

**Observações:**
- Implementa cabeçalhos anti-cache para garantir compatibilidade com dispositivos móveis
- Otimizado para todas as plataformas (desktop e dispositivos móveis)
- Inclui ordenação por data de conclusão (mais recentes primeiro)

### Componentes de Produtividade

#### PomodoroTimer (`components/pomodoro-timer.tsx`)
Timer Pomodoro para aplicação da técnica de gerenciamento de tempo.

**Características:**
- Temporizadores configuráveis para trabalho e pausa
- Notificações sonoras e visuais
- Estatísticas de sessões
- Personalização de tempos e sons
- Persistência de configurações
- Integração com reprodutor Spotify
- Feedback visual por cores para diferentes modos (trabalho, pausa curta, pausa longa)
- Integração com tarefas existentes
- Compatibilidade com dispositivos móveis através de interface adaptativa
- Registro automático de sessões via API
- Disparo de eventos personalizados para atualização do histórico

**Propriedades:**
```typescript
interface PomodoroTimerProps {
  selectedTaskId?: number | null    // ID da tarefa associada ao timer
  fullScreen?: boolean              // Modo tela cheia (para mobile)
  timerTextColorClass?: string      // Classe de estilo para o texto do timer
  activeTabStyleClass?: string      // Classe de estilo para a aba ativa
  playButtonColorClass?: string     // Classe de estilo para o botão de play
}
```

#### PomodoroHistory (`components/pomodoro-history.tsx`)
Componente para exibição do histórico de sessões do Pomodoro.

**Características:**
- Exibição de sessões de Pomodoro por tarefa
- Filtros por tipo de sessão (trabalho, pausa curta, pausa longa)
- Indicadores visuais codificados por cores para diferentes tipos de sessão
- Paginação para navegar pelo histórico extenso
- Atualização automática após conclusão de sessões
- Interface responsiva adaptada para desktop e mobile
- Detecção e tratamento de eventos personalizados para atualização em tempo real
- Compatibilidade total com dispositivos móveis

**Propriedades:**
```typescript
interface PomodoroHistoryProps {
  taskId?: string | null       // ID da tarefa para filtrar o histórico
  className?: string           // Classes CSS adicionais para estilização
}
```

**Fluxo de Trabalho do Pomodoro Completo:**
1. Usuário seleciona uma tarefa opcional para associar à sessão
2. Configura o temporizador (tempos de trabalho/pausa nas configurações)
3. Inicia a sessão de trabalho com o botão play
4. Recebe notificação ao término do período de trabalho
5. Sistema registra automaticamente a sessão via API
6. O histórico é atualizado para mostrar a nova sessão
7. O timer muda automaticamente para o modo de pausa
8. O ciclo continua alternando entre trabalho e pausas

#### PersistentSpotifyPlayer (`components/persistent-spotify-player.tsx`)
Reprodutor de música integrado para aumentar a produtividade.

**Características:**
- Autenticação com Spotify
- Reprodução de playlists e músicas
- Controles de reprodução (play, pause, skip)
- Volume e configurações
- Persistência durante navegação
- Sugestões de playlists para produtividade

### Interface e Usabilidade

#### Temas
Suporte a diferentes temas visuais:
- Tema claro para uso diurno
- Tema escuro para redução de fadiga visual
- Detecção automática de preferências do sistema
- Personalização de cores e contrastes

#### Responsividade
Adaptação a diferentes dispositivos e tamanhos de tela:
- Layout responsivo para desktop, tablet e mobile
- Reorganização inteligente de componentes
- Comportamentos otimizados para touch e mouse
- Mudanças dinâmicas durante redimensionamento

#### Atalhos de Teclado
Suporte a atalhos para usuários avançados:
- Navegação entre seções
- Criação rápida de tarefas
- Edição e gerenciamento
- Customização de atalhos

### Integrações

#### Notificações
Sistema completo de alertas e lembretes:
- Notificações no navegador
- Lembretes próximos ao vencimento
- Resumo diário de tarefas
- Configurações personalizáveis

#### Backup e Restauração
Proteção contra perda de dados:
- Exportação completa de dados
- Importação de backups
- Verificação de integridade
- Programação de backups automáticos

## Internacionalização (i18n)

O Íris produtividade oferece suporte completo a múltiplos idiomas, atualmente:
- Português (Brasil)
- Inglês

O sistema de internacionalização gerencia:
- Traduções de textos da interface
- Formatação de datas adaptada ao idioma
- Formatação de números e valores
- Pluralização correta por idioma

A estrutura utiliza:
- Arquivo centralizado de traduções (`lib/i18n.ts`)
- Hook personalizado para acesso fácil em componentes
- Detecção automática de preferência do usuário
- Persistência de escolha de idioma

## Fluxos de Trabalho

### Fluxo de Criação de Tarefa
1. Usuário clica no botão de criação ou usa atalho
2. O componente `AddTaskDialog` é exibido
3. Usuário preenche detalhes da tarefa
4. Validação em tempo real é realizada
5. Ao confirmar, a função `createTask` é chamada
6. A API processa a solicitação e adiciona ao banco
7. Feedback visual é fornecido ao usuário
8. A lista de tarefas é atualizada para mostrar o novo item

### Fluxo de Edição de Tarefa
1. Usuário seleciona uma tarefa existente
2. O componente `TaskDetail` exibe os detalhes
3. Usuário clica em "Editar" para entrar no modo de edição
4. Modificações são realizadas nos campos
5. Ao salvar, a função `updateTask` é chamada
6. A API atualiza os dados no banco
7. Feedback visual confirma a operação
8. As visualizações são atualizadas com os novos dados

### Fluxo de Trabalho Kanban
1. Usuário acessa a visualização Kanban
2. O componente `KanbanBoard` carrega as tarefas por coluna
3. Tarefas podem ser arrastadas entre colunas
4. Ao soltar, a função `updateTask` atualiza o `kanban_column`
5. Transições visuais indicam o progresso das tarefas
6. Estatísticas são atualizadas por coluna

### Fluxo do Temporizador Pomodoro
1. Usuário inicia sessão Pomodoro
2. Temporizador começa contagem regressiva
3. Notificações são exibidas ao concluir períodos
4. Sessões são registradas para estatísticas
5. Integração opcional com tarefas ativas

## Performance e Otimização

### Estratégias de Renderização
- Renderização híbrida (SSR/CSR) com Next.js
- Carregamento otimizado de componentes
- Lazy loading para módulos pesados
- Memoização de componentes frequentes

### Banco de Dados
- Queries otimizadas para performance
- Índices estratégicos
- Pooling de conexões
- Cache de dados frequentes

### Frontend
- Code splitting para redução de bundle
- Otimização de imagens e assets
- Prefetching de rotas comuns
- Otimizações Next 15 (chunks, parallelServerCompiles); Tailwind JIT.

## Segurança

### Autenticação
- Senhas com hash seguro (bcrypt)
- Sessão baseada em cookie `session_token` (`lib/auth.ts`, tabela `sessions`)

### Autorização
- Verificação de propriedade de recursos
- Escopo de acesso por usuário
- Validação de permissões em cada operação
- Sanitização de inputs

### Proteção de Dados
- Criptografia em trânsito (HTTPS)
- Validação de entradas em todos os endpoints
- Proteção contra injeção SQL
- Política padrão Next; acessar via mesmo domínio.

## Guia Rápido (Local)

1. Configure `.env.local` com as variáveis acima
2. Crie o banco e rode migrações

```
pnpm i
pnpm prisma migrate dev
pnpm dev
```

3. Acesse `http://localhost:3000`

## Troubleshooting

- CSS 404 em `/_next/static/css/app/layout.css`:
  - Verifique import em `app/layout.tsx` como `import "./globals.css"`
  - Limpe `.next` e reinicie: `rm -rf .next && pnpm dev`
- IA respondendo com erro:
  - Verifique `GEMINI_API_KEY` no servidor
  - Confirme login ativo; rota retorna 401 se não autenticado
  - Logs da rota: `app/api/ai/ask/route.ts`

## Manutenção e Suporte

### Atualizações
- Changelog detalhado de versões
- Migrações transparentes de banco
- Notificações de novos recursos
- Compatibilidade retroativa

### Monitoramento
- Logs de erro estruturados
- Monitoramento de performance
- Alertas para comportamentos anômalos
- Feedback de usuários

### Recuperação
- Sistema de backup automatizado
- Restauração pontual de dados
- Procedimentos de disaster recovery
- Auditoria de operações críticas
