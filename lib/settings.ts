import prisma from "./prisma"

export type UserSettings = {
  theme: string
  language: string
  pomodoro_work_minutes: number
  pomodoro_break_minutes: number
  pomodoro_long_break_minutes: number
  pomodoro_cycles: number
  enable_sound: boolean
  notification_sound: string
  pomodoro_sound: string
  enable_desktop_notifications: boolean
  enable_task_notifications: boolean
  task_notification_days: number
  enable_spotify: boolean
  spotify_playlist_url: string | null
  enable_flip_clock: boolean
  flip_clock_size: string
  flip_clock_color: string
}

export async function getUserSettings(userId: number): Promise<UserSettings> {
  try {
    const settings = await prisma.user_settings.findUnique({
      where: { user_id: userId }
    })

    if (settings) {
      return {
        theme: settings.theme || "system",
        language: settings.language || "pt",
        pomodoro_work_minutes: settings.pomodoro_work_minutes || 25,
        pomodoro_break_minutes: settings.pomodoro_break_minutes || 5,
        pomodoro_long_break_minutes: settings.pomodoro_long_break_minutes || 15,
        pomodoro_cycles: settings.pomodoro_cycles || 4,
        enable_sound: settings.enable_sound ?? true,
        notification_sound: settings.notification_sound || "default",
        pomodoro_sound: settings.pomodoro_sound || "pomodoro",
        enable_desktop_notifications: settings.enable_desktop_notifications ?? true,
        enable_task_notifications: settings.enable_task_notifications ?? true,
        task_notification_days: settings.task_notification_days || 3,
        enable_spotify: settings.enable_spotify ?? true,
        spotify_playlist_url: settings.spotify_playlist_url || null,
        enable_flip_clock: settings.enable_flip_clock ?? true,
        flip_clock_size: settings.flip_clock_size || "medium",
        flip_clock_color: settings.flip_clock_color || "#ff5722"
      }
    }

    const defaultSettings = {
      theme: "system",
      language: "pt",
      pomodoro_work_minutes: 25,
      pomodoro_break_minutes: 5,
      pomodoro_long_break_minutes: 15,
      pomodoro_cycles: 4,
      enable_sound: true,
      notification_sound: "default",
      pomodoro_sound: "pomodoro",
      enable_desktop_notifications: true,
      enable_task_notifications: true,
      task_notification_days: 3,
      enable_spotify: true,
      spotify_playlist_url: null,
      enable_flip_clock: true,
      flip_clock_size: "medium",
      flip_clock_color: "#ff5722"
    }

    await prisma.user_settings.create({
      data: {
        user_id: userId,
        ...defaultSettings
      }
    })

    return defaultSettings
  } catch (error) {
    console.error("Error getting user settings:", error)
    
    return {
      theme: "system",
      language: "pt",
      pomodoro_work_minutes: 25,
      pomodoro_break_minutes: 5,
      pomodoro_long_break_minutes: 15,
      pomodoro_cycles: 4,
      enable_sound: true,
      notification_sound: "default",
      pomodoro_sound: "pomodoro",
      enable_desktop_notifications: true,
      enable_task_notifications: true,
      task_notification_days: 3,
      enable_spotify: true,
      spotify_playlist_url: null,
      enable_flip_clock: true,
      flip_clock_size: "medium",
      flip_clock_color: "#ff5722"
    }
  }
}

export async function updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
  try {
    const updatedSettings = await prisma.user_settings.upsert({
      where: { user_id: userId },
      update: {
        theme: settings.theme,
        language: settings.language,
        pomodoro_work_minutes: settings.pomodoro_work_minutes,
        pomodoro_break_minutes: settings.pomodoro_break_minutes,
        pomodoro_long_break_minutes: settings.pomodoro_long_break_minutes,
        pomodoro_cycles: settings.pomodoro_cycles,
        enable_sound: settings.enable_sound,
        notification_sound: settings.notification_sound,
        pomodoro_sound: settings.pomodoro_sound,
        enable_desktop_notifications: settings.enable_desktop_notifications,
        enable_task_notifications: settings.enable_task_notifications,
        task_notification_days: settings.task_notification_days,
        enable_spotify: settings.enable_spotify,
        spotify_playlist_url: settings.spotify_playlist_url,
        enable_flip_clock: settings.enable_flip_clock,
        flip_clock_size: settings.flip_clock_size,
        flip_clock_color: settings.flip_clock_color,
        updated_at: new Date()
      },
      create: {
        user_id: userId,
        theme: settings.theme || "system",
        language: settings.language || "pt",
        pomodoro_work_minutes: settings.pomodoro_work_minutes || 25,
        pomodoro_break_minutes: settings.pomodoro_break_minutes || 5,
        pomodoro_long_break_minutes: settings.pomodoro_long_break_minutes || 15,
        pomodoro_cycles: settings.pomodoro_cycles || 4,
        enable_sound: settings.enable_sound ?? true,
        notification_sound: settings.notification_sound || "default",
        pomodoro_sound: settings.pomodoro_sound || "pomodoro",
        enable_desktop_notifications: settings.enable_desktop_notifications ?? true,
        enable_task_notifications: settings.enable_task_notifications ?? true,
        task_notification_days: settings.task_notification_days || 3,
        enable_spotify: settings.enable_spotify ?? true,
        spotify_playlist_url: settings.spotify_playlist_url || null,
        enable_flip_clock: settings.enable_flip_clock ?? true,
        flip_clock_size: settings.flip_clock_size || "medium",
        flip_clock_color: settings.flip_clock_color || "#ff5722"
      }
    })

    return {
      theme: updatedSettings.theme || "system",
      language: updatedSettings.language || "pt",
      pomodoro_work_minutes: updatedSettings.pomodoro_work_minutes || 25,
      pomodoro_break_minutes: updatedSettings.pomodoro_break_minutes || 5,
      pomodoro_long_break_minutes: updatedSettings.pomodoro_long_break_minutes || 15,
      pomodoro_cycles: updatedSettings.pomodoro_cycles || 4,
      enable_sound: updatedSettings.enable_sound ?? true,
      notification_sound: updatedSettings.notification_sound || "default",
      pomodoro_sound: updatedSettings.pomodoro_sound || "pomodoro",
      enable_desktop_notifications: updatedSettings.enable_desktop_notifications ?? true,
      enable_task_notifications: updatedSettings.enable_task_notifications ?? true,
      task_notification_days: updatedSettings.task_notification_days || 3,
      enable_spotify: updatedSettings.enable_spotify ?? true,
      spotify_playlist_url: updatedSettings.spotify_playlist_url || null,
      enable_flip_clock: updatedSettings.enable_flip_clock ?? true,
      flip_clock_size: updatedSettings.flip_clock_size || "medium",
      flip_clock_color: updatedSettings.flip_clock_color || "#ff5722"
    }
  } catch (error) {
    console.error("Error updating user settings:", error)
    throw error
  }
}

export async function createUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
  try {
    const newSettings = await prisma.user_settings.create({
      data: {
        user_id: userId,
        theme: settings.theme || "system",
        language: settings.language || "pt",
        pomodoro_work_minutes: settings.pomodoro_work_minutes || 25,
        pomodoro_break_minutes: settings.pomodoro_break_minutes || 5,
        pomodoro_long_break_minutes: settings.pomodoro_long_break_minutes || 15,
        pomodoro_cycles: settings.pomodoro_cycles || 4,
        enable_sound: settings.enable_sound ?? true,
        notification_sound: settings.notification_sound || "default",
        pomodoro_sound: settings.pomodoro_sound || "pomodoro",
        enable_desktop_notifications: settings.enable_desktop_notifications ?? true,
        enable_task_notifications: settings.enable_task_notifications ?? true,
        task_notification_days: settings.task_notification_days || 3,
        enable_spotify: settings.enable_spotify ?? true,
        spotify_playlist_url: settings.spotify_playlist_url || null,
        enable_flip_clock: settings.enable_flip_clock ?? true,
        flip_clock_size: settings.flip_clock_size || "medium",
        flip_clock_color: settings.flip_clock_color || "#ff5722"
      }
    })

    return {
      theme: newSettings.theme || "system",
      language: newSettings.language || "pt",
      pomodoro_work_minutes: newSettings.pomodoro_work_minutes || 25,
      pomodoro_break_minutes: newSettings.pomodoro_break_minutes || 5,
      pomodoro_long_break_minutes: newSettings.pomodoro_long_break_minutes || 15,
      pomodoro_cycles: newSettings.pomodoro_cycles || 4,
      enable_sound: newSettings.enable_sound ?? true,
      notification_sound: newSettings.notification_sound || "default",
      pomodoro_sound: newSettings.pomodoro_sound || "pomodoro",
      enable_desktop_notifications: newSettings.enable_desktop_notifications ?? true,
      enable_task_notifications: newSettings.enable_task_notifications ?? true,
      task_notification_days: newSettings.task_notification_days || 3,
      enable_spotify: newSettings.enable_spotify ?? true,
      spotify_playlist_url: newSettings.spotify_playlist_url || null,
      enable_flip_clock: newSettings.enable_flip_clock ?? true,
      flip_clock_size: newSettings.flip_clock_size || "medium",
      flip_clock_color: newSettings.flip_clock_color || "#ff5722"
    }
  } catch (error) {
    console.error("Error creating user settings:", error)
    throw error
  }
}

