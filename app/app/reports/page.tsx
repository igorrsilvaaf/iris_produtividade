"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

// Import each icon individually instead of using barrel imports
import { Download } from "lucide-react"
import { FileSpreadsheet } from "lucide-react"
import { FileText as FilePdf } from "lucide-react" // Use FileText as FilePdf
import { Loader2 } from "lucide-react"
import { Calendar } from "lucide-react"
import { Tag } from "lucide-react"
import { Folder } from "lucide-react"
import { Flag } from "lucide-react"
import { Sliders } from "lucide-react"

// Import utility functions and types
import { 
  ReportData, 
  ReportFilters,
  fetchTasks, 
  fetchProjects,
  fetchLabels,
  generateCSV, 
  generateHTML, 
  generateFileName, 
  triggerDownload 
} from "./utils"
import type { Project } from "@/lib/projects"
import type { Label } from "@/lib/labels"

// Define types for reports
interface Report {
  id: string
  type: string
  format: "pdf" | "excel"
  date: string
  filters?: ReportFilters
}

export default function ReportsPage() {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [reportType, setReportType] = useState("tasks")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reportFormat, setReportFormat] = useState<"pdf" | "excel">("pdf")
  const [isLoading, setIsLoading] = useState(false)
  const [recentReports, setRecentReports] = useState<Report[]>([])
  
  // Estado para os filtros novos
  const [projects, setProjects] = useState<Project[]>([])
  const [labels, setLabels] = useState<Label[]>([])
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  
  // Estado para customização de colunas
  const [showCustomization, setShowCustomization] = useState(false)
  const [customColumns, setCustomColumns] = useState<string[]>([])
  
  // Configuração de colunas disponíveis
  const availableColumns = [
    { id: 'description', label: 'Descrição' },
    { id: 'due_date', label: 'Data de Vencimento' },
    { id: 'priority', label: 'Prioridade' },
    { id: 'completed', label: 'Status de Conclusão' },
    { id: 'project', label: 'Projeto' },
    { id: 'labels', label: 'Etiquetas' },
    { id: 'kanban_column', label: 'Coluna Kanban' },
    { id: 'created_at', label: 'Data de Criação' },
    { id: 'updated_at', label: 'Data de Atualização' }
  ];
  
  // Priority options
  const priorityOptions = [
    { value: "1", label: "Urgente" },
    { value: "2", label: "Alta" },
    { value: "3", label: "Média" },
    { value: "4", label: "Baixa" },
    { value: "5", label: "Muito Baixa" }
  ];

  // Evitar problemas de hidratação e renderização
  useEffect(() => {
    setIsMounted(true)
    
    // Definir data inicial como início do mês atual por padrão
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(firstDay.toISOString().split('T')[0]);
    
    // Definir data final como hoje por padrão
    setEndDate(now.toISOString().split('T')[0]);
    
    // Carregar relatórios recentes do localStorage
    try {
      const savedReports = localStorage.getItem('recent-reports');
      if (savedReports) {
        setRecentReports(JSON.parse(savedReports));
      }
    } catch (error) {
      console.error("Erro ao carregar histórico de relatórios:", error);
    }
    
    // Carregar projetos
    const loadProjects = async () => {
      const projectData = await fetchProjects();
      setProjects(projectData);
    };
    
    // Carregar etiquetas
    const loadLabels = async () => {
      const labelData = await fetchLabels();
      setLabels(labelData);
    };
    
    loadProjects();
    loadLabels();
  }, [])

  // Manipuladores dos campos de formulário
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value)
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value)
  }
  
  // Manipulador para toggle de projeto
  const handleProjectToggle = (projectId: string) => {
    setSelectedProjects(prev => {
      const isSelected = prev.includes(projectId);
      if (isSelected) {
        return prev.filter(id => id !== projectId);
      } else {
        return [...prev, projectId];
      }
    });
  };
  
  // Manipulador para toggle de etiqueta
  const handleLabelToggle = (labelId: string) => {
    setSelectedLabels(prev => {
      const isSelected = prev.includes(labelId);
      if (isSelected) {
        return prev.filter(id => id !== labelId);
      } else {
        return [...prev, labelId];
      }
    });
  };
  
  // Manipulador para toggle de prioridade
  const handlePriorityToggle = (priority: string) => {
    setSelectedPriorities(prev => {
      const isSelected = prev.includes(priority);
      if (isSelected) {
        return prev.filter(p => p !== priority);
      } else {
        return [...prev, priority];
      }
    });
  };
  
  // Manipulador para toggle de coluna customizada
  const handleColumnToggle = (columnId: string) => {
    setCustomColumns(prev => {
      const isSelected = prev.includes(columnId);
      if (isSelected) {
        return prev.filter(id => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };
  
  // Limpar todos os filtros
  const handleClearFilters = () => {
    setSelectedProjects([]);
    setSelectedLabels([]);
    setSelectedPriorities([]);
  };

  // Formato para exibição de datas
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch (error) {
      console.error("Erro ao formatar data:", error)
      return dateString
    }
  }

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Período obrigatório",
        description: "Por favor, selecione um período para seu relatório",
      })
      return
    }

    setIsLoading(true)
    
    try {
      // Preparar os filtros
      const filters: ReportFilters = {
        projectIds: selectedProjects.length > 0 ? selectedProjects : undefined,
        labelIds: selectedLabels.length > 0 ? selectedLabels : undefined,
        priorities: selectedPriorities.length > 0 ? selectedPriorities : undefined,
        customColumns: customColumns.length > 0 ? customColumns : undefined
      };
      
      // Buscar dados reais das tarefas
      const tasks = await fetchTasks(reportType, startDate, endDate, filters);
      
      // Criar estrutura de dados do relatório
      const reportData: ReportData = {
        title: `Relatório de ${reportType === 'tasks' ? 'Todas as Tarefas' : 
                reportType === 'completed' ? 'Tarefas Concluídas' : 
                reportType === 'pending' ? 'Tarefas Pendentes' : 
                reportType === 'overdue' ? 'Tarefas Atrasadas' : 
                'Análise de Produtividade'}`,
        period: { start: startDate, end: endDate },
        generatedAt: new Date().toISOString(),
        items: tasks,
        filters // Incluir filtros para exibição no relatório
      };
      
      // Gerar o arquivo baseado no formato selecionado
      let content: string;
      let mimeType: string;
      let fileName: string;
      let toastMessage: string;
      
      if (reportFormat === 'excel') {
        // Para Excel, geramos um CSV
        content = generateCSV(reportData);
        mimeType = 'text/csv;charset=utf-8;';
        fileName = generateFileName(reportType, 'excel');
        toastMessage = "Abra o arquivo .csv no Excel ou outro programa de planilhas";
      } else {
        // Para PDF, geramos HTML (que pode ser renderizado como PDF pelo navegador)
        content = generateHTML(reportData);
        mimeType = 'text/html;charset=utf-8;';
        fileName = generateFileName(reportType, 'pdf');
        toastMessage = "Abra o arquivo .html no navegador e use a opção Imprimir para salvar como PDF";
      }
      
      // Disparar o download
      triggerDownload(content, fileName, mimeType);
      
      // Adicionar ao histórico de relatórios
      const newReport: Report = {
        id: String(Date.now()),
        type: reportType,
        format: reportFormat,
        date: new Date().toISOString(),
        filters // Salvar filtros no histórico
      }
      
      const updatedReports = [newReport, ...recentReports].slice(0, 5);
      setRecentReports(updatedReports);
      
      // Salvar relatórios recentes no localStorage
      try {
        localStorage.setItem('recent-reports', JSON.stringify(updatedReports));
      } catch (error) {
        console.error("Erro ao salvar histórico de relatórios:", error);
      }
      
      toast({
        title: "Relatório gerado",
        description: toastMessage,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        variant: "destructive",
        title: "Falha na exportação",
        description: "Ocorreu um erro ao exportar seu relatório",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Mostra um estado de carregamento até que o componente esteja montado no cliente
  if (!isMounted) {
    return (
      <div className="container max-w-screen-lg py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere e baixe relatórios de suas tarefas e atividades
          </p>
        </div>
        <div className="w-full h-[400px] flex items-center justify-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded-md"></div>
            <div className="h-40 w-full bg-muted rounded-md"></div>
          </div>
        </div>
      </div>
    )
  }

  // Mapeamento de tipos de relatório
  const reportTypes: Record<string, string> = {
    "tasks": "Todas as Tarefas",
    "completed": "Tarefas Concluídas",
    "pending": "Tarefas Pendentes",
    "overdue": "Tarefas Atrasadas",
    "productivity": "Análise de Produtividade"
  }

  return (
    <div className="container max-w-screen-lg py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Gere e baixe relatórios de suas tarefas e atividades
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="generate">Gerar Relatório</TabsTrigger>
          <TabsTrigger value="history">Histórico de Relatórios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração do Relatório</CardTitle>
              <CardDescription>
                Configure os parâmetros para seu relatório
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="report-type" className="text-base font-medium mb-2 block">
                    Tipo de Relatório
                  </Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger id="report-type" className="w-full">
                      <SelectValue placeholder="Selecione um tipo de relatório" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Relatórios</SelectLabel>
                        <SelectItem value="tasks">Todas as Tarefas</SelectItem>
                        <SelectItem value="completed">Tarefas Concluídas</SelectItem>
                        <SelectItem value="pending">Tarefas Pendentes</SelectItem>
                        <SelectItem value="overdue">Tarefas Atrasadas</SelectItem>
                        <SelectItem value="productivity">Análise de Produtividade</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium mb-2 block">Período</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date" className="text-sm text-muted-foreground">
                        Data Inicial
                      </Label>
                      <div className="flex items-center relative">
                        <Calendar className="h-4 w-4 absolute left-3 text-muted-foreground" />
                        <input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={handleStartDateChange}
                          className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                          aria-label="Data Inicial"
                          title="Data Inicial"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date" className="text-sm text-muted-foreground">
                        Data Final
                      </Label>
                      <div className="flex items-center relative">
                        <Calendar className="h-4 w-4 absolute left-3 text-muted-foreground" />
                        <input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={handleEndDateChange}
                          className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm"
                          aria-label="Data Final"
                          title="Data Final"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Filtro por Projetos */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      <Folder className="h-4 w-4 inline-block mr-2" />
                      Filtrar por Projetos
                    </Label>
                    {selectedProjects.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedProjects([])}
                        className="h-8 px-2 text-xs"
                      >
                        Limpar
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {projects.length > 0 ? (
                      projects.map(project => (
                        <Badge 
                          key={project.id} 
                          variant={selectedProjects.includes(project.id.toString()) ? "default" : "outline"}
                          className="cursor-pointer"
                          style={{
                            backgroundColor: selectedProjects.includes(project.id.toString()) ? project.color : 'transparent',
                            borderColor: project.color,
                            color: selectedProjects.includes(project.id.toString()) ? '#fff' : 'inherit'
                          }}
                          onClick={() => handleProjectToggle(project.id.toString())}
                        >
                          {project.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum projeto encontrado</p>
                    )}
                  </div>
                </div>
                
                {/* Filtro por Etiquetas */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      <Tag className="h-4 w-4 inline-block mr-2" />
                      Filtrar por Etiquetas
                    </Label>
                    {selectedLabels.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedLabels([])}
                        className="h-8 px-2 text-xs"
                      >
                        Limpar
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {labels.length > 0 ? (
                      labels.map(label => (
                        <Badge 
                          key={label.id} 
                          variant={selectedLabels.includes(label.id.toString()) ? "default" : "outline"}
                          className="cursor-pointer"
                          style={{
                            backgroundColor: selectedLabels.includes(label.id.toString()) ? label.color : 'transparent',
                            borderColor: label.color,
                            color: selectedLabels.includes(label.id.toString()) ? '#fff' : 'inherit'
                          }}
                          onClick={() => handleLabelToggle(label.id.toString())}
                        >
                          {label.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma etiqueta encontrada</p>
                    )}
                  </div>
                </div>
                
                {/* Filtro por Prioridades */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">
                      <Flag className="h-4 w-4 inline-block mr-2" />
                      Filtrar por Prioridades
                    </Label>
                    {selectedPriorities.length > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedPriorities([])}
                        className="h-8 px-2 text-xs"
                      >
                        Limpar
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {priorityOptions.map(priority => (
                      <Badge 
                        key={priority.value} 
                        variant={selectedPriorities.includes(priority.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handlePriorityToggle(priority.value)}
                      >
                        {priority.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Customização de Colunas */}
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => setShowCustomization(!showCustomization)}
                    className="w-full justify-between"
                  >
                    <span className="flex items-center">
                      <Sliders className="h-4 w-4 mr-2" />
                      Personalizar Colunas do Relatório
                    </span>
                    <span>{showCustomization ? '▲' : '▼'}</span>
                  </Button>
                  
                  {showCustomization && (
                    <div className="mt-4 p-4 border rounded-md bg-muted/20">
                      <p className="text-sm text-muted-foreground mb-3">
                        Selecione quais colunas deseja incluir no relatório. Se nenhuma for selecionada, todas serão incluídas.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableColumns.map(column => (
                          <div key={column.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`col-${column.id}`} 
                              checked={customColumns.includes(column.id)}
                              onCheckedChange={() => handleColumnToggle(column.id)}
                            />
                            <Label htmlFor={`col-${column.id}`} className="text-sm cursor-pointer">
                              {column.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium mb-2 block">Formato</Label>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="format-pdf"
                        name="format"
                        value="pdf"
                        checked={reportFormat === "pdf"}
                        onChange={() => setReportFormat("pdf")}
                        className="mr-2 h-4 w-4"
                        aria-label="PDF"
                        title="PDF"
                      />
                      <Label htmlFor="format-pdf" className="text-sm font-normal cursor-pointer flex items-center">
                        <FilePdf className="h-4 w-4 mr-1" />
                        PDF
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="format-excel"
                        name="format"
                        value="excel"
                        checked={reportFormat === "excel"}
                        onChange={() => setReportFormat("excel")}
                        className="mr-2 h-4 w-4"
                        aria-label="Excel"
                        title="Excel"
                      />
                      <Label htmlFor="format-excel" className="text-sm font-normal cursor-pointer flex items-center">
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                        Excel
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  disabled={selectedProjects.length === 0 && selectedLabels.length === 0 && selectedPriorities.length === 0}
                >
                  Limpar Filtros
                </Button>
                
                <Button
                  onClick={handleExport}
                  disabled={isLoading || !startDate || !endDate}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prévia do Relatório</CardTitle>
              <CardDescription>
                Prévia do seu relatório com base nos parâmetros selecionados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[300px] border rounded-md bg-muted/30 p-4">
                {startDate && endDate ? (
                  <div className="text-center space-y-6 p-4 max-w-md">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Configuração do Relatório</h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Tipo:</strong> {reportTypes[reportType]}</p>
                        <p><strong>Período:</strong> {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}</p>
                        <p><strong>Formato:</strong> {reportFormat.toUpperCase()}</p>
                        
                        {/* Mostrar filtros aplicados */}
                        {selectedProjects.length > 0 && (
                          <div className="mt-2">
                            <p><strong>Projetos:</strong></p>
                            <div className="flex flex-wrap gap-1 mt-1 justify-center">
                              {selectedProjects.map(projId => {
                                const project = projects.find(p => p.id.toString() === projId);
                                return project ? (
                                  <Badge 
                                    key={projId}
                                    style={{
                                      backgroundColor: project.color,
                                      color: '#fff'
                                    }}
                                    className="text-xs"
                                  >
                                    {project.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                        
                        {selectedLabels.length > 0 && (
                          <div className="mt-2">
                            <p><strong>Etiquetas:</strong></p>
                            <div className="flex flex-wrap gap-1 mt-1 justify-center">
                              {selectedLabels.map(labelId => {
                                const label = labels.find(l => l.id.toString() === labelId);
                                return label ? (
                                  <Badge 
                                    key={labelId}
                                    style={{
                                      backgroundColor: label.color,
                                      color: '#fff'
                                    }}
                                    className="text-xs"
                                  >
                                    {label.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                        
                        {selectedPriorities.length > 0 && (
                          <div className="mt-2">
                            <p><strong>Prioridades:</strong></p>
                            <div className="flex flex-wrap gap-1 mt-1 justify-center">
                              {selectedPriorities.map(priority => {
                                const priorityObj = priorityOptions.find(p => p.value === priority);
                                return priorityObj ? (
                                  <Badge key={priority} className="text-xs">
                                    {priorityObj.label}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Mostrar colunas customizadas */}
                        {customColumns.length > 0 && (
                          <div className="mt-2">
                            <p><strong>Colunas personalizadas:</strong></p>
                            <div className="flex flex-wrap gap-1 mt-1 justify-center">
                              {customColumns.map(colId => {
                                const column = availableColumns.find(c => c.id === colId);
                                return column ? (
                                  <Badge key={colId} variant="outline" className="text-xs">
                                    {column.label}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <Download className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Selecione um período para visualizar seu relatório
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instruções de Uso</CardTitle>
              <CardDescription>
                Como utilizar os relatórios gerados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-medium mb-1">Para Relatórios em PDF</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Um arquivo HTML será gerado e baixado</li>
                    <li>Abra este arquivo em qualquer navegador</li>
                    <li>Use a opção "Imprimir" (Ctrl+P ou Cmd+P) para salvar como PDF</li>
                    <li>Selecione "Salvar como PDF" nas opções da impressora</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-base font-medium mb-1">Para Relatórios em Excel</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Um arquivo CSV será gerado e baixado</li>
                    <li>Abra o Microsoft Excel ou outro programa de planilhas</li>
                    <li>Use a opção "Abrir arquivo" e selecione o CSV baixado</li>
                    <li>Se necessário, confirme o formato de importação (delimitado por vírgulas)</li>
                  </ol>
                </div>
                <div>
                  <h3 className="text-base font-medium mb-1">Dicas para Relatórios</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                    <li>Use filtros por projetos, etiquetas e prioridades para relatórios mais precisos</li>
                    <li>Personalize as colunas para incluir apenas as informações relevantes para sua análise</li>
                    <li>Salve relatórios recorrentes nos favoritos para acesso rápido</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Recentes</CardTitle>
              <CardDescription>
                Seus relatórios gerados anteriormente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                {recentReports.length > 0 ? (
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="border-b bg-muted/50">
                        <tr className="text-left">
                          <th className="h-12 px-4 font-medium">Tipo</th>
                          <th className="h-12 px-4 font-medium">Formato</th>
                          <th className="h-12 px-4 font-medium">Data</th>
                          <th className="h-12 px-4 font-medium">Filtros</th>
                          <th className="h-12 px-4 font-medium text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentReports.map((report) => (
                          <tr key={report.id} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4">{reportTypes[report.type]}</td>
                            <td className="p-4">
                              {report.format === "pdf" ? (
                                <span className="flex items-center">
                                  <FilePdf className="h-4 w-4 mr-1" />
                                  PDF
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <FileSpreadsheet className="h-4 w-4 mr-1" />
                                  Excel
                                </span>
                              )}
                            </td>
                            <td className="p-4">{new Date(report.date).toLocaleString()}</td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {report.filters?.projectIds && report.filters.projectIds.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {report.filters.projectIds.length} {report.filters.projectIds.length === 1 ? 'projeto' : 'projetos'}
                                  </Badge>
                                )}
                                {report.filters?.labelIds && report.filters.labelIds.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {report.filters.labelIds.length} {report.filters.labelIds.length === 1 ? 'etiqueta' : 'etiquetas'}
                                  </Badge>
                                )}
                                {report.filters?.priorities && report.filters.priorities.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {report.filters.priorities.length} {report.filters.priorities.length === 1 ? 'prioridade' : 'prioridades'}
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1 h-8"
                                onClick={() => {
                                  // Aplicar todos os parâmetros do relatório salvo
                                  setReportType(report.type);
                                  setReportFormat(report.format);
                                  if (report.filters) {
                                    report.filters.projectIds && setSelectedProjects(report.filters.projectIds);
                                    report.filters.labelIds && setSelectedLabels(report.filters.labelIds);
                                    report.filters.priorities && setSelectedPriorities(report.filters.priorities);
                                    report.filters.customColumns && setCustomColumns(report.filters.customColumns);
                                  }
                                  // Mudar para a aba de geração
                                  document.querySelector('[data-state="inactive"][data-value="generate"]')?.click();
                                }}
                              >
                                <Sliders className="h-3.5 w-3.5" />
                                Usar Filtros
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="gap-1 h-8"
                                onClick={() => handleExport()}
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhum relatório gerado ainda
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 