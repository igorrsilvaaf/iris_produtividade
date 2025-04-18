"use client"

import { useEffect, useState } from "react"
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
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from "@/lib/i18n"
import { usePomodoroStore } from "@/lib/stores/pomodoro-store"
import { useToast } from "@/components/ui/use-toast"
import { SOUND_URLS, useAudioPlayer } from "@/lib/audio-utils"
import { Volume2 } from "lucide-react"

interface PomodoroSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (settings: {
    workMinutes: number
    shortBreakMinutes: number
    longBreakMinutes: number
    longBreakInterval: number
    enableSound: boolean
    notificationSound: string
    pomodoroSound: string
    enableDesktopNotifications: boolean
  }) => void
}

const FormSchema = z.object({
  workMinutes: z.coerce.number().min(1).max(60),
  shortBreakMinutes: z.coerce.number().min(1).max(30),
  longBreakMinutes: z.coerce.number().min(1).max(60),
  longBreakInterval: z.coerce.number().min(1).max(10),
  enableSound: z.boolean(),
  notificationSound: z.string().default("pomodoro"),
  pomodoroSound: z.string().default("pomodoro"),
  enableDesktopNotifications: z.boolean(),
})

export function PomodoroSettings({ open, onOpenChange, onSave }: PomodoroSettingsProps) {
  const { t } = useTranslation()
  const { settings, updateSettings } = usePomodoroStore()
  const [requestingNotificationPermission, setRequestingNotificationPermission] = useState(false)
  const { toast } = useToast()
  const { playSound } = useAudioPlayer()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      workMinutes: settings.workMinutes,
      shortBreakMinutes: settings.shortBreakMinutes,
      longBreakMinutes: settings.longBreakMinutes,
      longBreakInterval: settings.longBreakInterval,
      enableSound: settings.enableSound,
      notificationSound: settings.notificationSound,
      pomodoroSound: settings.pomodoroSound || "pomodoro",
      enableDesktopNotifications: settings.enableDesktopNotifications,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        workMinutes: settings.workMinutes,
        shortBreakMinutes: settings.shortBreakMinutes,
        longBreakMinutes: settings.longBreakMinutes,
        longBreakInterval: settings.longBreakInterval,
        enableSound: settings.enableSound,
        notificationSound: settings.notificationSound,
        pomodoroSound: settings.pomodoroSound || "pomodoro",
        enableDesktopNotifications: settings.enableDesktopNotifications,
      })
    }
  }, [settings, form, open])

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      toast({
        variant: "destructive",
        title: t("Notifications not supported"),
        description: t("Your browser does not support desktop notifications."),
      });
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      toast({
        variant: "destructive",
        title: t("Notification permission denied"),
        description: t("Please enable notifications in your browser settings."),
      });
      return false;
    }

    try {
      setRequestingNotificationPermission(true);
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast({
          title: t("Notifications enabled"),
          description: t("You will now receive desktop notifications when timers complete."),
        });
        return true;
      } else {
        toast({
          variant: "destructive",
          title: t("Notification permission denied"),
          description: t("Desktop notifications will not be shown."),
        });
        return false;
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast({
        variant: "destructive",
        title: t("Error"),
        description: t("Failed to request notification permissions."),
      });
      return false;
    } finally {
      setRequestingNotificationPermission(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    let updatedValues = { ...values };

    if (values.enableDesktopNotifications) {
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        updatedValues.enableDesktopNotifications = false;
      }
    }

    updateSettings(updatedValues);
    
    if (onSave) {
      onSave(updatedValues);
    }
    
    onOpenChange(false);
    toast({
      title: "Configurações salvas com sucesso",
      description: "Suas configurações de pomodoro foram atualizadas.",
    });
  }

  // Reproduzir som de prévia
  const handlePlaySound = (soundName: string) => {
    console.log("PomodoroSettings - Testando som:", soundName);
    
    // Se for "none", não tocar nenhum som
    if (soundName === 'none') {
      console.log("Nenhum som será reproduzido");
      return;
    }
    
    if (Object.keys(SOUND_URLS).includes(soundName)) {
      playSound(soundName);
    } else {
      console.warn(`Som "${soundName}" não encontrado, tocando som padrão pomodoro`);
      playSound("pomodoro");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("pomodoroSettings")}</DialogTitle>
          <DialogDescription>{t("pomodoroSettingsDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="workMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("workMinutes")}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="60" className="text-lg py-6" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Tempo em minutos para período de trabalho
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortBreakMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("shortBreakMinutes")}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="30" className="text-lg py-6" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Tempo em minutos para pausas curtas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longBreakMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("longBreakMinutes")}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="60" className="text-lg py-6" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Tempo em minutos para pausas longas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longBreakInterval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("longBreakInterval")}</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="10" className="text-lg py-6" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Número de ciclos antes de uma pausa longa
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="border rounded-lg p-4">
              <FormField
                control={form.control}
                name="enableSound"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 mb-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t("enableSound")}</FormLabel>
                      <FormDescription>{t("enableSoundDescription")}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("enableSound") && (
                <FormField
                  control={form.control}
                  name="notificationSound"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">{t("notificationSound")}</FormLabel>
                      <div className="flex flex-col space-y-3">
                        <Select onValueChange={field.onChange} value={field.value || "pomodoro"}>
                          <FormControl>
                            <SelectTrigger className="w-full text-base py-6">
                              <SelectValue placeholder={t("chooseASound")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none" className="flex items-center">
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2">
                                  <span>{t("noSound")}</span>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="pomodoro" className="flex items-center">
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2">
                                  <span>{t("pomodoro")} ({t("defaultSound")})</span>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handlePlaySound("pomodoro");
                                    }}
                                    className="inline-flex items-center justify-center w-6 h-6"
                                    aria-label={t("playPomodoroSound")}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="notification" className="flex items-center">
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2">
                                  <span>{t("notification")}</span>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handlePlaySound("notification");
                                    }}
                                    className="inline-flex items-center justify-center w-6 h-6"
                                    aria-label={t("playNotificationSound")}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="bell" className="flex items-center">
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2">
                                  <span>{t("bell")}</span>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handlePlaySound("bell");
                                    }}
                                    className="inline-flex items-center justify-center w-6 h-6"
                                    aria-label={t("playBellSound")}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="chime" className="flex items-center">
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2">
                                  <span>{t("chime")}</span>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handlePlaySound("chime");
                                    }}
                                    className="inline-flex items-center justify-center w-6 h-6"
                                    aria-label={t("playChimeSound")}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="default" className="flex items-center">
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2">
                                  <span>{t("defaultSound")}</span>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handlePlaySound("default");
                                    }}
                                    className="inline-flex items-center justify-center w-6 h-6"
                                    aria-label={t("playDefaultSound")}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="digital" className="flex items-center">
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2">
                                  <span>{t("digital")}</span>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handlePlaySound("digital");
                                    }}
                                    className="inline-flex items-center justify-center w-6 h-6"
                                    aria-label={t("playDigitalSound")}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="ding" className="flex items-center">
                              <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-2">
                                  <span>{t("ding")}</span>
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handlePlaySound("ding");
                                    }}
                                    className="inline-flex items-center justify-center w-6 h-6"
                                    aria-label={t("playDingSound")}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">{t("Test selected sound")}:</span>
                          <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handlePlaySound(field.value || "pomodoro")}
                            className="flex items-center gap-2"
                          >
                            <Volume2 className="w-4 h-4" />
                            <span>{t("Listen")}</span>
                          </Button>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="pomodoroSound"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">{t("pomodoroSound")}</FormLabel>
                  <div className="flex flex-col space-y-3">
                    <Select onValueChange={field.onChange} value={field.value || "pomodoro"}>
                      <FormControl>
                        <SelectTrigger className="w-full text-base py-6">
                          <SelectValue placeholder={t("Choose a sound for Pomodoro")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none" className="flex items-center">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              <span>{t("noSound")}</span>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="pomodoro" className="flex items-center">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              <span>{t("pomodoro")} ({t("defaultSound")})</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handlePlaySound("pomodoro");
                                }}
                                className="inline-flex items-center justify-center w-6 h-6"
                                aria-label={t("playPomodoroSound")}
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="notification" className="flex items-center">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              <span>{t("notification")}</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handlePlaySound("notification");
                                }}
                                className="inline-flex items-center justify-center w-6 h-6"
                                aria-label={t("playNotificationSound")}
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="bell" className="flex items-center">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              <span>{t("bell")}</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handlePlaySound("bell");
                                }}
                                className="inline-flex items-center justify-center w-6 h-6"
                                aria-label={t("playBellSound")}
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="chime" className="flex items-center">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              <span>{t("chime")}</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handlePlaySound("chime");
                                }}
                                className="inline-flex items-center justify-center w-6 h-6"
                                aria-label={t("playChimeSound")}
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="default" className="flex items-center">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              <span>{t("defaultSound")}</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handlePlaySound("default");
                                }}
                                className="inline-flex items-center justify-center w-6 h-6"
                                aria-label={t("playDefaultSound")}
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="digital" className="flex items-center">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              <span>{t("digital")}</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handlePlaySound("digital");
                                }}
                                className="inline-flex items-center justify-center w-6 h-6"
                                aria-label={t("playDigitalSound")}
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="ding" className="flex items-center">
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center gap-2">
                              <span>{t("ding")}</span>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handlePlaySound("ding");
                                }}
                                className="inline-flex items-center justify-center w-6 h-6"
                                aria-label={t("playDingSound")}
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t("Test selected sound")}:</span>
                      <Button 
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlaySound(field.value || "pomodoro")}
                        className="flex items-center gap-2"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{t("Listen")}</span>
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableDesktopNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("enableDesktopNotifications")}</FormLabel>
                    <FormDescription>{t("enableDesktopNotificationsDescription")}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={(checked) => {
                        if (checked) {
                          requestNotificationPermission().then(granted => {
                            field.onChange(granted);
                          });
                        } else {
                          field.onChange(false);
                        }
                      }} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={requestingNotificationPermission}
                className="w-full md:w-auto text-base py-6"
              >
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


