"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type Language = "en" | "pt"

type Translations = {
  [key: string]: {
    [key in Language]: string
  }
}

// Traduções comuns usadas em todo o aplicativo
export const translations: Translations = {
  // Navegação
  today: {
    en: "Today",
    pt: "Hoje",
  },
  inbox: {
    en: "Inbox",
    pt: "Caixa de Entrada",
  },
  upcoming: {
    en: "Upcoming",
    pt: "Próximos",
  },
  completed: {
    en: "Completed",
    pt: "Concluídos",
  },
  projects: {
    en: "Projects",
    pt: "Projetos",
  },
  labels: {
    en: "Labels",
    pt: "Etiquetas",
  },
  storage: {
    en: "Storage & Backup",
    pt: "Armazenamento & Backup",
  },

  // Ações
  addTask: {
    en: "Add Task",
    pt: "Adicionar Tarefa",
  },
  addProject: {
    en: "Add Project",
    pt: "Adicionar Projeto",
  },
  addLabel: {
    en: "Add Label",
    pt: "Adicionar Etiqueta",
  },
  edit: {
    en: "Edit",
    pt: "Editar",
  },
  delete: {
    en: "Delete",
    pt: "Excluir",
  },
  save: {
    en: "Save",
    pt: "Salvar",
  },
  cancel: {
    en: "Cancel",
    pt: "Cancelar",
  },

  // Formulários
  title: {
    en: "Title",
    pt: "Título",
  },
  description: {
    en: "Description",
    pt: "Descrição",
  },
  dueDate: {
    en: "Due Date",
    pt: "Data de Vencimento",
  },
  priority: {
    en: "Priority",
    pt: "Prioridade",
  },
  project: {
    en: "Project",
    pt: "Projeto",
  },
  color: {
    en: "Color",
    pt: "Cor",
  },
  name: {
    en: "Name",
    pt: "Nome",
  },

  // Prioridades
  priority1: {
    en: "Priority 1",
    pt: "Prioridade 1",
  },
  priority2: {
    en: "Priority 2",
    pt: "Prioridade 2",
  },
  priority3: {
    en: "Priority 3",
    pt: "Prioridade 3",
  },
  priority4: {
    en: "Priority 4",
    pt: "Prioridade 4",
  },

  // Configurações
  settings: {
    en: "Settings",
    pt: "Configurações",
  },
  general: {
    en: "General",
    pt: "Geral",
  },
  theme: {
    en: "Theme",
    pt: "Tema",
  },
  language: {
    en: "Language",
    pt: "Idioma",
  },
  light: {
    en: "Light",
    pt: "Claro",
  },
  dark: {
    en: "Dark",
    pt: "Escuro",
  },
  system: {
    en: "System",
    pt: "Sistema",
  },
  english: {
    en: "English",
    pt: "Inglês",
  },
  portuguese: {
    en: "Portuguese",
    pt: "Português",
  },

  // Pomodoro
  pomodoroTimer: {
    en: "Pomodoro Timer",
    pt: "Temporizador Pomodoro",
  },
  work: {
    en: "Work",
    pt: "Trabalho",
  },
  shortBreak: {
    en: "Short Break",
    pt: "Pausa Curta",
  },
  longBreak: {
    en: "Long Break",
    pt: "Pausa Longa",
  },

  // Notificações
  notifications: {
    en: "Notifications",
    pt: "Notificações",
  },
  markAllAsRead: {
    en: "Mark all as read",
    pt: "Marcar todas como lidas",
  },
  noNotifications: {
    en: "No notifications",
    pt: "Sem notificações",
  },

  // Perfil
  profile: {
    en: "Profile",
    pt: "Perfil",
  },
  logout: {
    en: "Log out",
    pt: "Sair",
  },

  // Armazenamento
  exportData: {
    en: "Export Data",
    pt: "Exportar Dados",
  },
  importData: {
    en: "Import Data",
    pt: "Importar Dados",
  },

  // Calendário
  calendar: {
    en: "Calendar",
    pt: "Calendário",
  },

  // Mensagens
  taskCreated: {
    en: "Task created",
    pt: "Tarefa criada",
  },
  taskUpdated: {
    en: "Task updated",
    pt: "Tarefa atualizada",
  },
  taskDeleted: {
    en: "Task deleted",
    pt: "Tarefa excluída",
  },
  projectCreated: {
    en: "Project created",
    pt: "Projeto criado",
  },
  projectUpdated: {
    en: "Project updated",
    pt: "Projeto atualizado",
  },
  projectDeleted: {
    en: "Project deleted",
    pt: "Projeto excluído",
  },
  labelCreated: {
    en: "Label created",
    pt: "Etiqueta criada",
  },
  labelUpdated: {
    en: "Label updated",
    pt: "Etiqueta atualizada",
  },
  labelDeleted: {
    en: "Label deleted",
    pt: "Etiqueta excluída",
  },

  // Dias da semana
  sunday: {
    en: "Sunday",
    pt: "Domingo",
  },
  monday: {
    en: "Monday",
    pt: "Segunda",
  },
  tuesday: {
    en: "Tuesday",
    pt: "Terça",
  },
  wednesday: {
    en: "Wednesday",
    pt: "Quarta",
  },
  thursday: {
    en: "Thursday",
    pt: "Quinta",
  },
  friday: {
    en: "Friday",
    pt: "Sexta",
  },
  saturday: {
    en: "Saturday",
    pt: "Sábado",
  },

  // Meses
  january: {
    en: "January",
    pt: "Janeiro",
  },
  february: {
    en: "February",
    pt: "Fevereiro",
  },
  march: {
    en: "March",
    pt: "Março",
  },
  april: {
    en: "April",
    pt: "Abril",
  },
  may: {
    en: "May",
    pt: "Maio",
  },
  june: {
    en: "June",
    pt: "Junho",
  },
  july: {
    en: "July",
    pt: "Julho",
  },
  august: {
    en: "August",
    pt: "Agosto",
  },
  september: {
    en: "September",
    pt: "Setembro",
  },
  october: {
    en: "October",
    pt: "Outubro",
  },
  november: {
    en: "November",
    pt: "Novembro",
  },
  december: {
    en: "December",
    pt: "Dezembro",
  },

  // Outros
  search: {
    en: "Search",
    pt: "Pesquisar",
  },
  searchTasks: {
    en: "Search tasks...",
    pt: "Pesquisar tarefas...",
  },
  noProject: {
    en: "No Project",
    pt: "Sem Projeto",
  },
  selectProject: {
    en: "Select a project",
    pt: "Selecione um projeto",
  },
  selectLabel: {
    en: "Select a label",
    pt: "Selecione uma etiqueta",
  },
  pickDate: {
    en: "Pick a date",
    pt: "Escolha uma data",
  },
  today: {
    en: "Today",
    pt: "Hoje",
  },
  tomorrow: {
    en: "Tomorrow",
    pt: "Amanhã",
  },
  taskDetails: {
    en: "Task Details",
    pt: "Detalhes da Tarefa",
  },
  created: {
    en: "Created",
    pt: "Criado",
  },
  updated: {
    en: "Last updated",
    pt: "Última atualização",
  },
  allCaughtUp: {
    en: "All caught up!",
    pt: "Tudo em dia!",
  },
  noTasksMessage: {
    en: "You don't have any tasks for today. Add a new task to get started.",
    pt: "Você não tem tarefas para hoje. Adicione uma nova tarefa para começar.",
  },
  soundNotifications: {
    en: "Sound Notifications",
    pt: "Notificações Sonoras",
  },
  notificationSound: {
    en: "Notification Sound",
    pt: "Som de Notificação",
  },
  desktopNotifications: {
    en: "Desktop Notifications",
    pt: "Notificações de Desktop",
  },
  soundDescription: {
    en: "Play a sound when a Pomodoro timer completes.",
    pt: "Tocar um som quando um temporizador Pomodoro terminar.",
  },
  desktopNotificationsDescription: {
    en: "Show desktop notifications when a timer completes.",
    pt: "Mostrar notificações de desktop quando um temporizador terminar.",
  },
  chooseSound: {
    en: "Choose the sound to play when a timer completes.",
    pt: "Escolha o som a ser reproduzido quando um temporizador terminar.",
  },
  defaultSound: {
    en: "Default",
    pt: "Padrão",
  },
  bell: {
    en: "Bell",
    pt: "Sino",
  },
  chime: {
    en: "Chime",
    pt: "Carrilhão",
  },
  digital: {
    en: "Digital",
    pt: "Digital",
  },
  workSessionCompleted: {
    en: "Work session completed!",
    pt: "Sessão de trabalho concluída!",
  },
  breakTimeOver: {
    en: "Break time over!",
    pt: "Tempo de pausa acabou!",
  },
  timeForBreak: {
    en: "Time for a break!",
    pt: "Hora de uma pausa!",
  },
  backToWork: {
    en: "Back to work!",
    pt: "Voltar ao trabalho!",
  },
  cycle: {
    en: "Cycle",
    pt: "Ciclo",
  },
  labels: {
    en: "Labels",
    pt: "Etiquetas",
  },
  "Settings updated": {
    en: "Settings updated",
    pt: "Configurações atualizadas",
  },
  "Your settings have been updated successfully.": {
    en: "Your settings have been updated successfully.",
    pt: "Suas configurações foram atualizadas com sucesso.",
  },
  "Failed to update settings": {
    en: "Failed to update settings",
    pt: "Falha ao atualizar configurações",
  },
  "Please try again.": {
    en: "Please try again.",
    pt: "Por favor, tente novamente.",
  },
  "Manage your application preferences.": {
    en: "Manage your application preferences.",
    pt: "Gerencie suas preferências de aplicação.",
  },
  "Choose your preferred theme for the application.": {
    en: "Choose your preferred theme for the application.",
    pt: "Escolha seu tema preferido para a aplicação.",
  },
  "Choose your preferred language for the application.": {
    en: "Choose your preferred language for the application.",
    pt: "Escolha seu idioma preferido para a aplicação.",
  },
  "Select a theme": {
    en: "Select a theme",
    pt: "Selecione um tema",
  },
  "Select a language": {
    en: "Select a language",
    pt: "Selecione um idioma",
  },
  "Customize your Pomodoro timer preferences.": {
    en: "Customize your Pomodoro timer preferences.",
    pt: "Personalize suas preferências do temporizador Pomodoro.",
  },
  "Work Duration (minutes)": {
    en: "Work Duration (minutes)",
    pt: "Duração do Trabalho (minutos)",
  },
  "Short Break Duration (minutes)": {
    en: "Short Break Duration (minutes)",
    pt: "Duração da Pausa Curta (minutos)",
  },
  "Long Break Duration (minutes)": {
    en: "Long Break Duration (minutes)",
    pt: "Duração da Pausa Longa (minutos)",
  },
  "Long Break Interval (cycles)": {
    en: "Long Break Interval (cycles)",
    pt: "Intervalo de Pausa Longa (ciclos)",
  },
  "Manage how you receive notifications.": {
    en: "Manage how you receive notifications.",
    pt: "Gerencie como você recebe notificações.",
  },
  Login: {
    en: "Login",
    pt: "Entrar",
  },
  "Sign Up": {
    en: "Sign Up",
    pt: "Cadastrar",
  },
  "Organize your tasks with ease": {
    en: "Organize your tasks with ease",
    pt: "Organize suas tarefas com facilidade",
  },
  "Stay organized and productive with our Todoist-inspired task manager. Includes Pomodoro timer, dark mode, and more.":
    {
      en: "Stay organized and productive with our Todoist-inspired task manager. Includes Pomodoro timer, dark mode, and more.",
      pt: "Mantenha-se organizado e produtivo com nosso gerenciador de tarefas inspirado no Todoist. Inclui temporizador Pomodoro, modo escuro e muito mais.",
    },
  "Get Started": {
    en: "Get Started",
    pt: "Começar",
  },
  Features: {
    en: "Features",
    pt: "Recursos",
  },
  "Everything you need to stay organized and productive": {
    en: "Everything you need to stay organized and productive",
    pt: "Tudo o que você precisa para se manter organizado e produtivo",
  },
  "Task Management": {
    en: "Task Management",
    pt: "Gerenciamento de Tarefas",
  },
  "Organize tasks with projects, priorities, and due dates": {
    en: "Organize tasks with projects, priorities, and due dates",
    pt: "Organize tarefas com projetos, prioridades e datas de vencimento",
  },
  "Calendar View": {
    en: "Calendar View",
    pt: "Visualização de Calendário",
  },
  "See your tasks in a calendar view to plan your week effectively": {
    en: "See your tasks in a calendar view to plan your week effectively",
    pt: "Veja suas tarefas em uma visualização de calendário para planejar sua semana com eficácia",
  },
  "Stay focused with built-in Pomodoro timer to boost your productivity": {
    en: "Stay focused with built-in Pomodoro timer to boost your productivity",
    pt: "Mantenha o foco com o temporizador Pomodoro integrado para aumentar sua produtividade",
  },
  "All rights reserved.": {
    en: "All rights reserved.",
    pt: "Todos os direitos reservados.",
  },
  Terms: {
    en: "Terms",
    pt: "Termos",
  },
  Privacy: {
    en: "Privacy",
    pt: "Privacidade",
  },
  "Create Task": {
    en: "Create Task",
    pt: "Criar Tarefa",
  },
  "Create a new task to keep track of your work.": {
    en: "Create a new task to keep track of your work.",
    pt: "Crie uma nova tarefa para acompanhar seu trabalho.",
  },
  "Task title": {
    en: "Task title",
    pt: "Título da tarefa",
  },
  "Add details about your task": {
    en: "Add details about your task",
    pt: "Adicione detalhes sobre sua tarefa",
  },
  "Select priority": {
    en: "Select priority",
    pt: "Selecione a prioridade",
  },
  "Add labels": {
    en: "Add labels",
    pt: "Adicionar etiquetas",
  },
  "No labels found": {
    en: "No labels found",
    pt: "Nenhuma etiqueta encontrada",
  },
  "View and edit task details.": {
    en: "View and edit task details.",
    pt: "Visualize e edite detalhes da tarefa.",
  },
  "Task description": {
    en: "Task description",
    pt: "Descrição da tarefa",
  },
  "Saving...": {
    en: "Saving...",
    pt: "Salvando...",
  },
  "Label added": {
    en: "Label added",
    pt: "Etiqueta adicionada",
  },
  "Label has been added to the task successfully.": {
    en: "Label has been added to the task successfully.",
    pt: "A etiqueta foi adicionada à tarefa com sucesso.",
  },
  "Failed to add label": {
    en: "Failed to add label",
    pt: "Falha ao adicionar etiqueta",
  },
  "Label removed": {
    en: "Label removed",
    pt: "Etiqueta removida",
  },
  "Label has been removed from the task successfully.": {
    en: "Label has been removed from the task successfully.",
    pt: "A etiqueta foi removida da tarefa com sucesso.",
  },
  "Failed to remove label": {
    en: "Failed to remove label",
    pt: "Falha ao remover etiqueta",
  },
  "Failed to refresh labels": {
    en: "Failed to refresh labels",
    pt: "Falha ao atualizar etiquetas",
  },
  "Loading labels...": {
    en: "Loading labels...",
    pt: "Carregando etiquetas...",
  },
  "No labels assigned to this task.": {
    en: "No labels assigned to this task.",
    pt: "Nenhuma etiqueta atribuída a esta tarefa.",
  },
  "Create Label": {
    en: "Create Label",
    pt: "Criar Etiqueta",
  },
  "Create a new label to organize your tasks.": {
    en: "Create a new label to organize your tasks.",
    pt: "Crie uma nova etiqueta para organizar suas tarefas.",
  },
  "Add Label": {
    en: "Add Label",
    pt: "Adicionar Etiqueta",
  },
  "Select a label to add to this task.": {
    en: "Select a label to add to this task.",
    pt: "Selecione uma etiqueta para adicionar a esta tarefa.",
  },
  "No labels found.": {
    en: "No labels found.",
    pt: "Nenhuma etiqueta encontrada.",
  },
  "Create New Label": {
    en: "Create New Label",
    pt: "Criar Nova Etiqueta",
  },
  "Remove label": {
    en: "Remove label",
    pt: "Remover etiqueta",
  },
  "Play sound": {
    en: "Play sound",
    pt: "Tocar som",
  },
  "Select a sound": {
    en: "Select a sound",
    pt: "Selecione um som",
  },
  "Notification permission denied": {
    en: "Notification permission denied",
    pt: "Permissão de notificação negada",
  },
  "Desktop notifications will not be shown.": {
    en: "Desktop notifications will not be shown.",
    pt: "Notificações de desktop não serão exibidas.",
  },
  "Failed to play sound": {
    en: "Failed to play sound",
    pt: "Falha ao reproduzir som",
  },
  "Please check your browser settings.": {
    en: "Please check your browser settings.",
    pt: "Verifique as configurações do seu navegador.",
  },
  "Welcome back": {
    en: "Welcome back",
    pt: "Bem-vindo de volta",
  },
  "Sign in to your account to continue": {
    en: "Sign in to your account to continue",
    pt: "Entre na sua conta para continuar",
  },
  "Don't have an account?": {
    en: "Don't have an account?",
    pt: "Não tem uma conta?",
  },
  "Create an account": {
    en: "Create an account",
    pt: "Criar uma conta",
  },
  "Sign up to get started with Todoist Clone": {
    en: "Sign up to get started with Todoist Clone",
    pt: "Cadastre-se para começar a usar o Todoist Clone",
  },
  "Already have an account?": {
    en: "Already have an account?",
    pt: "Já tem uma conta?",
  },
  "Sign in": {
    en: "Sign in",
    pt: "Entrar",
  },
  Email: {
    en: "Email",
    pt: "Email",
  },
  Password: {
    en: "Password",
    pt: "Senha",
  },
  "Remember me": {
    en: "Remember me",
    pt: "Lembrar de mim",
  },
  "Forgot password?": {
    en: "Forgot password?",
    pt: "Esqueceu a senha?",
  },
  "Please wait": {
    en: "Please wait",
    pt: "Aguarde",
  },
  Name: {
    en: "Name",
    pt: "Nome",
  },
  "Confirm Password": {
    en: "Confirm Password",
    pt: "Confirmar Senha",
  },
  "Hide password": {
    en: "Hide password",
    pt: "Ocultar senha",
  },
  "Show password": {
    en: "Show password",
    pt: "Mostrar senha",
  },
  "Login successful": {
    en: "Login successful",
    pt: "Login bem-sucedido",
  },
  "Redirecting to your dashboard...": {
    en: "Redirecting to your dashboard...",
    pt: "Redirecionando para seu painel...",
  },
  "Login failed": {
    en: "Login failed",
    pt: "Falha no login",
  },
  "Something went wrong. Please try again.": {
    en: "Something went wrong. Please try again.",
    pt: "Algo deu errado. Por favor, tente novamente.",
  },
  "Registration successful": {
    en: "Registration successful",
    pt: "Registro bem-sucedido",
  },
  "Your account has been created. Redirecting to login...": {
    en: "Your account has been created. Redirecting to login...",
    pt: "Sua conta foi criada. Redirecionando para o login...",
  },
  "Registration failed": {
    en: "Registration failed",
    pt: "Falha no registro",
  },
  "Toggle theme": {
    en: "Toggle theme",
    pt: "Alternar tema",
  },
}

// Store para gerenciar o idioma
type LanguageStore = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: "en",
      setLanguage: (language) => set({ language }),
      t: (key) => {
        const lang = get().language
        return translations[key]?.[lang] || key
      },
    }),
    {
      name: "language-storage",
    },
  ),
)

// Hook para usar traduções em componentes
export function useTranslation() {
  const { language, setLanguage, t } = useLanguage()
  return { language, setLanguage, t }
}

