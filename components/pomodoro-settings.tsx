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
    enableDesktopNotifications: boolean
  }) => void
}

const FormSchema = z.object({
  workMinutes: z.coerce.number().min(1).max(60),
  shortBreakMinutes: z.coerce.number().min(1).max(30),
  longBreakMinutes: z.coerce.number().min(1).max(60),
  longBreakInterval: z.coerce.number().min(1).max(10),
  enableSound: z.boolean(),
  notificationSound: z.string(),
  enableDesktopNotifications: z.boolean(),
})

export function PomodoroSettings({ open, onOpenChange }: PomodoroSettingsProps) {
  const { t } = useTranslation()
  const { settings, updateSettings } = usePomodoroStore()
  const [requestingNotificationPermission, setRequestingNotificationPermission] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      workMinutes: settings.workMinutes,
      shortBreakMinutes: settings.shortBreakMinutes,
      longBreakMinutes: settings.longBreakMinutes,
      longBreakInterval: settings.longBreakInterval,
      enableSound: settings.enableSound,
      notificationSound: settings.notificationSound,
      enableDesktopNotifications: settings.enableDesktopNotifications,
    },
  })

  useEffect(() => {
    form.reset({
      workMinutes: settings.workMinutes,
      shortBreakMinutes: settings.shortBreakMinutes,
      longBreakMinutes: settings.longBreakMinutes,
      longBreakInterval: settings.longBreakInterval,
      enableSound: settings.enableSound,
      notificationSound: settings.notificationSound,
      enableDesktopNotifications: settings.enableDesktopNotifications,
    })
  }, [settings, form])

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
    
    // Call onSave callback if provided
    if (onSave) {
      onSave(updatedValues);
    }
    
    onOpenChange(false);
    toast({
      title: "Configurações salvas com sucesso",
      description: "Suas configurações de pomodoro foram atualizadas.",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("pomodoroSettings")}</DialogTitle>
          <DialogDescription>{t("pomodoroSettingsDescription")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="workMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("workMinutes")}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
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
                    <Input type="number" {...field} />
                  </FormControl>
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
                    <Input type="number" {...field} />
                  </FormControl>
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
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enableSound"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t("enableSound")}</FormLabel>
                    <FormDescription>{t("enableSoundDescription")}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notificationSound"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("notificationSound")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectSound")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bell">{t("bell")}</SelectItem>
                      <SelectItem value="chime">{t("chime")}</SelectItem>
                      <SelectItem value="ding">{t("ding")}</SelectItem>
                      <SelectItem value="notification">{t("notification")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enableDesktopNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t("enableDesktopNotifications")}</FormLabel>
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
            <DialogFooter>
              <Button type="submit" disabled={requestingNotificationPermission}>
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


