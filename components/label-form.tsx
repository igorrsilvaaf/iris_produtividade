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
import { useToast } from "@/components/ui/use-toast";
import type { Label } from "@/lib/labels";
import { useTranslation } from "@/lib/i18n";
import { useProjectsLabelsUpdates } from "@/hooks/use-projects-labels-updates";

interface LabelFormProps {
  label?: Label;
  onSuccess?: (label: Label) => void;
}

export function LabelForm({ label, onSuccess }: LabelFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { notifyLabelCreated, notifyLabelUpdated } = useProjectsLabelsUpdates();

  const formSchema = z.object({
    name: z.string().min(1, { message: t("Label name is required") }),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, {
      message: t("Color must be a valid hex code"),
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: label?.name || "",
      color: label?.color || "#808080",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const url = label ? `/api/labels/${label.id}` : "/api/labels";

      const method = label ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(
          t(label ? "Failed to update label" : "Failed to create label"),
        );
      }

      const responseData = await response.json();

      toast({
        title: t(label ? "Label updated" : "Label created"),
        description: t(
          label
            ? "Label has been updated successfully."
            : "Label has been created successfully.",
        ),
      });

      // Atualizar contexto global
      if (label) {
        notifyLabelUpdated(label.id, responseData.label);
      } else {
        notifyLabelCreated(responseData.label);
      }

      if (onSuccess) {
        onSuccess(responseData.label);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t(label ? "Failed to update label" : "Failed to create label"),
        description: error.message || t("Please try again."),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="label-form">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Name")}</FormLabel>
              <FormControl>
                <Input data-testid="label-name-input" placeholder={t("Label name")} {...field} />
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
              <FormLabel>{t("Color")}</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2" data-testid="label-color-picker">
                  <div
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: field.value }}
                  />
                  <Input data-testid="label-color-input" type="color" {...field} className="w-12 p-1" />
                  <Input
                    data-testid="label-color-text-input"
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
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} data-testid="label-submit-button">
            {isLoading
              ? t("Salvando...")
              : label
                ? t("Update Label")
                : t("Create Label")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
