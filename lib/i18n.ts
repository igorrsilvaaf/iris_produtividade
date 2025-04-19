"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useEffect, useCallback } from 'react';

type Language = "en" | "pt"

type Translations = {
  [key: string]: {
    [key in Language]: string
  }
}

function setCookie(name: string, value: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Strict`;
    console.log(`[i18n] Cookie '${name}' definido para: '${value}'`);
  }
}

export const translations: Translations = {
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
  "Navigation Menu": {
    en: "Navigation Menu",
    pt: "Menu de Navegação",
  },
  storage: {
    en: "Storage & Backup",
    pt: "Armazenamento & Backup",
  },
  pomodoro: {
    en: "Pomodoro",
    pt: "Pomodoro",
  },
  kanban: {
    en: "Kanban",
    pt: "Kanban",
  },
  backlog: {
    en: "Backlog",
    pt: "Backlog",
  },
  planning: {
    en: "Planning",
    pt: "Planejamento",
  },
  inProgress: {
    en: "In Progress",
    pt: "Em Andamento",
  },
  validation: {
    en: "Validation",
    pt: "Validação",
  },
  startPomodoro: {
    en: "Start Pomodoro",
    pt: "Iniciar Pomodoro",
  },
  selectTask: {
    en: "Select Task",
    pt: "Selecionar Tarefa",
  },
  noTask: {
    en: "No Task",
    pt: "Sem Tarefa",
  },
  selectTaskForPomodoro: {
    en: "Select a task for your Pomodoro session (showing all incomplete tasks)",
    pt: "Selecione uma tarefa para sua sessão Pomodoro (mostrando todas as tarefas incompletas)",
  },
  noDescription: {
    en: "No description",
    pt: "Sem descrição",
  },
  focusOnYourTasks: {
    en: "Focus on your tasks with timed work sessions",
    pt: "Concentre-se em suas tarefas com sessões de trabalho cronometradas",
  },
  back: {
    en: "Back",
    pt: "Voltar",
  },
  "Nenhuma tarefa disponível para seleção": {
    en: "No tasks available for selection",
    pt: "Nenhuma tarefa disponível para seleção",
  },

  // Sons e Notificações
  noSound: {
    en: "No sound",
    pt: "Nenhum som",
  },
  soundNotifications: {
    en: "Sound Notifications",
    pt: "Notificações Sonoras",
  },
  soundDescription: {
    en: "Play a sound when a timer ends",
    pt: "Tocar um som quando um temporizador terminar",
  },
  notificationSound: {
    en: "Notification Sound",
    pt: "Som de Notificação",
  },
  pomodoroSound: {
    en: "Pomodoro Sound",
    pt: "Som do Pomodoro",
  },
  chooseSound: {
    en: "Choose the sound to play when a timer completes.",
    pt: "Escolha o som a ser reproduzido quando um temporizador terminar.",
  },
  forGeneralNotifications: {
    en: "for general notifications",
    pt: "para notificações gerais",
  },
  forPomodoroTimer: {
    en: "for Pomodoro timer",
    pt: "para o temporizador Pomodoro",
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
  ding: {
    en: "Ding",
    pt: "Campainha",
  },
  notification: {
    en: "Notification",
    pt: "Notificação",
  },

  // Ações
  addTask: {
    en: "Add Task",
    pt: "Adicionar Tarefa",
  },
  createTask: {
    en: "Create Task",
    pt: "Criar Tarefa",
  },
  createProject: {
    en: "Create Project",
    pt: "Criar Projeto",
  },
  creating: {
    en: "Creating...",
    pt: "Criando...",
  },
  taskCreated: {
    en: "Task Created",
    pt: "Tarefa Criada",
  },
  addProject: {
    en: "Add Project",
    pt: "Adicionar Projeto",
  },
  createNewProject: {
    en: "Create a new project to organize your tasks.",
    pt: "Crie um novo projeto para organizar suas tarefas.",
  },
  projectName: {
    en: "Project name",
    pt: "Nome do projeto",
  },
  addLabel: {
    en: "Add Label",
    pt: "Adicionar Etiqueta",
  },
  createNewLabel: {
    en: "Create a new label to organize your tasks.",
    pt: "Crie uma nova etiqueta para organizar suas tarefas.",
  },
  addLabels: {
    en: "Add labels",
    pt: "Adicionar etiquetas",
  },
  removeLabel: {
    en: "Remove label",
    pt: "Remover etiqueta",
  },
  noLabelsFound: {
    en: "No labels found",
    pt: "Nenhuma etiqueta encontrada",
  },
  loadingProjects: {
    en: "Loading projects...",
    pt: "Carregando projetos...",
  },
  loadingProject: {
    en: "Loading project...",
    pt: "Carregando projeto...",
  },
  edit: {
    en: "Edit",
    pt: "Editar",
  },
  editTask: {
    en: "Edit Task",
    pt: "Editar Tarefa",
  },
  update: {
    en: "Update Task",
    pt: "Atualizar Tarefa",
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
  close: {
    en: "Close",
    pt: "Fechar",
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
    en: "Critical",
    pt: "Grave",
  },
  priority2: {
    en: "High",
    pt: "Alta",
  },
  priority3: {
    en: "Medium",
    pt: "Média",
  },
  priority4: {
    en: "Low",
    pt: "Baixa",
  },
  Grave: {
    en: "Critical",
    pt: "Grave",
  },
  Alta: {
    en: "High",
    pt: "Alta",
  },
  Média: {
    en: "Medium",
    pt: "Média",
  },
  Baixa: {
    en: "Low", 
    pt: "Baixa",
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

  // Novas strings para data/hora
  allDay: {
    en: "All day",
    pt: "Dia todo",
  },
  confirm: {
    en: "Confirm",
    pt: "Confirmar",
  },
  pickDate: {
    en: "Pick a date",
    pt: "Escolha uma data",
  },
  time: {
    en: "Time",
    pt: "Hora",
  },

  // Mensagens
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
  projectCreateSuccess: {
    en: "Your project has been created successfully.",
    pt: "Seu projeto foi criado com sucesso.",
  },
  failedCreateProject: {
    en: "Failed to create project",
    pt: "Falha ao criar projeto",
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

  // Busca
  search: {
    en: "Search",
    pt: "Buscar",
  },
  searchTasks: {
    en: "Search tasks",
    pt: "Buscar tarefas",
  },
  searching: {
    en: "Searching...",
    pt: "Buscando...",
  },
  noResultsFound: {
    en: "No results found.",
    pt: "Nenhum resultado encontrado.",
  },
  searchFailed: {
    en: "Search failed",
    pt: "Falha na busca",
  },
  failedToSearchTasks: {
    en: "Failed to search tasks. Please try again.",
    pt: "Falha ao buscar tarefas. Por favor, tente novamente.",
  },

  // Outros
  "Unknown project": {
    en: "Unknown project",
    pt: "Carregando Projetos",
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
  "Organize your tasks with ease": {
    en: "Organize your tasks with ease",
    pt: "Organize suas tarefas com facilidade",
  },
  "Stay organized and productive with our Íris task manager. Includes Pomodoro timer, dark mode, and more.": {
    en: "Stay organized and productive with our Íris task manager. Includes Pomodoro timer, dark mode, and more.",
    pt: "Mantenha-se organizado e produtivo com nosso gerenciador de tarefas Íris. Inclui temporizador Pomodoro, modo escuro e muito mais.",
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
    pt: "Bem-vindo de volta"
  },
  "Sign in to your account to continue": {
    en: "Sign in to your account to continue",
    pt: "Entre na sua conta para continuar"
  },
  "Don't have an account?": {
    en: "Don't have an account?",
    pt: "Não tem uma conta?"
  },
  "Sign Up": {
    en: "Sign Up",
    pt: "Cadastrar"
  },
  "Sign In": {
    en: "Sign In",
    pt: "Entrar"
  },
  "Sign in": {
    en: "Sign in",
    pt: "Entrar"
  },
  "Email": {
    en: "Email",
    pt: "Email"
  },
  "Password": {
    en: "Password",
    pt: "Senha"
  },
  "Remember me": {
    en: "Remember me",
    pt: "Lembrar de mim"
  },
  "Forgot password?": {
    en: "Forgot password?",
    pt: "Esqueceu a senha?"
  },
  "Please wait": {
    en: "Please wait",
    pt: "Por favor, aguarde"
  },
  "Login successful": {
    en: "Login successful",
    pt: "Login bem-sucedido"
  },
  "Redirecting to your dashboard...": {
    en: "Redirecting to your dashboard...",
    pt: "Redirecionando para seu painel..."
  },
  "Login failed": {
    en: "Login failed",
    pt: "Falha no login"
  },
  "Something went wrong. Please try again.": {
    en: "Something went wrong. Please try again.",
    pt: "Algo deu errado. Por favor, tente novamente."
  },
  "Create an account": {
    en: "Create an account",
    pt: "Criar uma conta"
  },
  "Sign up to get started with Íris": {
    en: "Sign up to get started with Íris",
    pt: "Cadastre-se para começar a usar o Íris"
  },
  "Already have an account?": {
    en: "Already have an account?",
    pt: "Já tem uma conta?"
  },
  "Hide password": {
    en: "Hide password",
    pt: "Ocultar senha"
  },
  "Show password": {
    en: "Show password",
    pt: "Mostrar senha"
  },
  "Your name": {
    en: "Your name",
    pt: "Seu nome"
  },
  "Your email": {
    en: "Your email",
    pt: "Seu email"
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
  "My Account": {
    en: "My Account",
    pt: "Minha Conta",
  },
  "Backup & Restore": {
    en: "Backup & Restore",
    pt: "Backup & Restauração"
  },
  "Export your data or restore from a backup file.": {
    en: "Export your data or restore from a backup file.",
    pt: "Exporte seus dados ou restaure a partir de um arquivo de backup."
  },
  "Export Data": {
    en: "Export Data",
    pt: "Exportar Dados"
  },
  "Download a backup of all your tasks, projects, labels, and settings.": {
    en: "Download a backup of all your tasks, projects, labels, and settings.",
    pt: "Baixe um backup de todas as suas tarefas, projetos, etiquetas e configurações."
  },
  "Exporting...": {
    en: "Exporting...",
    pt: "Exportando..."
  },
  "Import Data": {
    en: "Import Data",
    pt: "Importar Dados"
  },
  "Restore your data from a previously exported backup file.": {
    en: "Restore your data from a previously exported backup file.",
    pt: "Restaure seus dados a partir de um arquivo de backup exportado anteriormente."
  },
  "Upload a backup file to restore your data. This will not delete your existing data, but may overwrite items with the same name.": {
    en: "Upload a backup file to restore your data. This will not delete your existing data, but may overwrite items with the same name.",
    pt: "Envie um arquivo de backup para restaurar seus dados. Isso não excluirá seus dados existentes, mas pode sobrescrever itens com o mesmo nome."
  },
  "Warning": {
    en: "Warning",
    pt: "Aviso"
  },
  "Importing data will merge with your existing data. Make sure to export your current data first if you want to keep it.": {
    en: "Importing data will merge with your existing data. Make sure to export your current data first if you want to keep it.",
    pt: "A importação de dados será mesclada com seus dados existentes. Certifique-se de exportar seus dados atuais primeiro se quiser mantê-los."
  },
  "Backup File": {
    en: "Backup File",
    pt: "Arquivo de Backup"
  },
  "Importing...": {
    en: "Importing...",
    pt: "Importando..."
  },
  "Import": {
    en: "Import",
    pt: "Importar"
  },
  "Note: Backup files contain all your tasks, projects, labels, and settings. They do not include your account information.": {
    en: "Note: Backup files contain all your tasks, projects, labels, and settings. They do not include your account information.",
    pt: "Nota: Os arquivos de backup contêm todas as suas tarefas, projetos, etiquetas e configurações. Eles não incluem suas informações de conta."
  },
  "Export successful": {
    en: "Export successful",
    pt: "Exportação bem-sucedida"
  },
  "Your data has been exported successfully.": {
    en: "Your data has been exported successfully.",
    pt: "Seus dados foram exportados com sucesso."
  },
  "Export failed": {
    en: "Export failed",
    pt: "Falha na exportação"
  },
  "Failed to export your data. Please try again.": {
    en: "Failed to export your data. Please try again.",
    pt: "Falha ao exportar seus dados. Por favor, tente novamente."
  },
  "No file selected": {
    en: "No file selected",
    pt: "Nenhum arquivo selecionado"
  },
  "Please select a backup file to import.": {
    en: "Please select a backup file to import.",
    pt: "Por favor, selecione um arquivo de backup para importar."
  },
  "Invalid backup file format": {
    en: "Invalid backup file format",
    pt: "Formato de arquivo de backup inválido"
  },
  "Failed to import data": {
    en: "Failed to import data",
    pt: "Falha ao importar dados"
  },
  "Import successful": {
    en: "Import successful",
    pt: "Importação bem-sucedida"
  },
  "Your data has been imported successfully.": {
    en: "Your data has been imported successfully.",
    pt: "Seus dados foram importados com sucesso."
  },
  "Import failed": {
    en: "Import failed",
    pt: "Falha na importação"
  },
  "Failed to import your data. Please try again.": {
    en: "Failed to import your data. Please try again.",
    pt: "Falha ao importar seus dados. Por favor, tente novamente."
  },
  "Name must be at least 2 characters": {
    en: "Name must be at least 2 characters",
    pt: "O nome deve ter pelo menos 2 caracteres"
  },
  "Please enter a valid email address": {
    en: "Please enter a valid email address",
    pt: "Por favor, insira um endereço de email válido"
  },
  "Password must be at least 6 characters": {
    en: "Password must be at least 6 characters",
    pt: "A senha deve ter pelo menos 6 caracteres"
  },
  "Password must be at least 6 characters with one uppercase letter and one number.": {
    en: "Password must be at least 6 characters with one uppercase letter and one number.",
    pt: "A senha deve ter pelo menos 6 caracteres com uma letra maiúscula e um número.",
  },
  "Password is required": {
    en: "Password is required",
    pt: "A senha é obrigatória",
  },
  "Passwords do not match": {
    en: "Passwords do not match",
    pt: "As senhas não coincidem"
  },
  "Missing required fields": {
    en: "Missing required fields",
    pt: "Campos obrigatórios faltando"
  },
  "Failed to login": {
    en: "Failed to login",
    pt: "Falha ao fazer login"
  },
  "Label name is required": {
    en: "Label name is required",
    pt: "O nome da etiqueta é obrigatório"
  },
  "Color must be a valid hex code": {
    en: "Color must be a valid hex code",
    pt: "A cor deve ser um código hexadecimal válido"
  },
  "Failed to update profile": {
    en: "Failed to update profile",
    pt: "Falha ao atualizar perfil"
  },
  "Profile updated": {
    en: "Profile updated",
    pt: "Perfil atualizado"
  },
  "Your profile has been updated successfully.": {
    en: "Your profile has been updated successfully.",
    pt: "Seu perfil foi atualizado com sucesso."
  },
  "Manage your account information.": {
    en: "Manage your account information.",
    pt: "Gerencie suas informações de conta."
  },
  "This is your public display name.": {
    en: "This is your public display name.",
    pt: "Este é seu nome de exibição público."
  },
  "This is the email associated with your account.": {
    en: "This is the email associated with your account.",
    pt: "Este é o email associado à sua conta."
  },
  "Label name": {
    en: "Label name",
    pt: "Nome da etiqueta"
  },
  "Color": {
    en: "Color",
    pt: "Cor"
  },
  "Update Label": {
    en: "Update Label",
    pt: "Atualizar Etiqueta"
  },
  "Failed to update label": {
    en: "Failed to update label",
    pt: "Falha ao atualizar etiqueta"
  },
  "Failed to create label": {
    en: "Failed to create label",
    pt: "Falha ao criar etiqueta"
  },
  "Label updated": {
    en: "Label updated",
    pt: "Etiqueta atualizada"
  },
  "Label created": {
    en: "Label created",
    pt: "Etiqueta criada"
  },
  "Label has been updated successfully.": {
    en: "Label has been updated successfully.",
    pt: "A etiqueta foi atualizada com sucesso."
  },
  "Label has been created successfully.": {
    en: "Label has been created successfully.",
    pt: "A etiqueta foi criada com sucesso."
  },
  Personal: {
    en: "Personal",
    pt: "Pessoal",
  },
  Work: {
    en: "Work",
    pt: "Trabalho",
  },
  Shopping: {
    en: "Shopping",
    pt: "Compras",
  },
  // Mensagens de erro e sucesso
  "Invalid email or password": {
    en: "Invalid email or password",
    pt: "Email ou senha inválidos"
  },
  "Invalid email or password. Please check your credentials and try again.": {
    en: "Invalid email or password. Please check your credentials and try again.",
    pt: "Email ou senha inválidos. Por favor, verifique suas credenciais e tente novamente."
  },
  "Multiple failed login attempts. Make sure your credentials are correct or reset your password.": {
    en: "Multiple failed login attempts. Make sure your credentials are correct or reset your password.",
    pt: "Múltiplas tentativas de login malsucedidas. Certifique-se de que suas credenciais estão corretas ou redefina sua senha."
  },
  "Failed to register": {
    en: "Failed to register",
    pt: "Falha ao registrar"
  },
  "Erro login": {
    en: "Login failed",
    pt: "Falha no login"
  },
  "Erro registro": {
    en: "Registration failed",
    pt: "Falha no registro"
  },
  "Sucesso login": {
    en: "Login successful",
    pt: "Login bem-sucedido"
  },
  "Sucesso registro": {
    en: "Registration successful",
    pt: "Registro bem-sucedido"
  },
  "Redirecionando login": {
    en: "Redirecting to your dashboard...",
    pt: "Redirecionando para seu painel..."
  },
  "Erro email existe": {
    en: "This email is already registered. Please use a different email or try logging in.",
    pt: "Este email já está registrado. Por favor, use um email diferente ou tente fazer login."
  },
  "Mensagem conta criada": {
    en: "Your account has been created. Redirecting to login...",
    pt: "Sua conta foi criada. Redirecionando para o login..."
  },
  
  // Adicionando textos de ordenação
  "Sort by": {
    en: "Sort by",
    pt: "Ordenar por",
  },
  "Prioridade": {
    en: "Priority",
    pt: "Prioridade",
  },
  "Título": {
    en: "Title",
    pt: "Título",
  },
  "Descrição": {
    en: "Description",
    pt: "Descrição",
  },
  "Data de Vencimento": {
    en: "Due Date",
    pt: "Data de Vencimento",
  },
  "Data de Criação": {
    en: "Creation Date",
    pt: "Data de Criação",
  },
  "View all": {
    en: "View all",
    pt: "Ver todos",
  },
  "More": {
    en: "More",
    pt: "Mais",
  },
  "pomodoroSettings": {
    en: "Pomodoro Settings",
    pt: "Configurações do Pomodoro",
  },
  "pomodoroSettingsDescription": {
    en: "Customize your Pomodoro timer settings",
    pt: "Personalize as configurações do temporizador Pomodoro", 
  },
  "Refresh": {
    en: "Refresh Page",
    pt: "Atualizar Página",
  },
  "Cancel": {
    en: "Cancel",
    pt: "Cancelar",
  },

  // Esqueci a senha
  "Forgot Password": {
    en: "Forgot Password",
    pt: "Esqueci a Senha",
  },
  "Forgot password?": {
    en: "Forgot password?",
    pt: "Esqueceu a senha?",
  },
  "Forgot your password?": {
    en: "Forgot your password?",
    pt: "Esqueceu sua senha?",
  },
  "Enter your email address and we'll send you a link to reset your password.": {
    en: "Enter your email address and we'll send you a link to reset your password.",
    pt: "Digite seu endereço de e-mail e enviaremos um link para redefinir sua senha.",
  },
  "Send Reset Link": {
    en: "Send Reset Link",
    pt: "Enviar Link de Redefinição",
  },
  "Sending...": {
    en: "Sending...",
    pt: "Enviando...",
  },
  "Check your email": {
    en: "Check your email",
    pt: "Verifique seu e-mail",
  },
  "We've sent you an email with instructions to reset your password. If you don't see it, check your spam folder.": {
    en: "We've sent you an email with instructions to reset your password. If you don't see it, check your spam folder.",
    pt: "Enviamos um e-mail com instruções para redefinir sua senha. Se não o encontrar, verifique sua pasta de spam.",
  },
  "Try another email": {
    en: "Try another email",
    pt: "Tentar outro e-mail",
  },
  "Request submitted": {
    en: "Request submitted",
    pt: "Solicitação enviada",
  },
  "Check your email for password reset instructions.": {
    en: "Check your email for password reset instructions.",
    pt: "Verifique seu e-mail para instruções de redefinição de senha.",
  },
  "Email is required": {
    en: "Email is required",
    pt: "O email é obrigatório",
  },
  "Please enter a valid email address": {
    en: "Please enter a valid email address",
    pt: "Por favor, insira um endereço de email válido",
  },
  
  // Reset de senha
  "Reset Password": {
    en: "Reset Password",
    pt: "Redefinir Senha",
  },
  "Reset your password": {
    en: "Reset your password",
    pt: "Redefina sua senha",
  },
  "Enter your new password below.": {
    en: "Enter your new password below.",
    pt: "Digite sua nova senha abaixo.",
  },
  "New Password": {
    en: "New Password",
    pt: "Nova Senha",
  },
  "Confirm Password": {
    en: "Confirm Password",
    pt: "Confirmar Senha",
  },
  "Passwords do not match": {
    en: "Passwords do not match",
    pt: "As senhas não coincidem",
  },
  "Please confirm your password": {
    en: "Please confirm your password",
    pt: "Por favor, confirme sua senha",
  },
  "Resetting...": {
    en: "Resetting...",
    pt: "Redefinindo...",
  },
  "Password reset successful": {
    en: "Password reset successful",
    pt: "Senha redefinida com sucesso",
  },
  "Your password has been successfully reset.": {
    en: "Your password has been successfully reset.",
    pt: "Sua senha foi redefinida com sucesso.",
  },
  "Your password has been successfully reset. You can now log in with your new password.": {
    en: "Your password has been successfully reset. You can now log in with your new password.",
    pt: "Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.",
  },
  "Go to Login": {
    en: "Go to Login",
    pt: "Ir para Login",
  },
  "Invalid or expired token": {
    en: "Invalid or expired token",
    pt: "Token inválido ou expirado",
  },
  "The password reset link is invalid or has expired. Please request a new one.": {
    en: "The password reset link is invalid or has expired. Please request a new one.",
    pt: "O link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo.",
  },
  "Back to Forgot Password": {
    en: "Back to Forgot Password",
    pt: "Voltar para Esqueci a Senha",
  },
  "Back to Login": {
    en: "Back to Login",
    pt: "Voltar para Login",
  },
  // Novas traduções para o fluxo de recuperação de senha
  "Development Mode": {
    en: "Development Mode",
    pt: "Modo de Desenvolvimento",
  },
  "In development, we use Ethereal Email for testing. Look for a line in the server console that says 'LINK PARA VISUALIZAR O EMAIL:' and click that URL to see the email.": {
    en: "In development, we use Ethereal Email for testing. Look for a line in the server console that says 'LINK PARA VISUALIZAR O EMAIL:' and click that URL to see the email.",
    pt: "No modo de desenvolvimento, usamos o Ethereal Email para testes. Procure uma linha no console do servidor que diz 'LINK PARA VISUALIZAR O EMAIL:' e clique nessa URL para ver o email.",
  },
  "In development mode, please check the server console for the email preview link. A test email has been generated and you can view it by clicking on the preview URL in the console.": {
    en: "In development mode, please check the server console for the email preview link. A test email has been generated and you can view it by clicking on the preview URL in the console.",
    pt: "No modo de desenvolvimento, verifique o console do servidor para obter o link de visualização do email. Um email de teste foi gerado e você pode visualizá-lo clicando na URL de visualização no console.",
  },
  "Check the console for the email preview link": {
    en: "Check the console for the email preview link",
    pt: "Verifique o console para o link de visualização do email",
  },
  "Name is required": {
    en: "Name is required",
    pt: "O nome é obrigatório",
  },

  // Changelog
  changelog: {
    en: "Release Notes",
    pt: "Notas de versão",
  },
  newChanges: {
    en: "New updates available",
    pt: "Novas atualizações disponíveis",
  },
  newChangesDescription: {
    en: "We have improved the app with new features and bug fixes. Check out what's new!",
    pt: "Melhoramos o aplicativo com novos recursos e correções de bugs. Confira as novidades!",
  },
  latestUpdateInfo: {
    en: "Our latest update includes the new Kanban Board and several improvements.",
    pt: "Nossa mais recente atualização inclui o novo Quadro Kanban e diversas melhorias."
  },
  viewChangelog: {
    en: "View Updates",
    pt: "Ver Atualizações",
  },
  dismiss: {
    en: "Dismiss",
    pt: "Fechar",
  },
  new: {
    en: "New",
    pt: "Novo",
  },
  newFeatures: {
    en: "New Features",
    pt: "Novos Recursos",
  },
  improvements: {
    en: "Improvements",
    pt: "Melhorias",
  },
  bugFixes: {
    en: "Bug Fixes",
    pt: "Correções de Bugs",
  },
  // Novas traduções para notificações de tarefas
  "taskNotifications": {
    en: "Task Notifications",
    pt: "Notificações de Tarefas"
  },
  "showNotificationsForUpcomingTasks": {
    en: "Show notifications for upcoming and overdue tasks",
    pt: "Mostrar notificações para tarefas próximas e vencidas"
  },
  "notificationDays": {
    en: "Notification Days",
    pt: "Dias de Notificação"
  },
  "numberOfDaysBeforeToShowNotifications": {
    en: "Number of days before due date to show notifications",
    pt: "Número de dias antes do vencimento para mostrar notificações"
  },
  "dueTasks": {
    en: "Due Tasks",
    pt: "Tarefas a Vencer"
  },
  "overdueTasks": {
    en: "Overdue Tasks",
    pt: "Tarefas Vencidas"
  },
  "taskDueToday": {
    en: "Due today",
    pt: "Vence hoje"
  },
  "taskDueTomorrow": {
    en: "Due tomorrow",
    pt: "Vence amanhã"
  },
  "taskOverdue": {
    en: "Overdue by {days}",
    pt: "Vencido há {days}"
  },
  "taskDueInDays": {
    en: "Due in {days}",
    pt: "Vence em {days}"
  },
  "youHaveNTasks": {
    en: "You have {count} tasks",
    pt: "Você tem {count} tarefas"
  },
  "dueToday": {
    en: "due today",
    pt: "que vencem hoje"
  },
  "overdue": {
    en: "overdue",
    pt: "vencidas"
  },
  "dueInNextDays": {
    en: "due in the next {days} days",
    pt: "que vencem nos próximos {days} dias"
  },
  "viewAllNotifications": {
    en: "View all notifications",
    pt: "Ver todas as notificações"
  },
  "Next {days} days": {
    en: "Next {days} days",
    pt: "Próximos {days} dias"
  },
  "Today": {
    en: "Today",
    pt: "Hoje"
  },
  "No task notifications": {
    en: "No task notifications",
    pt: "Sem notificações de tarefas"
  },
  "You don't have any tasks due in the next {days} days.": {
    en: "You don't have any tasks due in the next {days} days.",
    pt: "Você não tem tarefas que vencem nos próximos {days} dias."
  },
  "Task completed": {
    en: "Task completed",
    pt: "Tarefa concluída"
  },
  "The task has been marked as complete.": {
    en: "The task has been marked as complete.",
    pt: "A tarefa foi marcada como concluída."
  },
  "Failed to complete task": {
    en: "Failed to complete task",
    pt: "Falha ao concluir tarefa"
  },
  "Complete": {
    en: "Complete",
    pt: "Concluir"
  },
  "System Notifications": {
    en: "System Notifications",
    pt: "Notificações do Sistema"
  },
  "Task Notifications": {
    en: "Task Notifications",
    pt: "Notificações de Tarefas"
  },
  "No tasks available": {
    en: "No tasks available",
    pt: "Nenhuma tarefa disponível"
  },
  "Invalid response format": {
    en: "Invalid response format",
    pt: "Formato de resposta inválido"
  },
  "Task uncompleted": {
    en: "Task uncompleted",
    pt: "Tarefa desmarcada"
  },
  "The task has been marked as incomplete.": {
    en: "The task has been marked as incomplete.",
    pt: "A tarefa foi desmarcada como concluída."
  },
  "Failed to update task": {
    en: "Failed to update task",
    pt: "Falha ao atualizar tarefa"
  },
  "Please try again later.": {
    en: "Please try again later.",
    pt: "Por favor, tente novamente mais tarde."
  },
  workMinutes: {
    en: "Work Minutes",
    pt: "Minutos de Trabalho",
  },
  shortBreakMinutes: {
    en: "Short Break Minutes",
    pt: "Minutos de Pausa Curta",
  },
  longBreakMinutes: {
    en: "Long Break Minutes",
    pt: "Minutos de Pausa Longa",
  },
  longBreakInterval: {
    en: "Long Break Interval",
    pt: "Intervalo de Pausa Longa",
  },
  enableSound: {
    en: "Enable Sound",
    pt: "Ativar Som",
  },
  enableSoundDescription: {
    en: "Play a sound when the timer completes.",
    pt: "Tocar um som quando o temporizador terminar.",
  },
  enableDesktopNotifications: {
    en: "Enable Desktop Notifications",
    pt: "Ativar Notificações de Desktop",
  },
  enableDesktopNotificationsDescription: {
    en: "Show desktop notifications when the timer completes.",
    pt: "Mostrar notificações na área de trabalho quando o temporizador terminar.",
  },
  selectSound: {
    en: "Select Sound",
    pt: "Selecionar Som",
  },
  notification: {
    en: "Notification",
    pt: "Notificação",
  },
  ding: {
    en: "Ding",
    pt: "Campainha",
  },
  "Notifications not supported": {
    en: "Notifications not supported",
    pt: "Notificações não suportadas",
  },
  "Your browser does not support desktop notifications.": {
    en: "Your browser does not support desktop notifications.",
    pt: "Seu navegador não suporta notificações de desktop.",
  },
  "Please enable notifications in your browser settings.": {
    en: "Please enable notifications in your browser settings.",
    pt: "Habilite as notificações nas configurações do seu navegador.",
  },
  "Notifications enabled": {
    en: "Notifications enabled",
    pt: "Notificações habilitadas",
  },
  "You will now receive desktop notifications when timers complete.": {
    en: "You will now receive desktop notifications when timers complete.",
    pt: "Agora você receberá notificações de desktop quando os temporizadores terminarem.",
  },
  "Desktop notifications will not be shown.": {
    en: "Desktop notifications will not be shown.",
    pt: "Notificações de desktop não serão exibidas.",
  },
  "Failed to request notification permissions.": {
    en: "Failed to request notification permissions.",
    pt: "Falha ao solicitar permissões de notificação.",
  },
  options: {
    en: "options",
    pt: "opções",
  },
  view: {
    en: "view",
    pt: "visualizar",
  },
  addCard: {
    en: "Add Card",
    pt: "Adicionar Cartão",
  },
  moveCard: {
    en: "Move Card",
    pt: "Mover Cartão",
  },
  kanbanBoard: {
    en: "Kanban Board",
    pt: "Quadro Kanban",
  },
  organizeYourWorkflow: {
    en: "Organize your workflow",
    pt: "Organize seu fluxo de trabalho",
  },
  "Mantenha-se organizado e produtivo com nosso gerenciador de tarefas Íris. Inclui temporizador Pomodoro, notificações, modo escuro e muito mais.": {
    en: "Stay organized and productive with our Íris task manager. Includes Pomodoro timer, notifications, dark mode, and more.",
    pt: "Mantenha-se organizado e produtivo com nosso gerenciador de tarefas Íris. Inclui temporizador Pomodoro, notificações, modo escuro e muito mais.",
  },
  "Gratuito": {
    en: "Free",
    pt: "Gratuito",
  },
  "Fácil de usar": {
    en: "Easy to use",
    pt: "Fácil de usar",
  },
  "Seguro": {
    en: "Secure",
    pt: "Seguro",
  },
  "Recursos avançados de produtividade": {
    en: "Advanced productivity features",
    pt: "Recursos avançados de produtividade",
  },
  "Tudo o que você precisa para se manter organizado e produtivo em um só lugar": {
    en: "Everything you need to stay organized and productive in one place",
    pt: "Tudo o que você precisa para se manter organizado e produtivo em um só lugar",
  },
  "Temporizador Pomodoro": {
    en: "Pomodoro Timer",
    pt: "Temporizador Pomodoro",
  },
  "Mantenha o foco com temporizador Pomodoro integrado para aumentar sua produtividade e gerenciar períodos de trabalho e descanso.": {
    en: "Stay focused with integrated Pomodoro timer to increase your productivity and manage work and rest periods.",
    pt: "Mantenha o foco com temporizador Pomodoro integrado para aumentar sua produtividade e gerenciar períodos de trabalho e descanso.",
  },
  "Gerenciamento de Tarefas": {
    en: "Task Management",
    pt: "Gerenciamento de Tarefas",
  },
  "Organize tarefas com projetos personalizados, níveis de prioridade e datas de vencimento para manter seu fluxo de trabalho organizado.": {
    en: "Organize tasks with custom projects, priority levels, and due dates to keep your workflow organized.",
    pt: "Organize tarefas com projetos personalizados, níveis de prioridade e datas de vencimento para manter seu fluxo de trabalho organizado.",
  },
  "Visualização de Calendário": {
    en: "Calendar View",
    pt: "Visualização de Calendário",
  },
  "Veja suas tarefas em uma visualização de calendário para planejar sua semana com eficiência e nunca perder prazos importantes.": {
    en: "View your tasks in a calendar view to efficiently plan your week and never miss important deadlines.",
    pt: "Veja suas tarefas em uma visualização de calendário para planejar sua semana com eficiência e nunca perder prazos importantes.",
  },
  "Sistema de Notificações": {
    en: "Notification System",
    pt: "Sistema de Notificações",
  },
  "Receba avisos sobre tarefas próximas ao vencimento, atrasadas e eventos importantes para nunca perder um prazo.": {
    en: "Receive alerts about upcoming, overdue tasks and important events to never miss a deadline.",
    pt: "Receba avisos sobre tarefas próximas ao vencimento, atrasadas e eventos importantes para nunca perder um prazo.",
  },
  "Modo Escuro": {
    en: "Dark Mode",
    pt: "Modo Escuro",
  },
  "Alterne entre temas claros e escuros para reduzir o cansaço visual e adaptar a interface às suas preferências.": {
    en: "Switch between light and dark themes to reduce eye strain and adapt the interface to your preferences.",
    pt: "Alterne entre temas claros e escuros para reduzir o cansaço visual e adaptar a interface às suas preferências.",
  },
  "Personalização": {
    en: "Customization",
    pt: "Personalização",
  },
  "Adapte o aplicativo ao seu estilo com cores personalizáveis, diferentes sons de notificação e preferências de exibição.": {
    en: "Adapt the app to your style with customizable colors, different notification sounds, and display preferences.",
    pt: "Adapte o aplicativo ao seu estilo com cores personalizáveis, diferentes sons de notificação e preferências de exibição.",
  },
  "Comece a usar hoje": {
    en: "Start using today",
    pt: "Comece a usar hoje",
  },
  "Registre-se gratuitamente e comece a organizar suas tarefas e aumentar sua produtividade": {
    en: "Sign up for free and start organizing your tasks and increasing your productivity",
    pt: "Registre-se gratuitamente e comece a organizar suas tarefas e aumentar sua produtividade",
  },
  "Criar conta grátis": {
    en: "Create free account",
    pt: "Criar conta grátis",
  },
  "Fazer login": {
    en: "Log in",
    pt: "Fazer login",
  },
  // Mensagens do Kanban quando não há tarefas
  "No tasks in planning": {
    en: "No tasks in planning",
    pt: "Sem tarefas no planejamento",
  },
  "No tasks in backlog": {
    en: "No tasks in backlog",
    pt: "Sem tarefas no backlog",
  },
  "No tasks in progress": {
    en: "No tasks in progress",
    pt: "Sem tarefas em progresso",
  },
  "No tasks in validation": {
    en: "No tasks in validation",
    pt: "Sem tarefas em validação",
  },
  "No completed tasks": {
    en: "No completed tasks",
    pt: "Sem tarefas concluídas",
  },
  "No tasks": {
    en: "No tasks",
    pt: "Sem tarefas",
  },
  
  // Relatórios
  reports: {
    en: "Reports",
    pt: "Relatórios",
  },
  "Generate Report": {
    en: "Generate Report",
    pt: "Gerar Relatório",
  },
  "Report History": {
    en: "Report History",
    pt: "Histórico de Relatórios",
  },
  "Report Settings": {
    en: "Report Settings",
    pt: "Configurações do Relatório",
  },
  "Configure the parameters for your report": {
    en: "Configure the parameters for your report",
    pt: "Configure os parâmetros para seu relatório",
  },
  "Report Type": {
    en: "Report Type",
    pt: "Tipo de Relatório",
  },
  "Date Range": {
    en: "Date Range",
    pt: "Período",
  },
  "Select a report type": {
    en: "Select a report type",
    pt: "Selecione um tipo de relatório",
  },
  "Select a date range": {
    en: "Select a date range",
    pt: "Selecione um período",
  },
  "Pick a date": {
    en: "Pick a date",
    pt: "Escolha uma data",
  },
  "Reports": {
    en: "Reports",
    pt: "Relatórios",
  },
  "All Tasks": {
    en: "All Tasks",
    pt: "Todas as Tarefas",
  },
  "Completed Tasks": {
    en: "Completed Tasks",
    pt: "Tarefas Concluídas",
  },
  "Pending Tasks": {
    en: "Pending Tasks",
    pt: "Tarefas Pendentes",
  },
  "Overdue Tasks": {
    en: "Overdue Tasks",
    pt: "Tarefas Atrasadas",
  },
  "Productivity Analysis": {
    en: "Productivity Analysis",
    pt: "Análise de Produtividade",
  },
  "Export as Excel": {
    en: "Export as Excel",
    pt: "Exportar como Excel",
  },
  "Export as PDF": {
    en: "Export as PDF",
    pt: "Exportar como PDF",
  },
  "Report Preview": {
    en: "Report Preview",
    pt: "Prévia do Relatório",
  },
  "Preview of your report based on selected parameters": {
    en: "Preview of your report based on selected parameters",
    pt: "Prévia do seu relatório com base nos parâmetros selecionados",
  },
  "Select a date range to preview your report": {
    en: "Select a date range to preview your report",
    pt: "Selecione um período para visualizar seu relatório",
  },
  "Recent Reports": {
    en: "Recent Reports",
    pt: "Relatórios Recentes",
  },
  "Your previously generated reports": {
    en: "Your previously generated reports",
    pt: "Seus relatórios gerados anteriormente",
  },
  "No reports generated yet": {
    en: "No reports generated yet",
    pt: "Nenhum relatório gerado ainda",
  },
  "Generate and download reports of your tasks and activities": {
    en: "Generate and download reports of your tasks and activities",
    pt: "Gere e baixe relatórios de suas tarefas e atividades",
  },
  "Date range required": {
    en: "Date range required",
    pt: "Período obrigatório",
  },
  "Please select a date range for your report": {
    en: "Please select a date range for your report",
    pt: "Por favor, selecione um período para seu relatório",
  },
  "Report generated": {
    en: "Report generated",
    pt: "Relatório gerado",
  },
  "Your report has been generated and is downloading": {
    en: "Your report has been generated and is downloading",
    pt: "Seu relatório foi gerado e está sendo baixado",
  },
  "Export failed": {
    en: "Export failed",
    pt: "Falha na exportação",
  },
  "There was an error exporting your report": {
    en: "There was an error exporting your report",
    pt: "Ocorreu um erro ao exportar seu relatório",
  },
  "Type": {
    en: "Type",
    pt: "Tipo",
  },
  "Format": {
    en: "Format",
    pt: "Formato",
  },
  "Date": {
    en: "Date",
    pt: "Data",
  },
  "Action": {
    en: "Action",
    pt: "Ação",
  },
  "Download": {
    en: "Download",
    pt: "Baixar",
  },
  "Report Configuration": {
    en: "Report Configuration",
    pt: "Configuração do Relatório",
  },
  "Period": {
    en: "Period",
    pt: "Período",
  },
  "Generate": {
    en: "Generate",
    pt: "Gerar",
  },
  "Set parameters above and click Export to download your report": {
    en: "Set parameters above and click Export to download your report",
    pt: "Defina os parâmetros acima e clique em Exportar para baixar seu relatório",
  },
  Tasks: {
    en: "Tasks",
    pt: "Tarefas",
  },
  Productivity: {
    en: "Productivity",
    pt: "Produtividade",
  },
  Pending: {
    en: "Pending",
    pt: "Pendentes",
  },
  Overdue: {
    en: "Overdue",
    pt: "Atrasadas",
  },
  "Start Date": {
    en: "Start Date",
    pt: "Data Inicial",
  },
  "End Date": {
    en: "End Date",
    pt: "Data Final",
  },
  "Generating...": {
    en: "Generating...",
    pt: "Gerando...",
  },
  "Coming Soon": {
    en: "Coming Soon",
    pt: "Em Breve",
  },
  "Customizable Reports": {
    en: "Customizable Reports",
    pt: "Relatórios Personalizáveis",
  },
  "Generate reports based on your specific needs.": {
    en: "Generate reports based on your specific needs.",
    pt: "Gere relatórios baseados em suas necessidades específicas.",
  },
  "Multiple Export Formats": {
    en: "Multiple Export Formats",
    pt: "Múltiplos Formatos de Exportação",
  },
  "Download your reports in PDF, Excel, and more.": {
    en: "Download your reports in PDF, Excel, and more.",
    pt: "Baixe seus relatórios em PDF, Excel e outros formatos.",
  },
  "Data Visualization": {
    en: "Data Visualization",
    pt: "Visualização de Dados",
  },
  "View your tasks data with beautiful charts and graphs.": {
    en: "View your tasks data with beautiful charts and graphs.",
    pt: "Visualize seus dados de tarefas com belos gráficos e diagramas.",
  },
}

type LanguageState = {
  language: Language
  setLanguage: (language: Language) => void
  isHydrated: boolean
  setHydrated: (hydrated: boolean) => void
}

// Estado padrão é português
const DEFAULT_LANGUAGE: Language = "pt"

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      isHydrated: false,
      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
      setLanguage: (language: Language) => {
        if (typeof document !== 'undefined') {
          document.cookie = `language-storage=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          
          setCookie('user-language', language);
          
          console.log('[i18n] Language changed to:', language);
          
          document.documentElement.lang = language === "en" ? "en" : "pt-BR";
          console.log('[i18n] HTML language attribute set to:', document.documentElement.lang);
          
          document.documentElement.setAttribute('data-language', language);
          
          setTimeout(() => {
            const cookies = document.cookie.split(';').map(c => c.trim());
            const langCookie = cookies.find(c => c.startsWith('user-language='));
            console.log('[i18n] Cookie check after setting:', langCookie);
          }, 100);
          
          try {
            const event = new Event('languageChanged');
            window.dispatchEvent(event);
          } catch (error) {
            console.error('[i18n] Error dispatching language change event:', error);
          }
        }
        
        set({ language });
      },
    }),
    {
      name: "language-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true);
          
          if (typeof document !== 'undefined') {
            setCookie('user-language', state.language);
            
            document.documentElement.lang = state.language === "en" ? "en" : "pt-BR";
          }
        }
      },
    }
  )
)

export function useTranslation() {
  const { language, setLanguage, isHydrated } = useLanguageStore()
  
  useEffect(() => {
  }, [])

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`[TRADUÇÃO FALTANDO] Key: "${key}" para o idioma: ${language}`)
      
      const suggestion = `  "${key}": {
    en: "${key}",
    pt: "TRADUÇÃO PENDENTE",
  },`
      console.info('Adicione isto ao arquivo i18n.ts:\n', suggestion)
      return key
    }
    
    const translated = translations[key][language] || translations[key]['en'] || key
    
    if (['inbox', 'today', 'upcoming', 'completed', 'projects', 'labels'].includes(key)) {
      console.log(`[useTranslation] Tradução: "${key}" -> "${translated}" (idioma: ${language})`)
    }
    
    return translated
  }

  return { t, language, setLanguage }
}

export function getServerTranslation(key: string, language: "en" | "pt" = "pt"): string {
  if (!translations[key]) {
    console.warn(`[getServerTranslation] Tradução não encontrada para: ${key}`)
    return key
  }
  
  const translated = translations[key][language] || key
  
  if (['inbox', 'today', 'upcoming', 'completed', 'projects', 'labels'].includes(key)) {
    console.log(`[getServerTranslation] Tradução: "${key}" -> "${translated}" (idioma: ${language})`)
  }
  
  return translated
}

