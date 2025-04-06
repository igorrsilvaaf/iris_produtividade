# To-Do-Ist: Sistema de Gerenciamento de Tarefas

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
10. [Guia de Uso](#guia-de-uso)
11. [Performance e Otimização](#performance-e-otimização)
12. [Segurança](#segurança)
13. [Manutenção e Suporte](#manutenção-e-suporte)

## Visão Geral

To-Do-Ist é um sistema avançado de gerenciamento de tarefas desenvolvido com tecnologias modernas. O sistema permite aos usuários criar, organizar, priorizar e acompanhar tarefas em diferentes contextos, como hoje, caixa de entrada e projetos específicos.

### Principais Características

- Interface amigável e responsiva
- Organização de tarefas por projetos e etiquetas
- Sistema de priorização (Grave, Alta, Média, Baixa)
- Funcionalidade de calendário para visualização temporal
- Temporizador Pomodoro integrado
- Suporte para múltiplos idiomas (Português e Inglês)
- Temas claro e escuro

## Arquitetura do Sistema

O To-Do-Ist segue uma arquitetura moderna baseada em componentes, utilizando o React com Next.js para renderização no servidor e cliente. O sistema é construído seguindo os princípios de design atômico e componentização.

### Estrutura de Diretórios

```
To-Do-Ist/
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
```

### Fluxo de Dados

O sistema segue um padrão de fluxo de dados unidirecional:

1. Ações do usuário geram eventos
2. Handlers processam eventos e fazem chamadas à API
3. API processa solicitações e atualiza o banco de dados
4. Componentes são atualizados com novos dados via refresh ou revalidação

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
- **PostgreSQL**: Banco de dados relacional (via Neon)
- **Neon Serverless**: Banco de dados PostgreSQL serverless
- **Auth.js**: Sistema de autenticação

### DevOps
- **Node.js**: Ambiente de execução JavaScript
- **npm**: Gerenciador de pacotes
- **Git**: Controle de versão

## Componentes Principais

### Componentes de UI

#### TaskList
O `TaskList` é um componente fundamental que exibe uma lista de tarefas com funcionalidades de:
- Ordenação por prioridade, título ou data de vencimento
- Visualização de detalhes de tarefas
- Marcação de tarefas como concluídas
- Exclusão de tarefas

```typescript
interface TaskListProps {
  tasks: Todo[]
}
```

#### TaskDetail
O `TaskDetail` permite visualizar e editar detalhes de uma tarefa específica:
- Modo de visualização (padrão)
- Modo de edição (ativado pelo botão editar)
- Edição de título, descrição, data de vencimento, prioridade, projeto
- Gerenciamento de etiquetas

```typescript
interface TaskDetailProps {
  task: Todo
  open: boolean
  onOpenChange: (open: boolean) => void
}
```

#### PomodoroTimer
Timer Pomodoro integrado com funcionalidades de:
- Temporizadores configuráveis para trabalho e pausas
- Notificações sonoras e visuais
- Persistência do estado entre navegações
- Configurações personalizáveis

#### CalendarView
Visualização de tarefas em formato de calendário mensal:
- Navegação entre meses
- Exibição de tarefas por dia
- Identificação visual de prioridades
- Adição rápida de tarefas para datas específicas

### Componentes Funcionais

#### LanguageProvider
Gerencia o estado e troca de idiomas no aplicativo.

#### ThemeProvider
Controla o tema (claro/escuro) da aplicação.

#### I18nProvider
Provedor de contexto para internacionalização.

### Lógica de Negócios

#### lib/todos.ts
Funções para interação com o banco de dados relacionadas a tarefas:
- `getTodayTasks`
- `getInboxTasks`
- `createTask`
- `updateTask`
- `deleteTask`
- `toggleTaskCompletion`
- etc.

#### lib/projects.ts
Gerenciamento de projetos:
- `getProjects`
- `createProject`
- `updateProject`
- `deleteProject`
- `getProjectTasks`

#### lib/labels.ts
Gerenciamento de etiquetas:
- `getLabels`
- `createLabel`
- `updateLabel`
- `deleteLabel`
- `getTaskLabels`

## Modelos de Dados

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

#### Visualização de Tarefas
Diferentes visualizações são fornecidas:
- **Hoje**: Tarefas com vencimento para o dia atual
- **Caixa de Entrada**: Todas as tarefas não concluídas
- **Próximos**: Tarefas futuras
- **Concluídos**: Tarefas completadas
- **Projeto**: Tarefas agrupadas por projeto
- **Etiqueta**: Tarefas com uma etiqueta específica
- **Calendário**: Visualização temporal

#### Edição de Tarefas
A edição de tarefas é realizada através do modal de detalhes, com dois modos:
- **Modo de Visualização**: Permite ver os detalhes da tarefa
- **Modo de Edição**: Permite modificar todos os campos

#### Ordenação de Tarefas
As tarefas podem ser ordenadas por:
- **Prioridade**: Grave → Alta → Média → Baixa
- **Título**: Ordem alfabética
- **Data de vencimento**: Do mais próximo ao mais distante

### Projetos e Etiquetas

Os usuários podem organizar tarefas usando:
- **Projetos**: Agrupamentos principais com cores personalizadas
- **Etiquetas**: Categorias transversais que podem ser aplicadas a qualquer tarefa

### Temporizador Pomodoro

Um temporizador integrado que segue a técnica Pomodoro:
- Períodos de trabalho configuráveis (padrão: 25 minutos)
- Pausas curtas (padrão: 5 minutos)
- Pausas longas após um número definido de ciclos (padrão: 15 minutos após 4 ciclos)
- Notificações sonoras e visuais
- Persistência do estado entre navegações

### Calendário

Visualização de tarefas em formato de calendário:
- Navegação mensal
- Indicadores visuais de prioridade
- Adição rápida de tarefas
- Detalhes de tarefas acessíveis por clique

## Internacionalização (i18n)

O sistema suporta múltiplos idiomas, atualmente:
- Português (pt)
- Inglês (en)

### Implementação

A internacionalização é gerenciada através de:
1. `lib/i18n.ts`: Definição das traduções
2. `components/language-provider.tsx`: Provedor de contexto para idioma
3. O hook `useTranslation()` para acesso às funções de tradução

### Exemplo de Uso

```tsx
const { t, language, setLanguage } = useTranslation();

// Usando tradução
<Button>{t("save")}</Button>

// Mudando o idioma
<Button onClick={() => setLanguage("en")}>English</Button>
```

## Fluxos de Trabalho

### Fluxo de Adição de Tarefa
1. Usuário clica em "Adicionar Tarefa"
2. Preenche dados no modal de adição
3. Submete o formulário
4. API cria a tarefa no banco de dados
5. UI atualiza mostrando a nova tarefa

### Fluxo de Edição de Tarefa
1. Usuário clica em uma tarefa para abrir detalhes
2. Visualiza detalhes no modo de visualização
3. Clica em "Editar" para entrar no modo de edição
4. Modifica os campos desejados
5. Clica em "Salvar" para persistir as alterações

### Fluxo de Temporizador Pomodoro
1. Usuário configura duração dos períodos (opcional)
2. Inicia o temporizador de trabalho
3. Após o término, recebe notificação
4. Inicia período de pausa
5. O ciclo continua, com pausas longas após o número definido de ciclos

## API Endpoints

### Tarefas
- `GET /api/tasks/today`: Obtém tarefas do dia
- `GET /api/tasks/upcoming`: Obtém tarefas futuras
- `GET /api/tasks/[id]`: Obtém detalhes de uma tarefa
- `POST /api/tasks`: Cria uma nova tarefa
- `PATCH /api/tasks/[id]`: Atualiza uma tarefa
- `DELETE /api/tasks/[id]`: Remove uma tarefa
- `PATCH /api/tasks/[id]/toggle`: Alterna o status de conclusão

### Projetos
- `GET /api/projects`: Lista todos os projetos
- `GET /api/projects/[id]`: Obtém detalhes de um projeto
- `POST /api/projects`: Cria um novo projeto
- `PATCH /api/projects/[id]`: Atualiza um projeto
- `DELETE /api/projects/[id]`: Remove um projeto

### Etiquetas
- `GET /api/labels`: Lista todas as etiquetas
- `GET /api/labels/[id]`: Obtém detalhes de uma etiqueta
- `POST /api/labels`: Cria uma nova etiqueta
- `PATCH /api/labels/[id]`: Atualiza uma etiqueta
- `DELETE /api/labels/[id]`: Remove uma etiqueta

### Usuários
- `POST /api/auth/register`: Registra um novo usuário
- `POST /api/auth/login`: Autentica um usuário

## Guia de Uso

### Navegação Básica

A navegação principal é realizada através da barra lateral:
- **Hoje**: Tarefas com vencimento hoje
- **Caixa de Entrada**: Todas as tarefas não concluídas
- **Próximos**: Tarefas futuras
- **Concluídos**: Tarefas finalizadas
- **Projetos**: Lista de projetos com suas tarefas
- **Etiquetas**: Lista de etiquetas com suas tarefas
- **Calendário**: Visualização em formato de calendário

### Gerenciando Tarefas

1. **Adicionar Tarefa**:
   - Clique no botão "Adicionar Tarefa"
   - Preencha pelo menos o título
   - Adicione opcionalmente data, prioridade, projeto e descrição

2. **Editar Tarefa**:
   - Clique na tarefa para abrir detalhes
   - Clique no botão "Editar"
   - Modifique os campos desejados
   - Clique em "Salvar"

3. **Concluir Tarefa**:
   - Clique no checkbox ao lado da tarefa

4. **Priorizar Tarefa**:
   - Ao criar ou editar, selecione o nível de prioridade:
     - **Grave**: Tarefas críticas, urgentes
     - **Alta**: Tarefas importantes e urgentes
     - **Média**: Tarefas importantes, mas não urgentes
     - **Baixa**: Tarefas de menor importância

### Organizando seu Trabalho

1. **Criar Projetos**:
   - Clique em "+" ao lado de "Projetos" 
   - Dê um nome e escolha uma cor

2. **Usar Etiquetas**:
   - Crie etiquetas para categorias transversais
   - Adicione a tarefas durante criação ou edição

3. **Técnica Pomodoro**:
   - Use o temporizador Pomodoro para ciclos de foco
   - Trabalhe durante o período configurado
   - Faça pequenas pausas entre ciclos
   - Faça uma pausa maior após completar múltiplos ciclos

## Performance e Otimização

### Estratégias de Carregamento
- Componentes são carregados com lazy loading quando apropriado
- Dados são pré-carregados no servidor quando possível
- Cache de componentes é utilizado para minimizar recálculos

### Otimizações de Renderização
- `useMemo` e `useCallback` para prevenir recálculos desnecessários
- Virtualização para listas longas
- Estratégias de revalidação de dados otimizadas

## Segurança

### Autenticação e Autorização
- Sistema de login baseado em sessão
- Proteção de rotas para usuários autenticados
- Validação de propriedade de recursos (tarefas, projetos, etiquetas)

### Proteção de Dados
- Comunicação via HTTPS
- Validação de entrada em todos os endpoints
- Sanitização de dados antes de inserção no banco

## Manutenção e Suporte

### Versionamento
O sistema segue o versionamento semântico (SemVer):
- **Patch (0.0.X)**: Correções de bugs
- **Minor (0.X.0)**: Novas funcionalidades sem quebra de compatibilidade
- **Major (X.0.0)**: Mudanças incompatíveis com versões anteriores

### Contribuições
1. Fork o repositório
2. Crie uma branch para sua feature ou correção
3. Implemente as mudanças
4. Envie um Pull Request

### Suporte
Para dúvidas ou problemas, abra uma issue no repositório do GitHub ou entre em contato com a equipe de suporte.
