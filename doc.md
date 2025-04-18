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
10. [APIs e Integrações Detalhadas](#apis-e-integrações-detalhadas)
11. [Guia de Uso](#guia-de-uso)
12. [Performance e Otimização](#performance-e-otimização)
13. [Segurança](#segurança)
14. [Manutenção e Suporte](#manutenção-e-suporte)

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

## APIs e Integrações Detalhadas

Esta seção fornece informações detalhadas sobre todas as APIs disponíveis no sistema, incluindo parâmetros, respostas, códigos de erro e exemplos de uso. A documentação cobre tanto as APIs internas quanto as integrações com serviços externos.

### Estrutura das Respostas da API

Todas as APIs do sistema seguem uma estrutura de resposta padronizada:

#### Resposta de Sucesso
```json
{
  "status": "success",
  "data": { /* Dados retornados */ }
}
```

#### Resposta de Erro
```json
{
  "status": "error",
  "message": "Descrição do erro",
  "code": "ERRO_CODE"
}
```

### Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Parâmetros inválidos ou ausentes
- `401 Unauthorized`: Autenticação necessária
- `403 Forbidden`: Sem permissão para acessar o recurso
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro interno do servidor

### APIs de Autenticação

#### Registro de Usuário
- **Endpoint**: `POST /api/auth/register`
- **Descrição**: Registra um novo usuário no sistema
- **Parâmetros de Requisição**:
  ```json
  {
    "email": "usuario@exemplo.com",
    "password": "senha123",
    "name": "Nome do Usuário"
  }
  ```
- **Resposta de Sucesso** (201 Created):
  ```json
  {
    "status": "success",
    "data": {
      "id": 123,
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário",
      "created_at": "2023-01-01T00:00:00Z"
    }
  }
  ```
- **Erros Possíveis**:
  - `400 Bad Request`: Email inválido ou senha muito curta
  - `409 Conflict`: Email já registrado

#### Login de Usuário
- **Endpoint**: `POST /api/auth/login`
- **Descrição**: Autentica um usuário existente
- **Parâmetros de Requisição**:
  ```json
  {
    "email": "usuario@exemplo.com",
    "password": "senha123"
  }
  ```
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "id": 123,
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Erros Possíveis**:
  - `400 Bad Request`: Parâmetros inválidos
  - `401 Unauthorized`: Credenciais inválidas

#### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Descrição**: Finaliza a sessão do usuário
- **Parâmetros de Requisição**: Nenhum
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "message": "Logout realizado com sucesso"
    }
  }
  ```

### APIs de Tarefas

#### Listar Tarefas de Hoje
- **Endpoint**: `GET /api/tasks/today`
- **Descrição**: Retorna todas as tarefas com vencimento no dia atual
- **Parâmetros de Query**:
  - `sort`: Campo para ordenação (opcional, default: `priority`)
  - `order`: Direção da ordenação (`asc` ou `desc`, opcional, default: `asc`)
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "tasks": [
        {
          "id": 1,
          "title": "Concluir relatório",
          "description": "Finalizar relatório de vendas do mês",
          "due_date": "2023-05-20T23:59:59Z",
          "priority": 2,
          "completed": false,
          "created_at": "2023-05-19T14:30:00Z",
          "updated_at": null,
          "project_name": "Marketing",
          "project_color": "#ff5722"
        },
        // ... outras tarefas
      ]
    }
  }
  ```

#### Listar Tarefas da Caixa de Entrada
- **Endpoint**: `GET /api/tasks/inbox`
- **Descrição**: Retorna todas as tarefas não concluídas
- **Parâmetros de Query**:
  - `sort`: Campo para ordenação (opcional, default: `created_at`)
  - `order`: Direção da ordenação (`asc` ou `desc`, opcional, default: `desc`)
  - `page`: Número da página (opcional, default: 1)
  - `limit`: Itens por página (opcional, default: 50)
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "tasks": [
        // Array de tarefas (mesmo formato do endpoint anterior)
      ],
      "pagination": {
        "total": 120,
        "page": 1,
        "limit": 50,
        "pages": 3
      }
    }
  }
  ```

#### Listar Tarefas Próximas
- **Endpoint**: `GET /api/tasks/upcoming`
- **Descrição**: Retorna tarefas com vencimento futuro
- **Parâmetros de Query**: Mesmos do endpoint de inbox
- **Resposta de Sucesso**: Mesmo formato do endpoint de inbox

#### Listar Tarefas Concluídas
- **Endpoint**: `GET /api/tasks/completed`
- **Descrição**: Retorna tarefas já concluídas
- **Parâmetros de Query**: 
  - Mesmos do endpoint de inbox
  - `since`: Data de início para filtro (opcional, formato ISO 8601)
- **Resposta de Sucesso**: Mesmo formato do endpoint de inbox

#### Obter Detalhes de uma Tarefa
- **Endpoint**: `GET /api/tasks/[id]`
- **Descrição**: Retorna detalhes de uma tarefa específica
- **Parâmetros de URL**: 
  - `id`: ID da tarefa
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "task": {
        "id": 1,
        "title": "Concluir relatório",
        "description": "Finalizar relatório de vendas do mês",
        "due_date": "2023-05-20T23:59:59Z",
        "priority": 2,
        "completed": false,
        "created_at": "2023-05-19T14:30:00Z",
        "updated_at": null,
        "project_name": "Marketing",
        "project_color": "#ff5722",
        "labels": [
          {
            "id": 3,
            "name": "Importante",
            "color": "#e91e63"
          }
        ]
      }
    }
  }
  ```
- **Erros Possíveis**:
  - `404 Not Found`: Tarefa não encontrada

#### Criar Tarefa
- **Endpoint**: `POST /api/tasks`
- **Descrição**: Cria uma nova tarefa
- **Parâmetros de Requisição**:
  ```json
  {
    "title": "Nova tarefa",
    "description": "Descrição da tarefa",
    "dueDate": "2023-05-25T23:59:59Z",
    "priority": 3,
    "projectId": 2,
    "labelIds": [1, 3]
  }
  ```
- **Resposta de Sucesso** (201 Created):
  ```json
  {
    "status": "success",
    "data": {
      "task": {
        "id": 42,
        "title": "Nova tarefa",
        "description": "Descrição da tarefa",
        "due_date": "2023-05-25T23:59:59Z",
        "priority": 3,
        "completed": false,
        "created_at": "2023-05-20T15:45:30Z",
        "updated_at": null
      }
    }
  }
  ```
- **Observações de Implementação**:
  - A data de vencimento (`dueDate`) é normalizada para 23:59:59 do dia especificado
  - Prioridades válidas: 1 (Grave), 2 (Alta), 3 (Média), 4 (Baixa)

#### Atualizar Tarefa
- **Endpoint**: `PATCH /api/tasks/[id]`
- **Descrição**: Atualiza uma tarefa existente
- **Parâmetros de URL**: 
  - `id`: ID da tarefa
- **Parâmetros de Requisição** (todos opcionais):
  ```json
  {
    "title": "Título atualizado",
    "description": "Nova descrição",
    "dueDate": "2023-05-26T23:59:59Z",
    "priority": 2,
    "completed": true
  }
  ```
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "task": {
        // Dados da tarefa atualizada
      }
    }
  }
  ```
- **Erros Possíveis**:
  - `404 Not Found`: Tarefa não encontrada
  - `400 Bad Request`: Dados inválidos

#### Alternar Status de Conclusão
- **Endpoint**: `PATCH /api/tasks/[id]/toggle`
- **Descrição**: Alterna o status de conclusão de uma tarefa (concluída ↔ não concluída)
- **Parâmetros de URL**: 
  - `id`: ID da tarefa
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "task": {
        // Dados da tarefa com status atualizado
        "completed": true,
        "updated_at": "2023-05-20T16:30:45Z"
      }
    }
  }
  ```

#### Excluir Tarefa
- **Endpoint**: `DELETE /api/tasks/[id]`
- **Descrição**: Remove permanentemente uma tarefa
- **Parâmetros de URL**: 
  - `id`: ID da tarefa
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "message": "Tarefa excluída com sucesso"
    }
  }
  ```

### APIs de Projetos

#### Listar Projetos
- **Endpoint**: `GET /api/projects`
- **Descrição**: Retorna todos os projetos do usuário
- **Parâmetros de Query**:
  - `includeTaskCount`: Inclui contagem de tarefas (opcional, default: `false`)
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "projects": [
        {
          "id": 1,
          "name": "Marketing",
          "color": "#ff5722",
          "is_favorite": true,
          "created_at": "2023-04-10T09:15:00Z",
          "task_count": 12
        },
        // ... outros projetos
      ]
    }
  }
  ```

#### Obter Detalhes de um Projeto
- **Endpoint**: `GET /api/projects/[id]`
- **Descrição**: Retorna detalhes de um projeto específico
- **Parâmetros de URL**: 
  - `id`: ID do projeto
- **Parâmetros de Query**:
  - `includeTasks`: Inclui tarefas do projeto (opcional, default: `false`)
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "project": {
        "id": 1,
        "name": "Marketing",
        "color": "#ff5722",
        "is_favorite": true,
        "created_at": "2023-04-10T09:15:00Z",
        "tasks": [
          // Array de tarefas se includeTasks=true
        ]
      }
    }
  }
  ```

#### Criar Projeto
- **Endpoint**: `POST /api/projects`
- **Descrição**: Cria um novo projeto
- **Parâmetros de Requisição**:
  ```json
  {
    "name": "Novo Projeto",
    "color": "#4caf50",
    "is_favorite": false
  }
  ```
- **Resposta de Sucesso** (201 Created):
  ```json
  {
    "status": "success",
    "data": {
      "project": {
        "id": 5,
        "name": "Novo Projeto",
        "color": "#4caf50",
        "is_favorite": false,
        "created_at": "2023-05-20T17:00:00Z"
      }
    }
  }
  ```

#### Atualizar Projeto
- **Endpoint**: `PATCH /api/projects/[id]`
- **Descrição**: Atualiza um projeto existente
- **Parâmetros de URL**: 
  - `id`: ID do projeto
- **Parâmetros de Requisição** (todos opcionais):
  ```json
  {
    "name": "Nome Atualizado",
    "color": "#2196f3",
    "is_favorite": true
  }
  ```
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "project": {
        // Dados do projeto atualizado
      }
    }
  }
  ```

#### Excluir Projeto
- **Endpoint**: `DELETE /api/projects/[id]`
- **Descrição**: Remove um projeto e opcionalmente suas tarefas
- **Parâmetros de URL**: 
  - `id`: ID do projeto
- **Parâmetros de Query**:
  - `deleteTasks`: Se deve excluir as tarefas (opcional, default: `false`)
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "message": "Projeto excluído com sucesso"
    }
  }
  ```

### APIs de Etiquetas

#### Listar Etiquetas
- **Endpoint**: `GET /api/labels`
- **Descrição**: Retorna todas as etiquetas do usuário
- **Parâmetros de Query**:
  - `includeTaskCount`: Inclui contagem de tarefas (opcional, default: `false`)
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "labels": [
        {
          "id": 1,
          "name": "Importante",
          "color": "#e91e63",
          "created_at": "2023-04-15T10:20:00Z",
          "task_count": 8
        },
        // ... outras etiquetas
      ]
    }
  }
  ```

#### Obter Detalhes de uma Etiqueta
- **Endpoint**: `GET /api/labels/[id]`
- **Descrição**: Retorna detalhes de uma etiqueta específica
- **Parâmetros de URL**: 
  - `id`: ID da etiqueta
- **Parâmetros de Query**:
  - `includeTasks`: Inclui tarefas com esta etiqueta (opcional, default: `false`)
- **Resposta de Sucesso**: Similar à resposta de detalhes de projeto

#### Criar Etiqueta
- **Endpoint**: `POST /api/labels`
- **Descrição**: Cria uma nova etiqueta
- **Parâmetros de Requisição**:
  ```json
  {
    "name": "Nova Etiqueta",
    "color": "#9c27b0"
  }
  ```
- **Resposta de Sucesso** (201 Created):
  ```json
  {
    "status": "success",
    "data": {
      "label": {
        "id": 4,
        "name": "Nova Etiqueta",
        "color": "#9c27b0",
        "created_at": "2023-05-20T17:30:00Z"
      }
    }
  }
  ```

#### Atualizar Etiqueta
- **Endpoint**: `PATCH /api/labels/[id]`
- **Descrição**: Atualiza uma etiqueta existente
- **Parâmetros de URL**: 
  - `id`: ID da etiqueta
- **Parâmetros de Requisição** (todos opcionais):
  ```json
  {
    "name": "Nome Atualizado",
    "color": "#673ab7"
  }
  ```
- **Resposta de Sucesso** (200 OK): Similar à resposta de atualização de projeto

#### Excluir Etiqueta
- **Endpoint**: `DELETE /api/labels/[id]`
- **Descrição**: Remove uma etiqueta (não afeta as tarefas)
- **Parâmetros de URL**: 
  - `id`: ID da etiqueta
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "message": "Etiqueta excluída com sucesso"
    }
  }
  ```

### APIs de Configurações

#### Obter Configurações do Usuário
- **Endpoint**: `GET /api/settings`
- **Descrição**: Retorna as configurações do usuário atual
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "settings": {
        "language": "pt",
        "theme": "dark",
        "start_day_of_week": 1,
        "default_view": "today",
        "pomodoro_work_minutes": 25,
        "pomodoro_break_minutes": 5,
        "pomodoro_long_break_minutes": 15,
        "pomodoro_cycles": 4,
        "enable_sound": true,
        "notification_sound": "bell",
        "enable_desktop_notifications": true,
        "enable_task_notifications": true,
        "task_notification_days": 3
      }
    }
  }
  ```

#### Atualizar Configurações
- **Endpoint**: `PATCH /api/settings`
- **Descrição**: Atualiza as configurações do usuário
- **Parâmetros de Requisição** (todos opcionais):
  ```json
  {
    "language": "en",
    "theme": "light",
    "start_day_of_week": 0,
    "pomodoro_work_minutes": 30
    // ... outras configurações
  }
  ```
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "settings": {
        // Configurações atualizadas
      }
    }
  }
  ```

### APIs de Notificações

#### Obter Notificações de Tarefas
- **Endpoint**: `GET /api/notifications/tasks`
- **Descrição**: Retorna tarefas vencidas, de hoje e próximas para notificações
- **Parâmetros de Query**:
  - `ignoreRead`: Ignorar status de leitura (opcional, default: `false`)
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "enabled": true,
      "overdueCount": 2,
      "dueTodayCount": 3,
      "upcomingCount": 5,
      "totalCount": 10,
      "tasks": {
        "overdueTasks": [
          // Array de tarefas vencidas
        ],
        "dueTodayTasks": [
          // Array de tarefas para hoje
        ],
        "upcomingTasks": [
          // Array de tarefas próximas
        ]
      }
    }
  }
  ```

### APIs de Pesquisa

#### Pesquisar Tarefas
- **Endpoint**: `GET /api/search`
- **Descrição**: Pesquisa tarefas por texto
- **Parâmetros de Query**:
  - `q`: Texto de pesquisa (obrigatório)
  - `includeCompleted`: Inclui tarefas concluídas (opcional, default: `false`)
- **Resposta de Sucesso** (200 OK):
  ```json
  {
    "status": "success",
    "data": {
      "results": [
        // Array de tarefas correspondentes
      ],
      "count": 15
    }
  }
  ```

### Exemplo de Integração Completa

Para demonstrar a integração completa, veja um exemplo de fluxo para criação e atualização de tarefas:

#### Criação de Tarefa com Projeto e Etiquetas

```javascript
// 1. Buscar projetos disponíveis
const projectsResponse = await fetch('/api/projects');
const projects = await projectsResponse.json();

// 2. Buscar etiquetas disponíveis
const labelsResponse = await fetch('/api/labels');
const labels = await labelsResponse.json();

// 3. Criar nova tarefa
const createTaskResponse = await fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Implementar nova funcionalidade',
    description: 'Adicionar sistema de notificações',
    dueDate: '2023-06-01T12:00:00Z',
    priority: 2,
    projectId: projects.data.projects[0].id,
    labelIds: [labels.data.labels[0].id, labels.data.labels[2].id]
  }),
});

const newTask = await createTaskResponse.json();
const taskId = newTask.data.task.id;

// 4. Obter detalhes da tarefa criada
const taskDetailsResponse = await fetch(`/api/tasks/${taskId}`);
const taskDetails = await taskDetailsResponse.json();

// 5. Atualizar a tarefa (por exemplo, marcar como concluída)
const updateTaskResponse = await fetch(`/api/tasks/${taskId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    completed: true
  }),
});

const updatedTask = await updateTaskResponse.json();
```

### Considerações Técnicas e Boas Práticas

1. **Autenticação**: Todas as APIs (exceto registro e login) requerem autenticação.
2. **Rate Limiting**: As requisições são limitadas a 100 por minuto por usuário.
3. **Validação**: Todos os dados de entrada são validados antes do processamento.
4. **Tratamento de Datas**: 
   - Todas as datas são armazenadas e retornadas em formato ISO 8601 (UTC)
   - Datas de vencimento são normalizadas para 23:59:59 do dia especificado
5. **Formatos Suportados**:
   - Todas as APIs aceitam e retornam dados em formato JSON
   - POST/PATCH/PUT APIs requerem Content-Type: application/json

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
