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

const formSchema = z.object({
  name: z.string().min(1, { message: "Project name is required" }),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, {
    message: "Color must be a valid hex code",
  }),
  is_favorite: z.boolean().default(false),
});

interface ProjectFormProps {
  project?: Project;
  onSuccess?: (project: Project) => void;
}

export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      color: project?.color || "#808080",
      is_favorite: project?.is_favorite || false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
        throw new Error(`Failed to ${project ? "update" : "create"} project`);
      }

      const responseData = await response.json();

      toast({
        title: project ? "Project updated" : "Project created",
        description: `Project has been ${project ? "updated" : "created"} successfully.`,
      });

      if (onSuccess) {
        onSuccess(responseData.project);
      }

      router.refresh();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: project
          ? "Failed to update project"
          : "Failed to create project",
        description: error.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Project name" {...field} />
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
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: field.value }}
                  />
                  <Input type="color" {...field} className="w-12 p-1" />
                  <Input
                    type="text"
                    value={field.value}
                    onChange={field.onChange}
                    className="flex-1"
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
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Mark as favorite</FormLabel>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : project
              ? "Update Project"
              : "Create Project"}
        </Button>
      </form>
    </Form>
  );
}
