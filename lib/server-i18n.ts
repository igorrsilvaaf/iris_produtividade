// Versão da tradução específica para o servidor
// Não inclui "use client" para funcionar corretamente no lado do servidor

export type Language = "en" | "pt";

type Translations = {
  [key: string]: {
    [key in Language]: string;
  };
};

// Copiar o objeto de traduções do arquivo cliente
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
  calendar: {
    en: "Calendar",
    pt: "Calendário",
  },
  snippets: {
    en: "Snippets",
    pt: "Snippets",
  },
  apiDocs: {
    en: "API Documentation",
    pt: "Documentação da API",
  },
  addTask: {
    en: "Add Task",
    pt: "Adicionar Tarefa",
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
  "No task notifications": {
    en: "No task notifications",
    pt: "Sem notificações de tarefas",
  },
  "You don't have any tasks due in the next {days} days": {
    en: "You don't have any tasks due in the next {days} days",
    pt: "Você não tem tarefas que vencem nos próximos {days} dias",
  },
  overdueTasks: {
    en: "Overdue Tasks",
    pt: "Tarefas Vencidas",
  },
  dueTasks: {
    en: "Due Tasks",
    pt: "Tarefas a Vencer",
  },
  "Next {days} days": {
    en: "Next {days} days",
    pt: "Próximos {days} dias",
  },
  "Task completed": {
    en: "Task completed",
    pt: "Tarefa concluída",
  },
  "The task has been marked as complete.": {
    en: "The task has been marked as complete.",
    pt: "A tarefa foi marcada como concluída.",
  },
  "Failed to complete task": {
    en: "Failed to complete task",
    pt: "Falha ao concluir tarefa",
  },
  "Please try again.": {
    en: "Please try again.",
    pt: "Por favor, tente novamente.",
  },
  Complete: {
    en: "Complete",
    pt: "Concluir",
  },

  // Notificações de tarefas - mensagens de data
  taskDueToday: {
    en: "Due today",
    pt: "Vence hoje",
  },
  taskDueTomorrow: {
    en: "Due tomorrow",
    pt: "Vence amanhã",
  },
  taskOverdue: {
    en: "Overdue by {days}",
    pt: "Vencido há {days}",
  },
  taskDueInDays: {
    en: "Due in {days}",
    pt: "Vence em {days}",
  },

  // Adicione outras traduções conforme necessário
};

// Função específica para uso em componentes do servidor
export function getServerTranslation(
  key: string,
  language: "en" | "pt" = "pt"
): string {
  if (!translations[key]) {
    return key;
  }

  return translations[key][language] || key;
}
