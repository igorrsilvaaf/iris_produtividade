// Versão da tradução específica para o servidor
// Não inclui "use client" para funcionar corretamente no lado do servidor

export type Language = "en" | "pt"

type Translations = {
  [key: string]: {
    [key in Language]: string
  }
}

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
  addTask: {
    en: "Add Task",
    pt: "Adicionar Tarefa",
  },
  // Adicione outras traduções conforme necessário
}

// Função específica para uso em componentes do servidor
export function getServerTranslation(key: string, language: Language = "pt"): string {
  if (!translations[key]) {
    console.warn(`[getServerTranslation] Tradução não encontrada para: ${key}`)
    return key
  }
  
  const translated = translations[key][language] || key
  
  // Log apenas para depuração
  if (['inbox', 'today', 'upcoming', 'completed', 'projects', 'labels'].includes(key)) {
    console.log(`[getServerTranslation] Tradução: "${key}" -> "${translated}" (idioma: ${language})`)
  }
  
  return translated
} 