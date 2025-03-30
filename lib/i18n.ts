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
  "Stay organized and productive with our To-Do task manager. Includes Pomodoro timer, dark mode, and more.": {
    en: "Stay organized and productive with our To-Do task manager. Includes Pomodoro timer, dark mode, and more.",
    pt: "Mantenha-se organizado e produtivo com nosso gerenciador de tarefas To-Do. Inclui temporizador Pomodoro, modo escuro e muito mais.",
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
    pt: "Login realizado com sucesso"
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
  "Sign up to get started with To-Do": {
    en: "Sign up to get started with To-Do",
    pt: "Cadastre-se para começar a usar o To-Do"
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
    pt: "Registro realizado com sucesso",
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
    pt: "Falha no login"
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
      language: "pt",
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

