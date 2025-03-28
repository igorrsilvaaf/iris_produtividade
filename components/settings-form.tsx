"use client"

import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useTheme } from "next-themes"
import type { UserSettings } from "@/lib/settings"

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      theme: settings.theme,
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
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      // Update theme if changed
      if (values.theme !== settings.theme) {
        setTheme(values.theme)
      }

      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update settings",
        description: "Please try again.",
      })
    }
  }

  // Request notification permission if enabled
  const requestNotificationPermission = async () => {
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        toast({
          variant: "destructive",
          title: "Notification permission denied",
          description: "Desktop notifications will not be shown.",
        })
        form.setValue("enable_desktop_notifications", false)
      }
    }
  }

  // Play sound sample
  const playSound = (sound: string) => {
    const audio = new Audio(`/sounds/${sound}.mp3`)
    audio.play().catch((error) => {
      console.error("Failed to play sound:", error)
    })
  }

  return (
    <Tabs defaultValue="general">
      <TabsList className="mb-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="pomodoro">Pomodoro Timer</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Manage your application preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          setTheme(value)
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a theme" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Choose your preferred theme for the application.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="pomodoro">
            <Card>
              <CardHeader>
                <CardTitle>Pomodoro Timer Settings</CardTitle>
                <CardDescription>Customize your Pomodoro timer preferences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="pomodoro_work_minutes"
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
                    name="pomodoro_break_minutes"
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
                    name="pomodoro_long_break_minutes"
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
                    name="pomodoro_cycles"
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
                </div>

                <FormField
                  control={form.control}
                  name="enable_sound"
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

                {form.watch("enable_sound") && (
                  <FormField
                    control={form.control}
                    name="notification_sound"
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
              </CardContent>
              <CardFooter>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage how you receive notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="enable_desktop_notifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Desktop Notifications</FormLabel>
                        <FormDescription>Receive desktop notifications for important events.</FormDescription>
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
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </form>
      </Form>
    </Tabs>
  )
}

