"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import type { Project } from "@/lib/projects";
import { useTranslation } from "@/lib/i18n";

const formSchema = z
  .object({
    name: z.string().min(1, { message: "Project name is required" }),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, {
      message: "Color must be a valid hex code",
    }),
    is_favorite: z.boolean(),
  })
  .required();

type FormValues = {
  name: string;
  color: string;
  is_favorite: boolean;
};

interface ProjectFormProps {
  project?: Project;
  onSuccess?: (project: Project) => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      color: project?.color || "#808080",
      is_favorite: project?.is_favorite || false,
    },
  });

  const onSubmit = form.handleSubmit(async (values: FormValues) => {
    setIsLoading(true);

    try {
      const url = project ? `/api/projects/${project.id}` : "/api/projects";

      const method = project ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(project ? t("Failed to update project") : t("Failed to create project"));
      }

      const responseData = await response.json();

      toast({
        title: project ? t("Project updated") : t("Project created"),
        description: project ? t("Project has been updated successfully.") : t("Project has been created successfully."),
      });

      if (onSuccess) {
        onSuccess(responseData.project);
      }

      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: project ? t("Failed to update project") : t("Failed to create project"),
        description: error.message || t("Please try again."),
      });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="project-name">{t("Name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Project name")}
                  {...field}
                  id="project-name"
                  name="name"
                  aria-label={t("Project name")}
                />
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
              <FormLabel htmlFor="color-text">{t("Project Color")}</FormLabel>
              <FormControl>
                <div
                  className="flex items-center gap-2"
                  role="group"
                  aria-label={t("Color picker")}
                >
                  <div
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: field.value }}
                    aria-hidden="true"
                  />
                  <Input
                    type="color"
                    {...field}
                    className="w-12 p-1"
                    id="color-picker"
                    aria-label={t("Select color")}
                  />
                  <Input
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                    className="flex-1"
                    id="color-text"
                    name="color"
                    aria-label={t("Color value")}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_favorite"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="project-favorite"
                  name="is_favorite"
                  aria-label={t("Mark as favorite")}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor="project-favorite">
                  {t("Mark as favorite")}
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? t("Saving...")
            : project
              ? t("Update Project")
              : t("Create Project")}
        </Button>
      </form>
    </Form>
  );
}
