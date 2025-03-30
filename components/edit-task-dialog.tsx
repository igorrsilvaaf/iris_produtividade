"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon, Flag, Clock } from "lucide-react"
import { format } from "date-fns"
import type { Todo } from "@/lib/todos"
import { useTranslation } from "@/lib/i18n"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
  isAllDay: z.boolean().default(true),
  priority: z.string(),
  projectId: z.string().optional(),
})

interface EditTaskDialogProps {
  task: Todo
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      dueTime: task.due_date 
        ? new Date(task.due_date).getHours() === 0 && new Date(task.due_date).getMinutes() === 0
          ? "12:00" // Se for dia todo (00:00), define um horário padrão para o seletor
          : new Date(task.due_date).toTimeString().slice(0, 5)
        : "12:00",
      isAllDay: task.due_date 
        ? new Date(task.due_date).getHours() === 0 && new Date(task.due_date).getMinutes() === 0
        : true,
      priority: task.priority.toString(),
      projectId: "noProject", // Default sem projeto
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Prepare due date with time
      let dueDateWithTime = null;
      
      if (values.dueDate) {
        if (values.isAllDay) {
          // Para o dia todo, mantém só a data
          dueDateWithTime = values.dueDate.toISOString().split('T')[0] + 'T00:00:00Z';
        } else if (values.dueTime) {
          // Combina data e hora
          const date = new Date(values.dueDate);
          const [hours, minutes] = values.dueTime.split(':').map(Number);
          date.setHours(hours, minutes);
          dueDateWithTime = date.toISOString();
        }
      }

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description || null,
          dueDate: dueDateWithTime,
          priority: Number.parseInt(values.priority),
          projectId: values.projectId && values.projectId !== "noProject" ? Number.parseInt(values.projectId) : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      toast({
        title: t("taskUpdated"),
        description: t("Your task has been updated successfully."),
      })

      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to update task"),
        description: t("Please try again."),
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("editTask")}</DialogTitle>
          <DialogDescription>{t("Update your task details.")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("title")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Task title" {...field} />
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
                    <Textarea placeholder="Add details about your task" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("dueDate")}</FormLabel>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                            type="button"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value 
                              ? form.watch("isAllDay")
                                ? format(field.value, "PPP")
                                : `${format(field.value, "PPP")} ${form.watch("dueTime")}`
                              : <span>{t("pickDate")}</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start" side="bottom">
                        <div className="p-3">
                          <Calendar 
                            mode="single" 
                            selected={field.value} 
                            onSelect={(date) => {
                              field.onChange(date);
                            }}
                            initialFocus 
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          />
                          <div className="pt-3 pb-2 border-t mt-3">
                            <FormField
                              control={form.control}
                              name="isAllDay"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 h-9">
                                  <FormControl>
                                    <Checkbox
                                      id="editTaskAllDay"
                                      checked={field.value}
                                      onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        // Força uma re-renderização para dispositivos iOS
                                        if (typeof window !== 'undefined') {
                                          setTimeout(() => {
                                            form.trigger("dueTime");
                                          }, 0);
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer" htmlFor="editTaskAllDay">
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
                              <FormItem className={`mt-2 ${form.watch("isAllDay") ? "hidden" : ""}`}>
                                <div className="flex items-center">
                                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <FormControl>
                                    <Input 
                                      type="time" 
                                      value={field.value || "12:00"}
                                      onChange={(e) => field.onChange(e.target.value || "12:00")}
                                      className="w-full"
                                      inputMode="none"
                                      onClick={(e) => {
                                        const target = e.target as HTMLInputElement;
                                        target.focus();
                                        if (typeof window !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
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
                          <Button 
                            className="w-full mt-3" 
                            type="button"
                            onClick={() => {
                              // Feche o popover usando o estado
                              setDatePickerOpen(false);
                            }}
                          >
                            {t("confirm")}
                          </Button>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            </div>
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("project")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectProject")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="noProject">{t("noProject")}</SelectItem>
                      <SelectItem value="1">{t("Personal")}</SelectItem>
                      <SelectItem value="2">{t("Work")}</SelectItem>
                      <SelectItem value="3">{t("Shopping")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{t("update")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

