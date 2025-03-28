"use client"

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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  workMinutes: z.coerce.number().min(1).max(60),
  shortBreakMinutes: z.coerce.number().min(1).max(30),
  longBreakMinutes: z.coerce.number().min(1).max(60),
  longBreakInterval: z.coerce.number().min(1).max(10),
  enableSound: z.boolean().default(true),
  notificationSound: z.string(),
  enableDesktopNotifications: z.boolean().default(true),
})

interface PomodoroSettingsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  settings: {
    workMinutes: number
    shortBreakMinutes: number
    longBreakMinutes: number
    longBreakInterval: number
    enableSound: boolean
    notificationSound: string
    enableDesktopNotifications: boolean
  }
  onSave: (settings: z.infer<typeof formSchema>) => void
}

export function PomodoroSettings({ open, onOpenChange, settings, onSave }: PomodoroSettingsProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSave(values)
  }

  // Request notification permission if enabled
  const requestNotificationPermission = async () => {
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission()
      return permission === "granted"
    }
    return true
  }

  // Play sound sample
  const playSound = (sound: string) => {
    const audio = new Audio(`/sounds/${sound}.mp3`)
    audio.play().catch((error) => {
      console.error("Failed to play sound:", error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pomodoro Settings</DialogTitle>
          <DialogDescription>Customize your Pomodoro timer settings.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="workMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Duration (minutes)</FormLabel>
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
                  <FormLabel>Short Break Duration (minutes)</FormLabel>
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
                  <FormLabel>Long Break Duration (minutes)</FormLabel>
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
                  <FormLabel>Long Break Interval (cycles)</FormLabel>
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Sound Notifications</FormLabel>
                    <FormDescription>Play a sound when a Pomodoro timer completes.</FormDescription>
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
                    <FormLabel>Notification Sound</FormLabel>
                    <div className="flex items-center gap-2">
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sound" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="default">Default</SelectItem>
                          <SelectItem value="bell">Bell</SelectItem>
                          <SelectItem value="chime">Chime</SelectItem>
                          <SelectItem value="digital">Digital</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" size="icon" onClick={() => playSound(field.value)}>
                        <span className="sr-only">Play sound</span>
                        ▶️
                      </Button>
                    </div>
                    <FormDescription>Choose the sound to play when a timer completes.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="enableDesktopNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Desktop Notifications</FormLabel>
                    <FormDescription>Show desktop notifications when a timer completes.</FormDescription>
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

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

