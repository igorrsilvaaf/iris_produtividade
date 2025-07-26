# Data Test IDs para Automação Cypress

Este documento lista todos os `data-testid` adicionados aos componentes para facilitar a automação com Cypress.

## 🔐 Autenticação

### Login Form (`components/login-form.tsx`)
- `login-form` - Formulário de login
- `login-email-input` - Campo de email
- `login-password-input` - Campo de senha
- `login-password-toggle` - Botão para mostrar/ocultar senha
- `login-remember-checkbox` - Checkbox "Lembrar de mim"
- `login-forgot-password-link` - Link "Esqueceu a senha?"
- `login-submit-button` - Botão de envio

### Register Form (`components/register-form.tsx`)
- `register-form` - Formulário de registro
- `register-name-input` - Campo de nome
- `register-email-input` - Campo de email
- `register-password-input` - Campo de senha
- `register-password-toggle` - Botão para mostrar/ocultar senha
- `register-confirm-password-input` - Campo de confirmação de senha
- `register-confirm-password-toggle` - Botão para mostrar/ocultar confirmação
- `register-submit-button` - Botão de envio

### Forgot Password Form (`components/forgot-password-form.tsx`)
- `forgot-password-form` - Formulário de recuperação de senha
- `forgot-password-email-input` - Campo de email
- `forgot-password-submit-button` - Botão de envio
- `forgot-password-back-link` - Link para voltar ao login
- `forgot-password-success` - Container de sucesso
- `forgot-password-success-alert` - Alerta de sucesso
- `forgot-password-warning-alert` - Alerta de aviso
- `forgot-password-back-to-login` - Botão para voltar ao login
- `forgot-password-try-another-email` - Botão para tentar outro email

## 🎯 Header e Navegação

### App Header (`components/app-header.tsx`)
- `app-header` - Header principal
- `header-mobile-menu-button` - Botão do menu mobile
- `header-search-area` - Área de busca
- `header-navigation` - Navegação principal
- `header-calendar-button` - Botão do calendário (desktop)
- `header-calendar-mobile-button` - Botão do calendário (mobile)
- `header-settings-button` - Botão de configurações
- `header-user-menu-trigger` - Botão do menu do usuário
- `header-user-avatar` - Avatar do usuário
- `header-user-avatar-image` - Imagem do avatar
- `header-user-avatar-fallback` - Fallback do avatar
- `header-user-menu` - Menu dropdown do usuário
- `header-user-info` - Informações do usuário
- `header-dropdown-avatar` - Avatar no dropdown
- `header-dropdown-avatar-image` - Imagem do avatar no dropdown
- `header-dropdown-avatar-fallback` - Fallback do avatar no dropdown
- `header-user-details` - Detalhes do usuário
- `header-user-name` - Nome do usuário
- `header-user-email` - Email do usuário
- `header-menu-profile` - Item do menu "Perfil"
- `header-menu-settings` - Item do menu "Configurações"
- `header-menu-storage` - Item do menu "Armazenamento"
- `header-menu-changelog` - Item do menu "Changelog"
- `header-menu-reports` - Item do menu "Relatórios"
- `header-menu-theme` - Item do menu "Tema"
- `header-menu-logout` - Item do menu "Logout"

### Mode Toggle (`components/mode-toggle.tsx`)
- `mode-toggle-button` - Botão de alternância de tema
- `mode-toggle-sun-icon` - Ícone do sol
- `mode-toggle-moon-icon` - Ícone da lua
- `mode-toggle-dropdown-trigger` - Trigger do dropdown de tema
- `mode-toggle-dropdown-content` - Conteúdo do dropdown
- `mode-toggle-light-option` - Opção "Claro"
- `mode-toggle-dark-option` - Opção "Escuro"
- `mode-toggle-system-option` - Opção "Sistema"

## 📋 Sidebar (`components/app-sidebar.tsx`)
- `app-sidebar` - Sidebar principal
- `sidebar-logo` - Logo da sidebar
- `sidebar-navigation` - Navegação da sidebar
- `sidebar-nav-today` - Link "Hoje"
- `sidebar-nav-inbox` - Link "Caixa de entrada"
- `sidebar-nav-upcoming` - Link "Próximas"
- `sidebar-nav-completed` - Link "Concluídas"
- `sidebar-nav-pomodoro` - Link "Pomodoro"
- `sidebar-nav-kanban` - Link "Kanban"
- `sidebar-nav-storage` - Link "Armazenamento"
- `sidebar-projects-section` - Seção de projetos
- `sidebar-projects-toggle` - Toggle da seção de projetos
- `sidebar-projects-list` - Lista de projetos
- `sidebar-project-{id}` - Projeto específico (ex: `sidebar-project-1`)
- `sidebar-add-project-button` - Botão para adicionar projeto
- `sidebar-labels-section` - Seção de labels
- `sidebar-labels-toggle` - Toggle da seção de labels
- `sidebar-labels-list` - Lista de labels
- `sidebar-label-{id}` - Label específico (ex: `sidebar-label-1`)
- `sidebar-add-label-button` - Botão para adicionar label

## ✅ Tarefas

### Todo Component (`components/Todo.tsx`)
- `todo-item-{id}` - Item de tarefa específico (ex: `todo-item-1`)
- `todo-title` - Título da tarefa
- `todo-description` - Descrição da tarefa
- `todo-metadata` - Metadados da tarefa
- `todo-due-date` - Data de vencimento
- `todo-priority` - Prioridade
- `todo-points` - Pontos
- `todo-project` - Projeto
- `todo-actions` - Ações da tarefa
- `todo-complete-button` - Botão de completar
- `todo-delete-button` - Botão de excluir
- `check-icon` - Ícone de verificação

### Quick Add Todo (`components/quick-add-todo.tsx`)
- `quick-add-todo-form` - Formulário de adição rápida
- `quick-add-todo-input` - Campo de entrada
- `quick-add-todo-priority-trigger` - Trigger do select de prioridade
- `quick-add-todo-priority-content` - Conteúdo do select de prioridade
- `quick-add-todo-priority-1` - Prioridade "Grave"
- `quick-add-todo-priority-2` - Prioridade "Alta"
- `quick-add-todo-priority-3` - Prioridade "Média"
- `quick-add-todo-priority-4` - Prioridade "Baixa"
- `quick-add-todo-submit` - Botão de envio

## 🎨 Componentes UI

### Button (`components/ui/button.tsx`)
- `button` - Botão padrão (fallback)

### Input (`components/ui/input.tsx`)
- `input` - Input padrão (fallback)

### Checkbox (`components/ui/checkbox.tsx`)
- `checkbox` - Checkbox padrão (fallback)
- `checkbox-indicator` - Indicador do checkbox
- `checkbox-check` - Ícone de verificação

### Select (`components/ui/select.tsx`)
- `select-trigger` - Trigger do select
- `select-chevron` - Ícone de seta
- `select-content` - Conteúdo do select
- `select-scroll-up` - Botão de scroll para cima
- `select-scroll-down` - Botão de scroll para baixo
- `select-viewport` - Viewport do select

### Dropdown Menu (`components/ui/dropdown-menu.tsx`)
- `dropdown-trigger` - Trigger do dropdown
- `dropdown-content` - Conteúdo do dropdown
- `dropdown-menu-item` - Item do menu

### Avatar (`components/ui/avatar.tsx`)
- `avatar` - Avatar padrão (fallback)
- `avatar-image` - Imagem do avatar
- `avatar-fallback` - Fallback do avatar

### Card (`components/ui/card.tsx`)
- `card` - Card padrão
- `card-header` - Header do card
- `card-title` - Título do card
- `card-description` - Descrição do card
- `card-content` - Conteúdo do card
- `card-footer` - Footer do card

### Label (`components/ui/label.tsx`)
- `label` - Label padrão (fallback)

### Textarea (`components/ui/textarea.tsx`)
- `textarea` - Textarea padrão (fallback)

### Dialog (`components/ui/dialog.tsx`)
- `dialog-overlay` - Overlay do dialog
- `dialog-content` - Conteúdo do dialog
- `dialog-close-button` - Botão de fechar
- `dialog-header` - Header do dialog
- `dialog-footer` - Footer do dialog
- `dialog-title` - Título do dialog
- `dialog-description` - Descrição do dialog

### Tooltip (`components/ui/tooltip.tsx`)
- `tooltip-trigger` - Trigger do tooltip
- `tooltip-content` - Conteúdo do tooltip

### Form (`components/ui/form.tsx`)
- `form-field` - Campo do formulário (fallback)
- `form-field-controller` - Controller do campo
- `form-field-container` - Container do campo

## 🎯 Exemplos de Uso no Cypress

```javascript
// Login
cy.get('[data-testid="login-email-input"]').type('user@example.com')
cy.get('[data-testid="login-password-input"]').type('password123')
cy.get('[data-testid="login-submit-button"]').click()

// Acessar menu do usuário e fazer logout
cy.get('[data-testid="header-user-menu-trigger"]').click()
cy.get('[data-testid="header-menu-logout"]').click()

// Adicionar tarefa rápida
cy.get('[data-testid="quick-add-todo-input"]').type('Nova tarefa')
cy.get('[data-testid="quick-add-todo-priority-trigger"]').click()
cy.get('[data-testid="quick-add-todo-priority-2"]').click()
cy.get('[data-testid="quick-add-todo-submit"]').click()

// Navegar para projetos
cy.get('[data-testid="sidebar-projects-toggle"]').click()
cy.get('[data-testid="sidebar-project-1"]').click()

// Completar tarefa
cy.get('[data-testid="todo-item-1"]').within(() => {
  cy.get('[data-testid="todo-complete-button"]').click()
})
```

## 📝 Notas Importantes

1. **IDs Dinâmicos**: Alguns elementos têm IDs dinâmicos baseados no ID do item (ex: `todo-item-{id}`)
2. **Fallbacks**: Componentes UI têm fallbacks padrão quando não especificado um `data-testid`
3. **Hierarquia**: Use `within()` para interagir com elementos dentro de containers específicos
4. **Acessibilidade**: Todos os elementos importantes têm `data-testid` para facilitar a automação

## 🔄 Atualizações

Este documento deve ser atualizado sempre que novos `data-testid` forem adicionados ao projeto. 