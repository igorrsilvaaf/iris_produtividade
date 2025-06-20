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
          pomodoro_sound VARCHAR(50) NOT NULL DEFAULT 'pomodoro',
          enable_desktop_notifications BOOLEAN NOT NULL DEFAULT true,
          enable_task_notifications BOOLEAN NOT NULL DEFAULT true,
          task_notification_days INTEGER NOT NULL DEFAULT 3,
          enable_spotify BOOLEAN NOT NULL DEFAULT true,
          spotify_playlist_url TEXT,
          enable_flip_clock BOOLEAN NOT NULL DEFAULT true,
          flip_clock_size VARCHAR(20) NOT NULL DEFAULT 'medium',
          flip_clock_color VARCHAR(20) NOT NULL DEFAULT '#ff5722',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `;
      

    } else {
      // Verificar se as colunas existem
      const columnsExist = await sql`
        SELECT 
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='enable_task_notifications') as enable_task_notifications_exists,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='task_notification_days') as task_notification_days_exists,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='pomodoro_sound') as pomodoro_sound_exists,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='spotify_playlist_url') as spotify_playlist_url_exists,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='enable_spotify') as enable_spotify_exists,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='enable_flip_clock') as enable_flip_clock_exists,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='flip_clock_size') as flip_clock_size_exists,
          EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='user_settings' AND column_name='flip_clock_color') as flip_clock_color_exists
      `;
      
      if (!columnsExist[0].enable_task_notifications_exists) {

        await sql`ALTER TABLE user_settings ADD COLUMN enable_task_notifications BOOLEAN NOT NULL DEFAULT true`;
      }
      
      if (!columnsExist[0].task_notification_days_exists) {

        await sql`ALTER TABLE user_settings ADD COLUMN task_notification_days INTEGER NOT NULL DEFAULT 3`;
      }
      
      if (!columnsExist[0].pomodoro_sound_exists) {

        await sql`ALTER TABLE user_settings ADD COLUMN pomodoro_sound VARCHAR(50) NOT NULL DEFAULT 'pomodoro'`;
      }
      
      if (!columnsExist[0].spotify_playlist_url_exists) {

        await sql`ALTER TABLE user_settings ADD COLUMN spotify_playlist_url TEXT`;
      }
      
      if (!columnsExist[0].enable_spotify_exists) {

        await sql`ALTER TABLE user_settings ADD COLUMN enable_spotify BOOLEAN NOT NULL DEFAULT true`;
      }
      
      if (!columnsExist[0].enable_flip_clock_exists) {

        await sql`ALTER TABLE user_settings ADD COLUMN enable_flip_clock BOOLEAN NOT NULL DEFAULT true`;
      }
      
      if (!columnsExist[0].flip_clock_size_exists) {

        await sql`ALTER TABLE user_settings ADD COLUMN flip_clock_size VARCHAR(20) NOT NULL DEFAULT 'medium'`;
      }
      
      if (!columnsExist[0].flip_clock_color_exists) {

        await sql`ALTER TABLE user_settings ADD COLUMN flip_clock_color VARCHAR(20) NOT NULL DEFAULT '#ff5722'`;
      }
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
        pomodoro_sound,
        enable_desktop_notifications,
        enable_task_notifications,
        task_notification_days,
        enable_spotify,
        spotify_playlist_url,
        enable_flip_clock,
        flip_clock_size,
        flip_clock_color
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
        ${defaultSettings.pomodoro_sound},
        ${defaultSettings.enable_desktop_notifications},
        ${defaultSettings.enable_task_notifications},
        ${defaultSettings.task_notification_days},
        ${defaultSettings.enable_spotify},
        ${defaultSettings.spotify_playlist_url},
        ${defaultSettings.enable_flip_clock},
        ${defaultSettings.flip_clock_size},
        ${defaultSettings.flip_clock_color}
      )
    `

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
        pomodoro_sound = COALESCE(${settings.pomodoro_sound}, pomodoro_sound),
        enable_desktop_notifications = COALESCE(${settings.enable_desktop_notifications}, enable_desktop_notifications),
        enable_task_notifications = COALESCE(${settings.enable_task_notifications}, enable_task_notifications),
        task_notification_days = COALESCE(${settings.task_notification_days}, task_notification_days),
        enable_spotify = COALESCE(${settings.enable_spotify}, enable_spotify),
        spotify_playlist_url = COALESCE(${settings.spotify_playlist_url}, spotify_playlist_url),
        enable_flip_clock = COALESCE(${settings.enable_flip_clock}, enable_flip_clock),
        flip_clock_size = COALESCE(${settings.flip_clock_size}, flip_clock_size),
        flip_clock_color = COALESCE(${settings.flip_clock_color}, flip_clock_color),
        updated_at = ${now}
      WHERE user_id = ${userId}
      RETURNING *
    `

    if (updatedSettings && updatedSettings.length > 0) {
      return updatedSettings[0] as UserSettings;
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
      flip_clock_color: "#ff5722",
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
        pomodoro_sound,
        enable_desktop_notifications,
        enable_task_notifications,
        task_notification_days,
        enable_spotify,
        spotify_playlist_url,
        enable_flip_clock,
        flip_clock_size,
        flip_clock_color,
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
        ${defaultSettings.pomodoro_sound},
        ${defaultSettings.enable_desktop_notifications},
        ${defaultSettings.enable_task_notifications},
        ${defaultSettings.task_notification_days},
        ${defaultSettings.enable_spotify},
        ${defaultSettings.spotify_playlist_url},
        ${defaultSettings.enable_flip_clock},
        ${defaultSettings.flip_clock_size},
        ${defaultSettings.flip_clock_color},
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

