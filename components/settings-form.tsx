"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useTheme } from "next-themes"
import type { UserSettings } from "@/lib/settings"
import { useTranslation } from "@/lib/i18n"
import { useAudioPlayer } from "@/lib/audio-utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  theme: z.string(),
  language: z.enum(["en", "pt"]),
  pomodoro_work_minutes: z.coerce.number().min(1).max(60),
  pomodoro_break_minutes: z.coerce.number().min(1).max(30),
  pomodoro_long_break_minutes: z.coerce.number().min(1).max(60),
  pomodoro_cycles: z.coerce.number().min(1).max(10),
  enable_sound: z.boolean().default(true),
  notification_sound: z.string(),
  enable_desktop_notifications: z.boolean().default(true),
})

export function SettingsForm({ settings }: { settings: UserSettings }) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { toast } = useToast()
  const { t, language, setLanguage } = useTranslation()
  const { playSound } = useAudioPlayer()
  const [isLoading, setIsLoading] = useState(false)

  // Sincronizar o idioma do formulário com o idioma atual
  useEffect(() => {
    if (settings.language && (settings.language === "en" || settings.language === "pt")) {
      setLanguage(settings.language as "en" | "pt")
    }
  }, [settings.language, setLanguage])

  // Função para definir cookie diretamente
  function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`
  }
  
  // Função para limpar um cookie
  function clearCookie(name: string) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: settings.theme,
      language: (settings.language as "en" | "pt") || language,
      pomodoro_work_minutes: settings.pomodoro_work_minutes,
      pomodoro_break_minutes: settings.pomodoro_break_minutes,
      pomodoro_long_break_minutes: settings.pomodoro_long_break_minutes,
      pomodoro_cycles: settings.pomodoro_cycles,
      enable_sound: settings.enable_sound,
      notification_sound: settings.notification_sound || "default",
      enable_desktop_notifications: settings.enable_desktop_notifications,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      console.log("Atualizando configurações:", values);
      
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro ao atualizar configurações:", errorData);
        throw new Error("Failed to update settings");
      }

      const result = await response.json();
      console.log("Configurações atualizadas com sucesso:", result);

      // Update theme if changed
      if (values.theme !== settings.theme) {
        setTheme(values.theme)
      }

      // Update language if changed
      if (values.language !== language) {
        console.log(`Alterando idioma de ${language} para ${values.language}`);
        
        // Atualizar o idioma na store do Zustand
        setLanguage(values.language)
        
        // Limpar cookies antigos de idioma
        clearCookie("language-storage")
        
        // Definir o novo cookie de idioma com opções mais seguras
        document.cookie = `user-language=${values.language}; path=/; max-age=31536000; SameSite=Strict`;
        
        console.log("Cookies de idioma atualizados:");
        console.log(document.cookie.split(';').filter(c => c.trim().startsWith('user-language') || c.trim().startsWith('language-storage')));
        
        // Atualizar o atributo lang no documento HTML
        document.documentElement.lang = values.language === 'en' ? 'en' : 'pt-BR';
      }

      // Tocar um som de sucesso se os sons estiverem habilitados
      if (values.enable_sound) {
        playSound('success');
      }

      // Mostrar notificação de sucesso
      toast({
        title: t("Settings updated"),
        description: t("Your settings have been updated successfully."),
        variant: "success",
        duration: 5000,
        position: "top-right"
      })

      // Forçar um refresh para garantir que todas as alterações sejam aplicadas
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast({
        variant: "destructive",
        title: t("Failed to update settings"),
        description: t("Please try again."),
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Request notification permission if enabled
  const requestNotificationPermission = async () => {
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        toast({
          variant: "destructive",
          title: t("Notification permission denied"),
          description: t("Desktop notifications will not be shown."),
        })
        form.setValue("enable_desktop_notifications", false)
      }
    }
  }

  return (
    <Tabs defaultValue="general">
      <TabsList className="mb-4">
        <TabsTrigger value="general">{t("general")}</TabsTrigger>
        <TabsTrigger value="pomodoro">{t("pomodoroTimer")}</TabsTrigger>
        <TabsTrigger value="notifications">{t("notifications")}</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>{t("general")}</CardTitle>
                <CardDescription>{t("Manage your application preferences.")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("theme")}</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          setTheme(value)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a theme")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">{t("light")}</SelectItem>
                          <SelectItem value="dark">{t("dark")}</SelectItem>
                          <SelectItem value="system">{t("system")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>{t("Choose your preferred theme for the application.")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("language")}</FormLabel>
                      <Select
                        onValueChange={(value: "en" | "pt") => {
                          field.onChange(value)
                          setLanguage(value)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a language")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">{t("english")}</SelectItem>
                          <SelectItem value="pt">{t("portuguese")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>{t("Choose your preferred language for the application.")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? t("Salvando...") : t("save")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pomodoro">
            <Card>
              <CardHeader>
                <CardTitle>{t("pomodoroTimer")}</CardTitle>
                <CardDescription>{t("Customize your Pomodoro timer preferences.")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="pomodoro_work_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Work Duration (minutes)")}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pomodoro_break_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Short Break Duration (minutes)")}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pomodoro_long_break_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Long Break Duration (minutes)")}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pomodoro_cycles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Long Break Interval (cycles)")}</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="enable_sound"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t("soundNotifications")}</FormLabel>
                        <FormDescription>{t("soundDescription")}</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("enable_sound") && (
                  <FormField
                    control={form.control}
                    name="notification_sound"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("notificationSound")}</FormLabel>
                        <div className="flex items-center gap-2">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t("Select a sound")} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="default">{t("defaultSound")}</SelectItem>
                              <SelectItem value="bell">{t("bell")}</SelectItem>
                              <SelectItem value="chime">{t("chime")}</SelectItem>
                              <SelectItem value="digital">{t("digital")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="outline" size="icon" onClick={() => playSound(field.value)}>
                            <span className="sr-only">{t("Play sound")}</span>
                            ▶️
                          </Button>
                        </div>
                        <FormDescription>{t("chooseSound")}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? t("Salvando...") : t("save")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t("notifications")}</CardTitle>
                <CardDescription>{t("Manage how you receive notifications.")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="enable_desktop_notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">{t("desktopNotifications")}</FormLabel>
                        <FormDescription>{t("desktopNotificationsDescription")}</FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            if (checked) {
                              requestNotificationPermission()
                            }
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? t("Salvando...") : t("save")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Form>
    </Tabs>
  )
}

