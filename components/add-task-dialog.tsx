"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import * as z from "zod";
import {
  CalendarIcon,
  Flag,
  Tag,
  X,
  Clock,
  Plus,
  PlusCircle,
  CircleAlert,
  CircleDot,
  ChevronDown,
  Check,
  Paperclip,
  Timer,
  Link,
  Image,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import type { Project } from "@/lib/projects";
import type { Label } from "@/lib/labels";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/lib/i18n";

type AttachmentType = "link" | "file" | "image";

interface Attachment {
  type: string;
  url: string;
  name: string;
}

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { LabelForm } from "@/components/label-form";
import { ProjectForm } from "@/components/project-form";
import { BackButton } from "@/components/ui/back-button";
import { useTaskUpdates } from "@/hooks/use-task-updates";
import { useProjectsLabelsUpdates } from "@/hooks/use-projects-labels-updates";
import { RichTextEditor } from "@/components/rich-text-editor";

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
  isAllDay: z.boolean().default(true),
  priority: z.string().default("4"),
  projectId: z.string().optional(),
  labelIds: z.array(z.number()).default([]),
  points: z.number().min(1).max(5).default(3),
  attachments: z
    .array(
      z.object({
        type: z.string(),
        url: z.string(),
        name: z.string(),
      }),
    )
    .default([]),
  estimatedTime: z.number().nullable().default(null),
  estimatedTimeUnit: z.string().default("min"),
  kanban_column: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTaskDialogProps {
  children: React.ReactNode;
  initialProjectId?: number;
  initialLanguage: string;
  initialColumn?: string;
}

export function AddTaskDialog({
  children,
  initialProjectId,
  initialLanguage,
  initialColumn,
}: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<Label[]>([]);
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t, setLanguage } = useTranslation();
  const { notifyTaskCreated } = useTaskUpdates();
  const { projects, labels, loading: projectsLabelsLoading, notifyProjectCreated, notifyLabelCreated } = useProjectsLabelsUpdates();
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentType, setAttachmentType] = useState<AttachmentType>("link");
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const fileUploadRef = useRef<HTMLInputElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialLanguage) {
      setLanguage(initialLanguage as "en" | "pt");
    }
  }, [initialLanguage, setLanguage]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      title: "",
      description: "",
      dueDate: undefined,
      dueTime: "12:00",
      isAllDay: true,
      priority: "4",
      projectId: initialProjectId ? initialProjectId.toString() : undefined,
      labelIds: [],
      points: 3,
      attachments: [],
      estimatedTime: null,
      estimatedTimeUnit: "min",
      kanban_column: initialColumn || undefined,
    },
  });



  const toggleLabel = (label: Label) => {
    const labelIds = form.getValues("labelIds") || [];

    if (labelIds.includes(label.id)) {
      const updatedLabelIds = labelIds.filter((id) => id !== label.id);
      form.setValue("labelIds", updatedLabelIds);
      setSelectedLabels(selectedLabels.filter((l) => l.id !== label.id));
    } else {
      form.setValue("labelIds", [...labelIds, label.id]);
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const removeLabel = (labelId: number) => {
    const labelIds = form.getValues("labelIds") || [];
    const updatedLabelIds = labelIds.filter((id) => id !== labelId);
    form.setValue("labelIds", updatedLabelIds);
    setSelectedLabels(selectedLabels.filter((l) => l.id !== labelId));
  };

  const handleCreateLabelSuccess = async (newLabel: Label) => {
    setShowCreateLabel(false);
    
    // Atualizar contexto global
    notifyLabelCreated(newLabel);

    // Auto-selecionar o label criado no contexto de task
    if (newLabel) {
      const currentLabelIds = form.getValues("labelIds") || [];
      form.setValue("labelIds", [...currentLabelIds, newLabel.id], {
        shouldValidate: true,
        shouldDirty: true,
      });
      setSelectedLabels((prev) => [...prev, newLabel]);
    }
  };

  const handleCreateProjectSuccess = async (newProject: Project) => {
    setShowCreateProject(false);
    
    // Atualizar contexto global
    notifyProjectCreated(newProject);

    // Auto-selecionar o projeto criado no contexto de task
    if (newProject) {
      form.setValue("projectId", newProject.id.toString(), {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }

    setShowAddProject(false);

    setTimeout(() => {
      form.trigger("projectId");
    }, 100);
  };

  const addAttachment = () => {
    if (!attachmentUrl.trim()) return;

    const newAttachment = {
      type: attachmentType,
      url: attachmentUrl.trim(),
      name: attachmentName.trim() || attachmentUrl.trim(),
    };

    const currentAttachments = form.getValues("attachments") || [];
    form.setValue("attachments", [...currentAttachments, newAttachment]);
    setAttachments([...attachments, newAttachment]);
    setAttachmentUrl("");
    setAttachmentName("");
    setShowAddAttachment(false);
  };

  const removeAttachment = (index: number) => {
    const currentAttachments = [...attachments];
    currentAttachments.splice(index, 1);
    setAttachments(currentAttachments);
    form.setValue("attachments", currentAttachments);
  };

  const convertTimeToMinutes = (
    timeValue: number | null,
    unit: string,
  ): number | null => {
    if (timeValue === null) return null;

    switch (unit) {
      case "h":
        return timeValue * 60;
      case "d":
        return timeValue * 60 * 8; // considerando 8 horas por dia
      default:
        return timeValue;
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    event.preventDefault();
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: t("Arquivo muito grande"),
        description: t("O tamanho máximo permitido é 5MB"),
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      const newAttachment = {
        type: attachmentType,
        url: data.url,
        name: file.name,
      };

      const currentAttachments = [...attachments];
      const updatedAttachments = [...currentAttachments, newAttachment];

      setAttachments(updatedAttachments);
      form.setValue("attachments", updatedAttachments, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setShowAddAttachment(false);

      // Limpar o input de arquivo
      if (event.target) {
        event.target.value = "";
      }

      toast({
        title: t("Attachment added"),
        description: t("Your attachment has been added successfully."),
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: t("Failed to upload file"),
        description: t("Please try again."),
      });
    }
  };

  const triggerFileUpload = () => {
    if (attachmentType === "image") {
      imageUploadRef.current?.click();
    } else if (attachmentType === "file") {
      fileUploadRef.current?.click();
    }
  };

  const onSubmit = async (values: FormValues): Promise<void> => {
    if (!values.title.trim()) {
      toast({
        variant: "destructive",
        title: t("Título obrigatório"),
        description: t("Por favor, insira um título para a tarefa."),
      });
      return;
    }

    setIsLoading(true);
    try {
      let dueDateTime: string | null = null;

      if (values.dueDate) {
        const date = new Date(values.dueDate);

        if (isNaN(date.getTime())) {
          toast({
            variant: "destructive",
            title: t("Data inválida"),
            description: t("Por favor, selecione uma data válida."),
          });
          return;
        }



        if (values.isAllDay) {
          date.setHours(0, 0, 0, 0);
          dueDateTime = date.toISOString();

        } else if (values.dueTime) {
          const [hours, minutes] = values.dueTime.split(":").map(Number);

          if (isNaN(hours) || isNaN(minutes)) {
            console.error(
              `[AddTask] Formato de hora inválido: ${values.dueTime}`,
            );
            toast({
              variant: "destructive",
              title: t("Formato de hora inválido"),
              description: t("Por favor, use o formato HH:MM."),
            });
            setIsLoading(false);
            return;
          }

          date.setHours(hours, minutes, 0, 0);
          dueDateTime = date.toISOString();


        }
      }

      // Converter tempo estimado para minutos
      const estimatedTimeInMinutes = convertTimeToMinutes(
        values.estimatedTime,
        values.estimatedTimeUnit,
      );

      // Garantir que os anexos sejam enviados corretamente
      const formattedAttachments = attachments.map((attachment) => ({
        type: attachment.type,
        url: attachment.url,
        name: attachment.name,
      }));



      const taskData = {
        title: values.title,
        description: values.description || null,
        due_date: dueDateTime,
        priority: Number.parseInt(values.priority),
        project_id:
          values.projectId && values.projectId !== "noProject"
            ? Number.parseInt(values.projectId)
            : null,
        kanban_column: initialColumn || null,
        completed: initialColumn === "completed",
        points: values.points,
        attachments: formattedAttachments,
        estimated_time: estimatedTimeInMinutes,
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      const responseData = await response.json();
      const taskId = responseData.task.id;
      const labelIds = values.labelIds || [];

      if (labelIds.length > 0) {
        await Promise.all(
          labelIds.map(async (labelId) => {
            const labelResponse = await fetch(`/api/tasks/${taskId}/${taskId}/labels`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ labelId }),
            });

            if (!labelResponse.ok) {
              throw new Error(`Falha ao adicionar etiqueta ${labelId}`);
            }
          }),
        );
      }

      // Atualizar a interface com os dados da tarefa criada, incluindo os anexos
      if (responseData.task) {
        setOpen(false);
        toast({
          title: t("Task created"),
          description: t("Your task has been created successfully."),
        });
        
        // Notificar sobre a criação da task para atualização dinâmica
        notifyTaskCreated(responseData.task);
      }

      form.reset();
      setSelectedLabels([]);
    } catch (error) {
      console.error("[AddTaskDialog] Erro detalhado:", error);
      toast({
        variant: "destructive",
        title: t("Failed to create task"),
        description: t("Please try again."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild data-testid="add-task-dialog-trigger">{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" data-testid="add-task-dialog-content">
        <DialogHeader>
          <div className="flex items-center">
            <div className="md:hidden">
              <BackButton onClick={() => setOpen(false)} className="mr-2" data-testid="add-task-back-button" />
            </div>
            <DialogTitle data-testid="add-task-dialog-title">{t("addTask")}</DialogTitle>
          </div>
          <DialogDescription data-testid="add-task-dialog-description">
            {t("Create a new task to keep track of your work.")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-6"
            data-testid="add-task-form"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("title")}</FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="add-task-title-input"
                      placeholder={t("Task title")}
                      className="min-h-[80px] text-base"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={(value) => {
                        field.onChange(value);
                        form.setValue('description', value);
                      }}
                      placeholder={t("Add details about your task")}
                      disabled={isLoading}
                      minHeight="200px"
                      className="w-full"
                      showActions={false}
                      dataTestid="add-task-description-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("dueDate")}</FormLabel>
                    <Popover
                      open={datePickerOpen}
                      onOpenChange={setDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            data-testid="add-task-due-date-button"
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              form.watch("isAllDay") ? (
                                format(field.value, "PPP")
                              ) : (
                                `${format(field.value, "PPP")} - ${form.watch("dueTime") || "12:00"}`
                              )
                            ) : (
                              <span>{t("pickDate")}</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0"
                        align="start"
                        side="bottom"
                        data-testid="add-task-date-picker"
                      >
                        <div className="p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              {t("pickDate")}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 rounded-full"
                              onClick={() => setDatePickerOpen(false)}
                              data-testid="add-task-date-picker-close"
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">{t("close")}</span>
                            </Button>
                          </div>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date);
                                setTimeout(() => setDatePickerOpen(false), 100);
                              }
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            data-testid="add-task-calendar"
                          />
                          <div className="pt-3 pb-2 border-t mt-3">
                            <FormField
                              control={form.control}
                              name="isAllDay"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 h-9">
                                  <FormControl>
                                    <Checkbox
                                      data-testid="add-task-all-day-checkbox"
                                      id="isAllDay"
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        if (checked) {
                                          form.setValue("dueTime", "00:00");
                                        } else {
                                          form.setValue("dueTime", "12:00");
                                        }
                                        if (typeof window !== "undefined") {
                                          setTimeout(() => {
                                            form.trigger("dueTime");
                                          }, 0);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel
                                    className="text-sm font-normal cursor-pointer"
                                    htmlFor="isAllDay"
                                  >
                                    {t("allDay")}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="dueTime"
                            render={({ field }) => (
                              <FormItem
                                className={`mt-2 ${form.watch("isAllDay") ? "hidden" : ""}`}
                              >
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <FormControl>
                                    <Input
                                      data-testid="add-task-due-time-input"
                                      type="time"
                                      value={field.value || "12:00"}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value || "12:00",
                                        )
                                      }
                                      className="w-full"
                                      inputMode="text"
                                      pattern="[0-9]{2}:[0-9]{2}"
                                      placeholder="HH:MM"
                                      onClick={(e) => {
                                        const target =
                                          e.target as HTMLInputElement;
                                        target.focus();
                                        if (
                                          typeof window !== "undefined" &&
                                          /iPhone|iPad|iPod/.test(
                                            navigator.userAgent,
                                          )
                                        ) {
                                          setTimeout(() => {
                                            target.click();
                                          }, 100);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("priority")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select priority")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">
                          <div className="flex items-center">
                            <Flag className="mr-2 h-4 w-4 text-red-500" />
                            {t("priority1")}
                          </div>
                        </SelectItem>
                        <SelectItem value="2">
                          <div className="flex items-center">
                            <Flag className="mr-2 h-4 w-4 text-orange-500" />
                            {t("priority2")}
                          </div>
                        </SelectItem>
                        <SelectItem value="3">
                          <div className="flex items-center">
                            <Flag className="mr-2 h-4 w-4 text-blue-500" />
                            {t("priority3")}
                          </div>
                        </SelectItem>
                        <SelectItem value="4">
                          <div className="flex items-center">
                            <Flag className="mr-2 h-4 w-4 text-gray-400" />
                            {t("priority4")}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("points") || "Pontos"}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between text-left font-normal"
                          type="button"
                        >
                          <div className="flex items-center">
                            <CircleDot
                              className={`mr-2 h-4 w-4 ${
                                field.value === 1
                                  ? "text-green-500"
                                  : field.value === 2
                                    ? "text-blue-500"
                                    : field.value === 3
                                      ? "text-yellow-500"
                                      : field.value === 4
                                        ? "text-orange-500"
                                        : field.value === 5
                                          ? "text-red-500"
                                          : "text-muted-foreground"
                              }`}
                            />
                            <span>
                              {field.value} -{" "}
                              {field.value === 1
                                ? t("veryEasy") || "Muito fácil"
                                : field.value === 2
                                  ? t("easy") || "Fácil"
                                  : field.value === 3
                                    ? t("medium") || "Médio"
                                    : field.value === 4
                                      ? t("hard") || "Difícil"
                                      : field.value === 5
                                        ? t("veryHard") || "Muito difícil"
                                        : t("Select points") ||
                                          "Selecione os pontos"}
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <div
                              key={value}
                              className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                              onClick={() => field.onChange(value)}
                            >
                              {field.value === value && (
                                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                  <Check className="h-4 w-4" />
                                </span>
                              )}
                              <div className="flex items-center">
                                <CircleDot
                                  className={`mr-2 h-4 w-4 ${
                                    value === 1
                                      ? "text-green-500"
                                      : value === 2
                                        ? "text-blue-500"
                                        : value === 3
                                          ? "text-yellow-500"
                                          : value === 4
                                            ? "text-orange-500"
                                            : value === 5
                                              ? "text-red-500"
                                              : "text-muted-foreground"
                                  }`}
                                />
                                {value} -{" "}
                                {value === 1
                                  ? t("veryEasy") || "Muito fácil"
                                  : value === 2
                                    ? t("easy") || "Fácil"
                                    : value === 3
                                      ? t("medium") || "Médio"
                                      : value === 4
                                        ? t("hard") || "Difícil"
                                        : value === 5
                                          ? t("veryHard") || "Muito difícil"
                                          : ""}
                              </div>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estimated Time Field */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="estimatedTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <div className="flex items-center space-x-2">
                            <Timer className="h-4 w-4" />
                            <span>{t("task.estimatedTime")}</span>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder={t("task.timeValue")}
                            {...field}
                            value={field.value === null ? "" : field.value}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="w-24">
                  <FormField
                    control={form.control}
                    name="estimatedTimeUnit"
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("task.timeUnit")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="min">
                              {t("timeUnit.minutes")}
                            </SelectItem>
                            <SelectItem value="h">
                              {t("timeUnit.hours")}
                            </SelectItem>
                            <SelectItem value="d">
                              {t("timeUnit.days")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("project")}</FormLabel>
                  <div className="space-y-2">
                    {field.value && field.value !== "noProject" ? (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded-full mr-2`}
                            style={{
                              backgroundColor:
                                projects.find(
                                  (p) => p.id.toString() === field.value,
                                )?.color || "#ccc",
                            }}
                          />
                          <span>
                            {projects.find(
                              (p) => p.id.toString() === field.value,
                            )?.name || t("Unknown project")}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => field.onChange("noProject")}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">{t("Remove project")}</span>
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">
                        {t("noProject")}
                      </p>
                    )}
                    <Dialog
                      open={showAddProject}
                      onOpenChange={setShowAddProject}
                    >
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          {t("Add Project")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="z-[60]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DialogHeader>
                          <DialogTitle>{t("Add Project")}</DialogTitle>
                          <DialogDescription>
                            {t("Select a project or create a new one.")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-4">
                          {projectsLabelsLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            </div>
                          ) : projects.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              {t("No projects found.")}
                            </p>
                          ) : (
                            projects.map((project) => (
                              <button
                                key={project.id}
                                type="button"
                                className="flex items-center justify-between p-2 border rounded hover:bg-accent"
                                onClick={() => {
                                  field.onChange(project.id.toString());
                                  setShowAddProject(false);
                                }}
                              >
                                <div className="flex items-center">
                                  <div
                                    className="w-4 h-4 rounded-full mr-2"
                                    style={{ backgroundColor: project.color }}
                                  />
                                  <span>{project.name}</span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                        <div className="mt-4 border-t pt-4 flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => setShowAddProject(false)}
                          >
                            {t("Cancel")}
                          </Button>
                          <Dialog
                            open={showCreateProject}
                            onOpenChange={setShowCreateProject}
                          >
                            <DialogTrigger asChild>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCreateProject(true);
                                }}
                              >
                                {t("Create New Project")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent
                              className="z-[70]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DialogHeader>
                                <DialogTitle>
                                  {t("Create New Project")}
                                </DialogTitle>
                                <DialogDescription>
                                  {t(
                                    "Fill in the details to create a new project.",
                                  )}
                                </DialogDescription>
                              </DialogHeader>
                              <ProjectForm
                                onSuccess={handleCreateProjectSuccess}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="labelIds"
              render={() => (
                <FormItem>
                  <FormLabel>{t("Labels")}</FormLabel>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 min-h-[36px] p-1">
                      {selectedLabels.map((label, index) => (
                        <div
                          key={label.id}
                          className="flex items-center mt-1 space-x-2"
                        >
                          <div
                            className="flex items-center justify-between px-3 py-1 rounded-md"
                            style={{
                              backgroundColor: label.color,
                              color: "#ffffff",
                            }}
                          >
                            <Tag className="h-3 w-3" />
                            {label.name}
                            <button
                              type="button"
                              onClick={() => removeLabel(label.id)}
                              className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                              aria-label={`Remove ${label.name} label`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {selectedLabels.length === 0 && (
                        <span className="text-sm text-muted-foreground">
                          {t("No labels selected")}
                        </span>
                      )}
                    </div>
                    <Dialog open={showAddLabel} onOpenChange={setShowAddLabel}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          id="addLabelBtn"
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          {t("Add Label")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="z-[60]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DialogHeader>
                          <DialogTitle>{t("Add Label")}</DialogTitle>
                          <DialogDescription>
                            {t("Select a label to add to this task.")}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 py-4">
                          {projectsLabelsLoading ? (
                            <div className="flex items-center justify-center p-4">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            </div>
                          ) : labels.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              {t("No labels found.")}
                            </p>
                          ) : (
                            labels
                              .filter(
                                (label) =>
                                  !selectedLabels.some(
                                    (l) => l.id === label.id,
                                  ),
                              )
                              .map((label) => (
                                <button
                                  key={label.id}
                                  type="button"
                                  className="flex items-center justify-between p-2 border rounded hover:bg-accent"
                                  onClick={() => {
                                    toggleLabel(label);
                                    setShowAddLabel(false);
                                  }}
                                >
                                  <div className="flex items-center">
                                    <div
                                      className={`w-4 h-4 rounded-full mr-2`}
                                      style={{ backgroundColor: label.color }}
                                    />
                                    <span>{label.name}</span>
                                  </div>
                                </button>
                              ))
                          )}
                        </div>
                        <div className="mt-4 border-t pt-4 flex justify-between">
                          <Button
                            variant="outline"
                            onClick={() => setShowAddLabel(false)}
                          >
                            {t("Cancel")}
                          </Button>
                          <Dialog
                            open={showCreateLabel}
                            onOpenChange={setShowCreateLabel}
                          >
                            <DialogTrigger asChild>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowCreateLabel(true);
                                }}
                              >
                                {t("Create New Label")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent
                              className="z-[70]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DialogHeader>
                                <DialogTitle>
                                  {t("Create New Label")}
                                </DialogTitle>
                                <DialogDescription>
                                  {t(
                                    "Fill in the details to create a new label.",
                                  )}
                                </DialogDescription>
                              </DialogHeader>
                              <LabelForm onSuccess={handleCreateLabelSuccess} />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachments Field */}
            <div className="space-y-2 mt-4">
              <FormLabel>
                <div className="flex items-center space-x-2">
                  <Paperclip className="h-4 w-4" />
                  <span>{t("attachment.list")}</span>
                </div>
              </FormLabel>

              {/* List of attachments */}
              {attachments.length > 0 && (
                <div className="space-y-2 mb-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-secondary/50 rounded-md"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {attachment.type === "link" && (
                          <Link className="h-4 w-4" />
                        )}
                        {attachment.type === "image" && (
                          <Image className="h-4 w-4" />
                        )}
                        {attachment.type === "file" && (
                          <FileText className="h-4 w-4" />
                        )}
                        <span className="truncate">{attachment.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add attachment interface */}
              {showAddAttachment ? (
                <div className="space-y-2 border rounded-md p-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={
                        attachmentType === "link" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setAttachmentType("link")}
                      className="w-full"
                    >
                      Link
                    </Button>
                    <Button
                      type="button"
                      variant={
                        attachmentType === "image" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setAttachmentType("image")}
                      className="w-full"
                    >
                      Imagem
                    </Button>
                    <Button
                      type="button"
                      variant={
                        attachmentType === "file" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setAttachmentType("file")}
                      className="w-full"
                    >
                      Arquivo
                    </Button>
                  </div>

                  {attachmentType === "link" ? (
                    <>
                      <Input
                        placeholder="URL"
                        value={attachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                      />

                      <Input
                        placeholder="Nome (opcional)"
                        value={attachmentName}
                        onChange={(e) => setAttachmentName(e.target.value)}
                      />

                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          onClick={addAttachment}
                          disabled={!attachmentUrl.trim()}
                          size="sm"
                        >
                          Adicionar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowAddAttachment(false);
                            setAttachmentUrl("");
                            setAttachmentName("");
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept={attachmentType === "image" ? "image/*" : "*/*"}
                        className="hidden"
                        onChange={handleFileUpload}
                        ref={
                          attachmentType === "image"
                            ? imageUploadRef
                            : fileUploadRef
                        }
                        aria-label={
                          attachmentType === "image"
                            ? "Upload de imagem"
                            : "Upload de arquivo"
                        }
                        title={
                          attachmentType === "image"
                            ? "Upload de imagem"
                            : "Upload de arquivo"
                        }
                      />
                      <Button
                        type="button"
                        onClick={triggerFileUpload}
                        className="w-full"
                        size="sm"
                      >
                        {attachmentType === "image"
                          ? "Selecionar Imagem"
                          : "Selecionar Arquivo"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddAttachment(false)}
                        className="w-full"
                      >
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddAttachment(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("attachment.add")}
                </Button>
              )}
            </div>

            <DialogFooter className="pt-2 sm:pt-0">
              <Button type="submit" className="ml-auto" disabled={isLoading}>
                {isLoading ? t("creating") : t("createTask")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
