"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useTheme } from "next-themes"
import type { UserSettings } from "@/lib/settings"
import { useTranslation } from "@/lib/i18n"
import { useAudioPlayer } from "@/lib/audio-utils"
import { useSpotifyStore } from "@/lib/stores/spotify-store"

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
  pomodoro_sound: z.string().default("pomodoro"),
  enable_desktop_notifications: z.boolean().default(true),
  enable_task_notifications: z.boolean().default(true),
  task_notification_days: z.coerce
    .number()
    .min(1, { message: "Deve ser no mínimo 1 dia" })
    .max(14, { message: "Deve ser no máximo 14 dias" })
    .int({ message: "Deve ser um número inteiro" })
    .default(3)
    .transform(val => {
      const parsed = parseInt(String(val), 10);
      return isNaN(parsed) ? 3 : parsed;
    }),
  enable_spotify: z.boolean().default(false),
  spotify_playlist_url: z.string().optional(),
  enable_flip_clock: z.boolean().default(true),
  flip_clock_size: z.string().default("medium"),
  flip_clock_color: z.string().default("#ff5722"),
})

interface SettingsFormProps {
  settings: UserSettings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { toast } = useToast()
  const { t, language, setLanguage } = useTranslation()
  const { playSound } = useAudioPlayer()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { playlistId, setPlaylistId, setContentType, isEnabled, setIsEnabled } = useSpotifyStore()
  const [playlistUrl, setPlaylistUrl] = useState(settings.spotify_playlist_url || '')
  
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'general';
  const [activeTab, setActiveTab] = useState<string>(initialTab)

  // Inicializar o playlistId na primeira carga se o Spotify estiver habilitado
  useEffect(() => {
    if (settings.enable_spotify && settings.spotify_playlist_url && !playlistId) {
      try {
        const urlString = settings.spotify_playlist_url;
        
        // Determinar o tipo de conteúdo baseado na URL
        let type = '';
        let id = '';
        
        if (urlString.includes('/playlist/')) {
          type = 'playlist';
          id = urlString.split('/playlist/')[1]?.split('?')[0] || '';
        } else if (urlString.includes('/episode/')) {
          type = 'episode';
          id = urlString.split('/episode/')[1]?.split('?')[0] || '';
        } else if (urlString.includes('/track/')) {
          type = 'track';
          id = urlString.split('/track/')[1]?.split('?')[0] || '';
        } else if (urlString.includes('/album/')) {
          type = 'album';
          id = urlString.split('/album/')[1]?.split('?')[0] || '';
        } else if (urlString.includes('/show/')) {
          type = 'show';
          id = urlString.split('/show/')[1]?.split('?')[0] || '';
        }
        
        if (id && type) {
          console.log(`Inicializando ${type} ID na primeira carga:`, id);
          setPlaylistId(id);
          setContentType(type);
          
          // Disparar evento de atualização para notificar outros componentes
          setTimeout(() => {
            const settingsUpdatedEvent = new Event('settings-updated');
            window.dispatchEvent(settingsUpdatedEvent);
          }, 500);
        }
      } catch (error) {
        console.error('Erro ao extrair dados da URL do Spotify:', error);
      }
    }
  }, [settings.enable_spotify, settings.spotify_playlist_url, playlistId, setPlaylistId, setContentType]);

  useEffect(() => {
    if (settings.language && (settings.language === "en" || settings.language === "pt")) {
      setLanguage(settings.language as "en" | "pt")
    }
  }, [settings.language, setLanguage])

  function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`
  }
  
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
      pomodoro_sound: settings.pomodoro_sound || "pomodoro",
      enable_desktop_notifications: settings.enable_desktop_notifications,
      enable_task_notifications: settings.enable_task_notifications,
      task_notification_days: settings.task_notification_days,
      enable_spotify: settings.enable_spotify !== undefined ? settings.enable_spotify : false,
      spotify_playlist_url: settings.spotify_playlist_url,
      enable_flip_clock: settings.enable_flip_clock,
      flip_clock_size: settings.flip_clock_size || "medium",
      flip_clock_color: settings.flip_clock_color || "#ff5722",
    },
  })

  // Monitorar mudanças na configuração do Spotify
  useEffect(() => {
    const subscription = form.watch((value, { name, type: watchType }) => {
      // Reagir apenas a mudanças no campo 'enable_spotify' ou na carga inicial para 'spotify_playlist_url'
      if (name === 'enable_spotify') {
        if (value.enable_spotify === false) {
          console.log('form.watch: Spotify desabilitado, limpando playlistId.');
          setPlaylistId(null); // Limpa o ID no store se o switch for desligado
        } else if (value.enable_spotify === true && value.spotify_playlist_url) {
          // Se o Spotify for habilitado e já houver uma URL no campo,
          // tentar extrair e definir o ID (útil se o usuário colar URL e depois ligar o switch)
          console.log('form.watch: Spotify habilitado com URL existente, tentando definir playlistId.');
          try {
            const urlString = value.spotify_playlist_url;
              let type = '';
              let id = '';
            if (urlString.includes('/playlist/')) { type = 'playlist'; id = urlString.split('/playlist/')[1]?.split('?')[0] || ''; }
            else if (urlString.includes('/episode/')) { type = 'episode'; id = urlString.split('/episode/')[1]?.split('?')[0] || ''; }
            else if (urlString.includes('/track/')) { type = 'track'; id = urlString.split('/track/')[1]?.split('?')[0] || ''; }
            else if (urlString.includes('/album/')) { type = 'album'; id = urlString.split('/album/')[1]?.split('?')[0] || ''; }
            else if (urlString.includes('/show/')) { type = 'show'; id = urlString.split('/show/')[1]?.split('?')[0] || ''; }
              
              if (id && type) {
              console.log(`form.watch: Restaurando ${type} ID:`, id);
                setPlaylistId(id);
                setContentType(type);
            }
          } catch (error) {
            console.error("form.watch: Erro ao extrair dados da URL do Spotify:", error);
          }
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, setPlaylistId, setContentType]);

  useEffect(() => {
    if (settings.language && (settings.language === "en" || settings.language === "pt")) {
      setLanguage(settings.language as "en" | "pt")
    }
  }, [settings.language, setLanguage])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      const processedValues = {
        ...values,
        task_notification_days: typeof values.task_notification_days === 'string' 
          ? parseInt(values.task_notification_days, 10) 
          : values.task_notification_days
      };
      
      // Debug log para verificar os valores
      console.log("Enviando configurações:", JSON.stringify(processedValues, null, 2));
      
      // Se o Spotify estiver sendo desativado, limpar o playlistId imediatamente
      if (settings.enable_spotify === true && processedValues.enable_spotify === false) {
        console.log("Spotify está sendo desativado, limpando estado e storage");
        setPlaylistId(null);
        
        // Limpar também o localStorage
        try {
          const spotifyStorage = localStorage.getItem('spotify-storage');
          if (spotifyStorage) {
            const spotifyData = JSON.parse(spotifyStorage);
            if (spotifyData.state) {
              spotifyData.state.playlistId = null;
              localStorage.setItem('spotify-storage', JSON.stringify(spotifyData));
            }
          }
        } catch (err) {
          console.error("Erro ao limpar localStorage do Spotify:", err);
        }
      }
      
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedValues),
      })

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro ao atualizar configurações:", errorData);
        throw new Error("Failed to update settings");
      }

      const result = await response.json();
      console.log("Configurações atualizadas com sucesso:", result);
      console.log("Dias de notificação retornados:", result.settings?.task_notification_days);

      if (values.theme !== settings.theme) {
        setTheme(values.theme)
      }

      if (values.language !== language) {
        console.log(`Alterando idioma de ${language} para ${values.language}`);
        
        setLanguage(values.language)
        
        clearCookie("language-storage")
        
        document.cookie = `user-language=${values.language}; path=/; max-age=31536000; SameSite=Strict`;
        
        console.log("Cookies de idioma atualizados:");
        console.log(document.cookie.split(';').filter(c => c.trim().startsWith('user-language') || c.trim().startsWith('language-storage')));
        
        document.documentElement.lang = values.language === 'en' ? 'en' : 'pt-BR';
      }

      if (values.enable_sound) {
        if (values.notification_sound !== 'none') {
          console.log("Tocando som após salvar configurações:", values.notification_sound);
          playSound(values.notification_sound);
        } else {
          console.log("Som de notificação desativado (none)");
        }
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);

      toast({
        title: t("Settings updated"),
        description: t("Your settings have been updated successfully."),
        variant: "success",
        duration: 5000
      })

      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      if (error instanceof Error) {
        console.error("Detalhes do erro:", error.message);
        console.error("Stack trace:", error.stack);
      }
      
      toast({
        variant: "destructive",
        title: t("Failed to update settings"),
        description: t("Please try again."),
      })
    } finally {
      setIsLoading(false)
    }
  }

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
    <>
      {isSaved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-green-500 text-white rounded-full p-6 animate-pulse shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
      <Tabs 
        defaultValue={initialTab} 
        onValueChange={(value) => {
          setActiveTab(value);
          console.log("Aba ativa alterada para:", value);
        }}
        className="w-full"
      >
        <TabsList className="mb-6 flex w-full justify-start rounded-lg bg-slate-800 dark:bg-slate-900 shadow-sm border-b border-border/40 overflow-x-auto p-0 no-scrollbar">
          <TabsTrigger 
            value="general" 
            className="text-sm font-medium px-4 py-3 min-w-[80px] flex-shrink-0 border-0 rounded-none text-white cursor-pointer hover:opacity-90 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent"
          >
            {t("general")}
          </TabsTrigger>
          <TabsTrigger 
            value="pomodoro" 
            className="text-sm font-medium px-4 py-3 min-w-[80px] flex-shrink-0 border-0 rounded-none text-white cursor-pointer hover:opacity-90 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent"
          >
            {t("pomodoroTimer")}
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="text-sm font-medium px-4 py-3 min-w-[80px] flex-shrink-0 border-0 rounded-none text-white cursor-pointer hover:opacity-90 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent"
          >
            {t("notifications")}
          </TabsTrigger>
          <TabsTrigger 
            value="spotify" 
            className="text-sm font-medium px-4 py-3 min-w-[80px] flex-shrink-0 border-0 rounded-none text-white cursor-pointer hover:opacity-90 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent"
          >
            Música
          </TabsTrigger>
          <TabsTrigger 
            value="flipclock" 
            className="text-sm font-medium px-4 py-3 min-w-[80px] flex-shrink-0 border-0 rounded-none text-white cursor-pointer hover:opacity-90 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent"
          >
            Flip Clock
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="general">
              <Card className="overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle>{t("general")}</CardTitle>
                  <CardDescription>{t("Manage your application preferences.")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-4 sm:px-6">
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
                <CardFooter className="px-4 sm:px-6 flex-wrap gap-2">
                  <Button 
                    type="button" 
                    disabled={isLoading} 
                    className="relative w-full sm:w-auto"
                    onClick={async () => {
                      try {
                        console.log("Botão Salvar de Configurações Gerais clicado");
                        setIsLoading(true);
                        
                        // Pegar os valores relevantes do formulário
                        const allValues = form.getValues();
                        const generalValues = {
                          theme: allValues.theme,
                          language: allValues.language
                        };
                        
                        console.log("Enviando configurações gerais:", generalValues);
                        
                        // Salvar as configurações
                        const response = await fetch("/api/settings", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(generalValues),
                        });
                        
                        if (!response.ok) {
                          throw new Error("Falha ao salvar configurações");
                        }
                        
                        console.log("Configurações gerais salvas com sucesso!");
                        
                        if (generalValues.theme !== settings.theme) {
                          setTheme(generalValues.theme);
                        }

                        if (generalValues.language !== language) {
                          console.log(`Alterando idioma de ${language} para ${generalValues.language}`);
                          
                          setLanguage(generalValues.language as "en" | "pt");
                          
                          clearCookie("language-storage");
                          
                          document.cookie = `user-language=${generalValues.language}; path=/; max-age=31536000; SameSite=Strict`;
                          
                          document.documentElement.lang = generalValues.language === 'en' ? 'en' : 'pt-BR';
                        }
                        
                        // Mostrar animação de sucesso
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2000);
                        
                        // Exibir notificação de sucesso
                        toast({
                          title: t("Settings updated"),
                          description: t("Your settings have been updated successfully."),
                          variant: "success",
                          duration: 5000
                        });
                        
                        // Atualizar a página após um curto atraso
                        setTimeout(() => {
                          router.refresh();
                        }, 500);
                      } catch (error) {
                        console.error("Erro ao salvar configurações gerais:", error);
                        toast({
                          variant: "destructive",
                          title: t("Failed to update settings"),
                          description: t("Please try again."),
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? "Salvando..." : "Salvar"}
                    {isLoading && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="pomodoro">
              <Card className="overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle>{t("pomodoroTimer")}</CardTitle>
                  <CardDescription>{t("Customize your Pomodoro timer preferences.")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-4 sm:px-6">
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

                  {form.watch("enable_sound") && (
                    <FormField
                      control={form.control}
                      name="pomodoro_sound"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("pomodoroSound")}</FormLabel>
                          <div className="flex items-center gap-2">
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t("Select a sound")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">{t("noSound")}</SelectItem>
                                <SelectItem value="pomodoro">{t("pomodoro")} ({t("defaultSound")})</SelectItem>
                                <SelectItem value="bell">{t("bell")}</SelectItem>
                                <SelectItem value="chime">{t("chime")}</SelectItem>
                                <SelectItem value="digital">{t("digital")}</SelectItem>
                                <SelectItem value="ding">{t("ding")}</SelectItem>
                                <SelectItem value="notification">{t("notification")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              onClick={() => {
                                console.log("Testando som do pomodoro:", field.value);
                                playSound(field.value);
                              }}
                            >
                              <span className="sr-only">{t("Play sound")}</span>
                              ▶️
                            </Button>
                          </div>
                          <FormDescription>{t("chooseSound")} ({t("forPomodoroTimer")})</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
                <CardFooter className="px-4 sm:px-6 flex-wrap gap-2">
                  <Button 
                    type="button" 
                    disabled={isLoading} 
                    className="relative w-full sm:w-auto"
                    onClick={async () => {
                      try {
                        console.log("Botão Salvar de Configurações do Pomodoro clicado");
                        setIsLoading(true);
                        
                        // Pegar os valores relevantes do formulário
                        const allValues = form.getValues();
                        const pomodoroValues = {
                          pomodoro_work_minutes: allValues.pomodoro_work_minutes,
                          pomodoro_break_minutes: allValues.pomodoro_break_minutes,
                          pomodoro_long_break_minutes: allValues.pomodoro_long_break_minutes,
                          pomodoro_cycles: allValues.pomodoro_cycles,
                          pomodoro_sound: allValues.pomodoro_sound
                        };
                        
                        console.log("Enviando configurações do pomodoro:", pomodoroValues);
                        
                        // Salvar as configurações
                        const response = await fetch("/api/settings", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(pomodoroValues),
                        });
                        
                        if (!response.ok) {
                          throw new Error("Falha ao salvar configurações");
                        }
                        
                        console.log("Configurações do pomodoro salvas com sucesso!");
                        
                        // Verificar se deve tocar o som
                        if (form.getValues().enable_sound && form.getValues().pomodoro_sound !== 'none') {
                          playSound(form.getValues().pomodoro_sound);
                        }
                        
                        // Mostrar animação de sucesso
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2000);
                        
                        // Exibir notificação de sucesso
                        toast({
                          title: t("Settings updated"),
                          description: t("Your settings have been updated successfully."),
                          variant: "success",
                          duration: 5000
                        });
                        
                        // Atualizar a página após um curto atraso
                        setTimeout(() => {
                          router.refresh();
                        }, 500);
                      } catch (error) {
                        console.error("Erro ao salvar configurações do pomodoro:", error);
                        toast({
                          variant: "destructive",
                          title: t("Failed to update settings"),
                          description: t("Please try again."),
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? "Salvando..." : "Salvar"}
                    {isLoading && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle>{t("notifications")}</CardTitle>
                  <CardDescription>{t("Manage how you receive notifications.")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-4 sm:px-6">
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
                                <SelectItem value="none">{t("noSound")}</SelectItem>
                                <SelectItem value="pomodoro">{t("pomodoro")} ({t("defaultSound")})</SelectItem>
                                <SelectItem value="bell">{t("bell")}</SelectItem>
                                <SelectItem value="chime">{t("chime")}</SelectItem>
                                <SelectItem value="digital">{t("digital")}</SelectItem>
                                <SelectItem value="ding">{t("ding")}</SelectItem>
                                <SelectItem value="notification">{t("notification")}</SelectItem>
                                <SelectItem value="default">{t("defaultSound")}</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon" 
                              onClick={() => {
                                console.log("Testando som de notificação:", field.value);
                                playSound(field.value);
                              }}
                            >
                              <span className="sr-only">{t("Play sound")}</span>
                              ▶️
                            </Button>
                          </div>
                          <FormDescription>{t("chooseSound")} ({t("forGeneralNotifications")})</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="enable_task_notifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{t("taskNotifications")}</FormLabel>
                          <FormDescription>{t("showNotificationsForUpcomingTasks")}</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("enable_task_notifications") && (
                    <FormField
                      control={form.control}
                      name="task_notification_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("notificationDays")}</FormLabel>
                          <FormDescription>{t("numberOfDaysBeforeToShowNotifications")}</FormDescription>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              max="14" 
                              {...field} 
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                console.log("Campo dias de notificação alterado para:", value, "tipo:", typeof value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

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
                <CardFooter className="px-4 sm:px-6 flex-wrap gap-2">
                  <Button 
                    type="button" 
                    disabled={isLoading} 
                    className="relative w-full sm:w-auto"
                    onClick={async () => {
                      try {
                        console.log("Botão Salvar de Configurações de Notificações clicado");
                        setIsLoading(true);
                        
                        // Pegar os valores relevantes do formulário
                        const allValues = form.getValues();
                        const notificationValues = {
                          enable_sound: allValues.enable_sound,
                          notification_sound: allValues.notification_sound,
                          enable_desktop_notifications: allValues.enable_desktop_notifications,
                          enable_task_notifications: allValues.enable_task_notifications,
                          task_notification_days: allValues.task_notification_days
                        };
                        
                        console.log("Enviando configurações de notificações:", notificationValues);
                        
                        // Salvar as configurações
                        const response = await fetch("/api/settings", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(notificationValues),
                        });
                        
                        if (!response.ok) {
                          throw new Error("Falha ao salvar configurações");
                        }
                        
                        console.log("Configurações de notificações salvas com sucesso!");
                        
                        // Verificar se deve tocar o som
                        if (notificationValues.enable_sound && notificationValues.notification_sound !== 'none') {
                          playSound(notificationValues.notification_sound);
                        }
                        
                        // Mostrar animação de sucesso
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2000);
                        
                        // Exibir notificação de sucesso
                        toast({
                          title: t("Settings updated"),
                          description: t("Your settings have been updated successfully."),
                          variant: "success",
                          duration: 5000
                        });
                        
                        // Atualizar a página após um curto atraso
                        setTimeout(() => {
                          router.refresh();
                        }, 500);
                      } catch (error) {
                        console.error("Erro ao salvar configurações de notificações:", error);
                        toast({
                          variant: "destructive",
                          title: t("Failed to update settings"),
                          description: t("Please try again."),
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? "Salvando..." : "Salvar"}
                    {isLoading && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="spotify">
              <Card className="overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle>Player de Música</CardTitle>
                  <CardDescription>Configure sua playlist do Spotify ou Deezer para tocar durante suas tarefas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-4 sm:px-6">
                  <FormField
                    control={form.control}
                    name="enable_spotify"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ativar Player de Música</FormLabel>
                          <FormDescription>
                            Exibir o player de música na interface para tocar durante suas tarefas.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              setIsEnabled(checked)
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("enable_spotify") && (
                    <FormField
                      control={form.control}
                      name="spotify_playlist_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link da Playlist</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://open.spotify.com/playlist/... ou https://www.deezer.com/..."
                              value={playlistUrl}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setPlaylistUrl(newValue);
                                field.onChange(newValue);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Cole o link da sua playlist do Spotify ou Deezer para tocar durante suas tarefas.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
                <CardFooter className="px-4 sm:px-6 flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={isLoading}
                    className="relative w-full sm:w-auto"
                    onClick={async () => {
                      try {
                        console.log("Botão Salvar do Player de Música clicado");
                        setIsLoading(true);
                        
                        // Pegar os valores atuais do formulário
                        const allValues = form.getValues();
                        
                        // Obter apenas os valores relevantes para o player
                        const musicValues = {
                          enable_spotify: allValues.enable_spotify,
                          spotify_playlist_url: allValues.spotify_playlist_url
                        };
                        
                        // Processar a URL 
                        if (musicValues.spotify_playlist_url && musicValues.enable_spotify) {
                          try {
                            const url = musicValues.spotify_playlist_url;
                            
                            // Determinar o tipo de player (Spotify ou Deezer)
                            let playerType = 'spotify';
                            let contentType = 'playlist';
                            let id = null;
                            
                            // Verificar se é Deezer
                            if (url.includes('deezer.com')) {
                              playerType = 'deezer';
                              
                              if (url.includes('/playlist/')) {
                                contentType = 'playlist';
                                id = url.split('/playlist/')[1]?.split('?')[0];
                              } else if (url.includes('/track/')) {
                                contentType = 'track';
                                id = url.split('/track/')[1]?.split('?')[0];
                              } else if (url.includes('/album/')) {
                                contentType = 'album';
                                id = url.split('/album/')[1]?.split('?')[0];
                              } else if (url.includes('/artist/')) {
                                contentType = 'artist';
                                id = url.split('/artist/')[1]?.split('?')[0];
                              }
                            } 
                            // Verificar se é Spotify
                            else if (url.includes('spotify.com')) {
                              playerType = 'spotify';
                              
                              if (url.includes('/playlist/')) {
                                contentType = 'playlist';
                                id = url.split('/playlist/')[1]?.split('?')[0];
                              } else if (url.includes('/track/')) {
                                contentType = 'track';
                                id = url.split('/track/')[1]?.split('?')[0];
                              } else if (url.includes('/album/')) {
                                contentType = 'album';
                                id = url.split('/album/')[1]?.split('?')[0];
                              } else if (url.includes('/show/')) {
                                contentType = 'show';
                                id = url.split('/show/')[1]?.split('?')[0];
                              } else if (url.includes('/episode/')) {
                                contentType = 'episode';
                                id = url.split('/episode/')[1]?.split('?')[0];
                              }
                            }
                            
                            // Se conseguimos extrair o ID, atualizar o player
                            if (id) {
                              console.log(`Player: Extraído ${contentType} com ID ${id}, player: ${playerType}`);
                              // Atualizar o store do player
                              setPlaylistId(id);
                              if (useSpotifyStore.getState().setContentType) {
                                useSpotifyStore.getState().setContentType(contentType);
                              }
                              if (useSpotifyStore.getState().setPlayerType) {
                                useSpotifyStore.getState().setPlayerType(playerType);
                              }
                              // Garantir que o player esteja ativado
                              setIsEnabled(true);
                            }
                          } catch (err) {
                            console.error("Erro ao processar URL do player de música:", err);
                          }
                        } else if (!musicValues.enable_spotify) {
                          // Se o player estiver desativado, limpar o playlistId
                          setPlaylistId(null);
                          setIsEnabled(false);
                        }
                        
                        console.log("Salvando configurações do player de música:", musicValues);
                        
                        // Salvar as configurações
                        const response = await fetch("/api/settings", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(musicValues),
                        });
                        
                        if (!response.ok) {
                          throw new Error("Falha ao salvar configurações");
                        }
                        
                        // Disparar evento de atualização de configurações
                        window.dispatchEvent(new CustomEvent('settings-updated'));
                        
                        console.log("Configurações do player de música salvas com sucesso!");
                        
                        // Mostrar animação de sucesso
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2000);
                        
                        // Exibir notificação de sucesso
                        toast({
                          title: "Configurações atualizadas",
                          description: "Suas configurações do player de música foram atualizadas com sucesso.",
                          variant: "success",
                          duration: 5000
                        });
                        
                        // Atualizar a página após um curto atraso
                        setTimeout(() => {
                          router.refresh();
                        }, 500);
                        
                        setPlaylistUrl('');
                      } catch (error) {
                        console.error("Erro ao salvar configurações do player de música:", error);
                        toast({
                          variant: "destructive",
                          title: "Falha ao atualizar configurações",
                          description: "Por favor, tente novamente.",
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? "Salvando..." : "Salvar Configurações"}
                    {isLoading && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="flipclock">
              <Card className="overflow-hidden">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle>Flip Clock</CardTitle>
                  <CardDescription>Configure as preferências do seu relógio tipo Flip Clock.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 px-4 sm:px-6">
                  <FormField
                    control={form.control}
                    name="enable_flip_clock"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ativar Flip Clock</FormLabel>
                          <FormDescription>
                            Exibir um relógio estilo flip na página principal.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("enable_flip_clock") && (
                    <>
                      <FormField
                        control={form.control}
                        name="flip_clock_size"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tamanho do Relógio</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um tamanho" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="small">Pequeno</SelectItem>
                                <SelectItem value="medium">Médio</SelectItem>
                                <SelectItem value="large">Grande</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Escolha o tamanho que melhor se adapta à sua tela.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="flip_clock_color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cor do Relógio</FormLabel>
                            <div className="flex items-center gap-3 flex-wrap">
                              <FormControl>
                                <Input type="color" {...field} className="w-12 h-8 p-1" />
                              </FormControl>
                              <div className="text-sm overflow-hidden text-ellipsis">{field.value}</div>
                            </div>
                            <FormDescription>
                              Escolha uma cor personalizada para o seu relógio.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
                <CardFooter className="px-4 sm:px-6 flex-wrap gap-2">
                  <Button 
                    type="button" 
                    disabled={isLoading} 
                    className="relative w-full sm:w-auto"
                    onClick={async () => {
                      try {
                        console.log("Botão Salvar do Flip Clock clicado diretamente");
                        setIsLoading(true);
                        
                        // Pegar os valores atuais do formulário
                        const allValues = form.getValues();
                        console.log("Valores do formulário:", allValues);
                        
                        // Obter apenas os valores relevantes para o Flip Clock
                        const flipClockValues = {
                          enable_flip_clock: allValues.enable_flip_clock,
                          flip_clock_size: allValues.flip_clock_size,
                          flip_clock_color: allValues.flip_clock_color
                        };
                        
                        console.log("Enviando configurações do Flip Clock:", flipClockValues);
                        
                        // Salvar as configurações
                        const response = await fetch("/api/settings", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(flipClockValues),
                        });
                        
                        if (!response.ok) {
                          throw new Error("Falha ao salvar configurações");
                        }
                        
                        console.log("Configurações do Flip Clock salvas com sucesso!");
                        
                        // Mostrar animação de sucesso
                        setIsSaved(true);
                        setTimeout(() => setIsSaved(false), 2000);
                        
                        // Exibir notificação de sucesso
                        toast({
                          title: "Configurações atualizadas",
                          description: "Suas configurações do Flip Clock foram atualizadas com sucesso.",
                          variant: "success",
                          duration: 5000
                        });
                        
                        // Atualizar a página após um curto atraso
                        setTimeout(() => {
                          router.refresh();
                        }, 500);
                      } catch (error) {
                        console.error("Erro ao salvar configurações do Flip Clock:", error);
                        toast({
                          variant: "destructive",
                          title: "Falha ao atualizar configurações",
                          description: "Por favor, tente novamente.",
                        });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? "Salvando..." : "Salvar Configurações"}
                    {isLoading && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </>
  )
}

