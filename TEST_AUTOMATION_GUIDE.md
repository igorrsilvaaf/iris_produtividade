# Guia de Padrões para Data-TestID - Automação de Testes

## Visão Geral

Este guia define os padrões e convenções para implementação de `data-testid` no projeto Íris Produtividade, seguindo as melhores práticas para automação de testes com Cypress e Playwright.

## Padrões de Nomenclatura

### Convenção Base
- **Formato**: `component-element` ou `component-action`
- **Estilo**: `kebab-case` (minúsculas com hífens)
- **Idioma**: Inglês
- **Estrutura**: `{componente}-{elemento/ação}`

### Exemplos de Padrões

#### 1. Formulários
```typescript
// Estrutura geral do formulário
data-testid="login-form"
data-testid="register-form"
data-testid="project-form"

// Campos de entrada
data-testid="login-email-input"
data-testid="login-password-input"
data-testid="register-name-input"

// Botões de ação
data-testid="login-submit-button"
data-testid="register-submit-button"
data-testid="project-submit-button"

// Controles especiais
data-testid="login-password-toggle"
data-testid="register-password-toggle"
```

#### 2. Dialogs e Modais
```typescript
// Estrutura do dialog
data-testid="add-task-dialog-trigger"
data-testid="add-task-dialog-content"
data-testid="add-task-dialog-title"
data-testid="add-task-dialog-description"

// Elementos internos
data-testid="add-task-form"
data-testid="add-task-title-input"
data-testid="add-task-description-input"

// Botões de ação
data-testid="add-task-submit-button"
data-testid="add-task-cancel-button"
```

#### 3. Navegação
```typescript
// Sidebar
data-testid="app-sidebar"
data-testid="sidebar-logo"
data-testid="sidebar-navigation"
data-testid="sidebar-nav-inbox"
data-testid="sidebar-nav-today"

// Header
data-testid="app-header"
data-testid="header-search-area"
data-testid="header-user-menu-trigger"
data-testid="header-menu-profile"
```

#### 4. Listas e Itens Dinâmicos
```typescript
// Para itens com IDs únicos
data-testid="todo-item-${todoData.id}"
data-testid="kanban-card-${card.id}"
data-testid="sidebar-project-${project.id}"

// Para elementos de lista
data-testid="todo-list"
data-testid="todo-list-items"
data-testid="kanban-column-backlog"
data-testid="kanban-column-inProgress"
```

#### 5. Componentes Específicos
```typescript
// Pomodoro Timer
data-testid="pomodoro-timer"
data-testid="pomodoro-play-pause-button"
data-testid="pomodoro-reset-button"
data-testid="pomodoro-timer-display"

// Seletores e Controles
data-testid="todo-list-sort-trigger"
data-testid="todo-list-sort-content"
data-testid="project-color-picker"
```

## Estrutura por Tipo de Componente

### Formulários
| Elemento | Padrão | Exemplo |
|----------|---------|---------|
| Container | `{form}-form` | `login-form` |
| Input | `{form}-{field}-input` | `login-email-input` |
| Button | `{form}-{action}-button` | `login-submit-button` |
| Toggle | `{form}-{field}-toggle` | `login-password-toggle` |
| Checkbox | `{form}-{field}-checkbox` | `project-favorite-checkbox` |

### Dialogs
| Elemento | Padrão | Exemplo |
|----------|---------|---------|
| Trigger | `{dialog}-dialog-trigger` | `add-task-dialog-trigger` |
| Content | `{dialog}-dialog-content` | `add-task-dialog-content` |
| Title | `{dialog}-dialog-title` | `add-task-dialog-title` |
| Description | `{dialog}-dialog-description` | `add-task-dialog-description` |
| Form | `{dialog}-form` | `add-task-form` |

### Navegação
| Elemento | Padrão | Exemplo |
|----------|---------|---------|
| Container | `{component}-{area}` | `app-sidebar`, `app-header` |
| Navigation | `{component}-navigation` | `sidebar-navigation` |
| Menu Item | `{component}-nav-{item}` | `sidebar-nav-inbox` |
| Menu | `{component}-menu-{action}` | `header-menu-profile` |

### Listas e Cards
| Elemento | Padrão | Exemplo |
|----------|---------|---------|
| Lista | `{component}-list` | `todo-list` |
| Item | `{component}-item-${id}` | `todo-item-${id}` |
| Card | `{component}-card-${id}` | `kanban-card-${id}` |
| Ações | `{component}-actions` | `todo-actions` |

## Diretrizes de Implementação

### 1. Hierarquia de Elementos
```typescript
// Exemplo de hierarquia correta
<Dialog data-testid="add-task-dialog">
  <DialogTrigger data-testid="add-task-dialog-trigger">
  <DialogContent data-testid="add-task-dialog-content">
    <DialogTitle data-testid="add-task-dialog-title">
    <form data-testid="add-task-form">
      <input data-testid="add-task-title-input">
      <Button data-testid="add-task-submit-button">
```

### 2. Elementos Dinâmicos
```typescript
// Para itens com IDs únicos
data-testid={`todo-item-${todoData.id}`}
data-testid={`kanban-card-${card.id}`}
data-testid={`sidebar-project-${project.id}`}

// Para coleções
data-testid="todo-list-items"
data-testid="kanban-column-backlog"
```

### 3. Estados e Variações
```typescript
// Estados específicos
data-testid="reset-password-loading"
data-testid="reset-password-success"
data-testid="reset-password-invalid-token"

// Variações por prioridade
data-testid="quick-add-todo-priority-1"
data-testid="quick-add-todo-priority-2"
data-testid="edit-task-priority-high"
```

## Componentes Implementados

### ✅ Formulários de Autenticação
- `login-form.tsx` - Completo
- `register-form.tsx` - Completo
- `forgot-password-form.tsx` - Completo
- `reset-password-form.tsx` - Completo

### ✅ Formulários de Projeto/Label
- `project-form.tsx` - Completo
- `label-form.tsx` - Completo
- `add-project-dialog.tsx` - Completo
- `add-label-dialog.tsx` - Completo

### ✅ Dialogs de CRUD
- `add-task-dialog.tsx` - Completo
- `edit-task-dialog.tsx` - Completo
- `delete-project-dialog.tsx` - Completo
- `delete-label-dialog.tsx` - Completo

### ✅ Componentes de Navegação
- `app-sidebar.tsx` - Completo
- `app-header.tsx` - Completo

### ✅ Componentes de Tarefas
- `todo.tsx` - Completo
- `todo-list.tsx` - Completo
- `quick-add-todo.tsx` - Completo
- `kanban-board.tsx` - Completo

### ✅ Componentes de UI
- `pomodoro-timer.tsx` - Completo
- `task-detail.tsx` - Completo

## Exemplos de Uso em Testes

### Cypress
```typescript
// Seletores básicos
cy.get('[data-testid="login-form"]')
cy.get('[data-testid="login-email-input"]')
cy.get('[data-testid="login-submit-button"]')

// Seletores dinâmicos
cy.get(`[data-testid="todo-item-${todoId}"]`)
cy.get('[data-testid^="kanban-card-"]') // Todos os cards do kanban

// Interações
cy.get('[data-testid="login-email-input"]').type('user@example.com')
cy.get('[data-testid="login-password-input"]').type('password123')
cy.get('[data-testid="login-submit-button"]').click()
```

### Playwright
```typescript
// Seletores básicos
await page.locator('[data-testid="login-form"]')
await page.locator('[data-testid="login-email-input"]')
await page.locator('[data-testid="login-submit-button"]')

// Seletores dinâmicos
await page.locator(`[data-testid="todo-item-${todoId}"]`)
await page.locator('[data-testid^="kanban-card-"]')

// Interações
await page.fill('[data-testid="login-email-input"]', 'user@example.com')
await page.fill('[data-testid="login-password-input"]', 'password123')
await page.click('[data-testid="login-submit-button"]')
```

## Melhores Práticas

### ✅ Fazer
- Usar `kebab-case` para nomes
- Manter consistência entre componentes similares
- Usar IDs únicos para elementos dinâmicos
- Seguir a hierarquia de elementos
- Usar nomes descritivos e específicos

### ❌ Evitar
- Usar `camelCase` ou `PascalCase`
- Criar nomes genéricos como `button` ou `input`
- Reutilizar o mesmo `data-testid` em múltiplos elementos
- Usar caracteres especiais ou espaços
- Criar IDs muito longos ou complexos

## Manutenção e Evolução

### Adicionando Novos Componentes
1. Seguir os padrões estabelecidos
2. Usar a convenção `{componente}-{elemento}`
3. Adicionar exemplos neste guia
4. Documentar casos especiais

### Refatoração
- Manter compatibilidade com testes existentes
- Atualizar documentação quando necessário
- Comunicar mudanças à equipe de QA

## Configuração de Testes

### Playwright (Atual)
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './__tests__/e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

### Cypress (Para configuração futura)
```typescript
// cypress.config.ts
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
  },
});
```

## Recursos Adicionais

- [Playwright Testing Guide](https://playwright.dev/docs/writing-tests)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Library Guidelines](https://testing-library.com/docs/queries/about)

---

**Última atualização**: ${new Date().toISOString().split('T')[0]}
**Versão**: 1.0.0
**Responsável**: Equipe de Desenvolvimento 