import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export type UserSettings = {
  theme: string
  language: string
  pomodoro_work_minutes: number
  pomodoro_break_minutes: number
  pomodoro_long_break_minutes: number
  pomodoro_cycles: number
  enable_sound: boolean
  notification_sound: string
  enable_desktop_notifications: boolean
}

export async function getUserSettings(userId: number): Promise<UserSettings> {
  try {
    // A coluna language já existe, então não precisamos verificar ou adicioná-la

    const settings = await sql`
      SELECT * FROM user_settings
      WHERE user_id = ${userId}
    `

    if (settings && settings.length > 0) {
      return settings[0]
    }

    // Create default settings if none exist
    const defaultSettings = {
      theme: "system",
      language: "en",
      pomodoro_work_minutes: 25,
      pomodoro_break_minutes: 5,
      pomodoro_long_break_minutes: 15,
      pomodoro_cycles: 4,
      enable_sound: true,
      notification_sound: "default",
      enable_desktop_notifications: true,
    }

    await sql`
      INSERT INTO user_settings (
        user_id, 
        theme,
        language,
        pomodoro_work_minutes, 
        pomodoro_break_minutes, 
        pomodoro_long_break_minutes, 
        pomodoro_cycles,
        enable_sound,
        notification_sound,
        enable_desktop_notifications
      )
      VALUES (
        ${userId}, 
        ${defaultSettings.theme},
        ${defaultSettings.language},
        ${defaultSettings.pomodoro_work_minutes}, 
        ${defaultSettings.pomodoro_break_minutes}, 
        ${defaultSettings.pomodoro_long_break_minutes}, 
        ${defaultSettings.pomodoro_cycles},
        ${defaultSettings.enable_sound},
        ${defaultSettings.notification_sound},
        ${defaultSettings.enable_desktop_notifications}
      )
    `

    return defaultSettings
  } catch (error) {
    console.error("Error getting user settings:", error)

    // Return default settings if there's an error
    return {
      theme: "system",
      language: "en",
      pomodoro_work_minutes: 25,
      pomodoro_break_minutes: 5,
      pomodoro_long_break_minutes: 15,
      pomodoro_cycles: 4,
      enable_sound: true,
      notification_sound: "default",
      enable_desktop_notifications: true,
    }
  }
}

export async function updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
  const now = new Date().toISOString()

  const updatedSettings = await sql`
    UPDATE user_settings
    SET
      theme = COALESCE(${settings.theme}, theme),
      language = COALESCE(${settings.language}, language),
      pomodoro_work_minutes = COALESCE(${settings.pomodoro_work_minutes}, pomodoro_work_minutes),
      pomodoro_break_minutes = COALESCE(${settings.pomodoro_break_minutes}, pomodoro_break_minutes),
      pomodoro_long_break_minutes = COALESCE(${settings.pomodoro_long_break_minutes}, pomodoro_long_break_minutes),
      pomodoro_cycles = COALESCE(${settings.pomodoro_cycles}, pomodoro_cycles),
      enable_sound = COALESCE(${settings.enable_sound}, enable_sound),
      notification_sound = COALESCE(${settings.notification_sound}, notification_sound),
      enable_desktop_notifications = COALESCE(${settings.enable_desktop_notifications}, enable_desktop_notifications),
      updated_at = ${now}
    WHERE user_id = ${userId}
    RETURNING *
  `

  return updatedSettings[0]
}

