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

// Função para verificar e criar a tabela user_settings se não existir
async function ensureUserSettingsTable() {
  try {
    // Verificar se a tabela existe
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_settings'
      );
    `;

    if (!tableExists[0].exists) {
      console.log("Creating user_settings table...");
      
      await sql`
        CREATE TABLE user_settings (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL UNIQUE,
          theme VARCHAR(20) NOT NULL DEFAULT 'system',
          language VARCHAR(5) NOT NULL DEFAULT 'en',
          pomodoro_work_minutes INTEGER NOT NULL DEFAULT 25,
          pomodoro_break_minutes INTEGER NOT NULL DEFAULT 5,
          pomodoro_long_break_minutes INTEGER NOT NULL DEFAULT 15,
          pomodoro_cycles INTEGER NOT NULL DEFAULT 4,
          enable_sound BOOLEAN NOT NULL DEFAULT true,
          notification_sound VARCHAR(50) NOT NULL DEFAULT 'default',
          enable_desktop_notifications BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `;
      
      console.log("user_settings table created successfully");
    }
  } catch (error) {
    console.error("Error ensuring user_settings table:", error);
  }
}

export async function getUserSettings(userId: number): Promise<UserSettings> {
  try {
    await ensureUserSettingsTable();

    const settings = await sql`
      SELECT * FROM user_settings
      WHERE user_id = ${userId}
    `

    if (settings && settings.length > 0) {
      return settings[0] as UserSettings;
    }

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
  try {
    await ensureUserSettingsTable();
    
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

    if (updatedSettings && updatedSettings.length > 0) {
      return updatedSettings[0] as UserSettings;
    }
    
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
      ...settings 
    }

    const newSettings = await sql`
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
        enable_desktop_notifications,
        updated_at
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
        ${defaultSettings.enable_desktop_notifications},
        ${now}
      )
      RETURNING *
    `

    return newSettings[0] as UserSettings;
  } catch (error) {
    console.error("Error updating user settings:", error)
    throw error;
  }
}

