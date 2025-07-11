"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/lib/i18n"

const formSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, {
    message: "Color must be a valid hex code",
  }),
})

export function AddProjectDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#808080",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to create project")
      }

      toast({
        title: t("projectCreated"),
        description: t("Your project has been created successfully."),
      })

      form.reset()
      setOpen(false)
      
      setTimeout(() => {
        router.refresh()
      }, 300);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("Failed to create project"),
        description: t("Please try again."),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        form.reset();
      }
      setOpen(newOpen);
    }}>
      <DialogTrigger asChild data-testid="add-project-dialog-trigger">{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" data-testid="add-project-dialog-content">
        <DialogHeader>
          <DialogTitle data-testid="add-project-dialog-title">{t("addProject")}</DialogTitle>
          <DialogDescription data-testid="add-project-dialog-description">{t("createNewProject")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="add-project-form">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input data-testid="add-project-name-input" placeholder={t("projectName")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("color")}</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2" data-testid="add-project-color-picker">
                      <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: field.value }} />
                      <Input data-testid="add-project-color-input" type="color" {...field} className="w-12 p-1" />
                      <Input data-testid="add-project-color-text-input" type="text" value={field.value} onChange={field.onChange} className="flex-1" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} data-testid="add-project-submit-button">
                {isSubmitting ? t("creating") : t("createProject")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

