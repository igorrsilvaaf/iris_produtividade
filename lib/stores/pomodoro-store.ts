import { create } from "zustand"
import { persist } from "zustand/middleware"

type TimerMode = "work" | "shortBreak" | "longBreak"

interface PomodoroState {
  isRunning: boolean
  mode: TimerMode
  timeLeft: number
  cycles: number
  lastUpdate: number
  settings: {
    workMinutes: number
    shortBreakMinutes: number
    longBreakMinutes: number
    longBreakInterval: number
    enableSound: boolean
    notificationSound: string
    pomodoroSound: string
    enableDesktopNotifications: boolean
  }
  toggleTimer: () => void
  resetTimer: () => void
  setMode: (mode: TimerMode) => void
  updateSettings: (settings: PomodoroState["settings"]) => void
  setTimeLeft: (timeLeft: number) => void
  setCycles: (cycles: number) => void
  setIsRunning: (isRunning: boolean) => void
  updateLastUpdate: () => void
}

const DEFAULT_SETTINGS = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  enableSound: true,
  notificationSound: "bell",
  pomodoroSound: "pomodoro",
  enableDesktopNotifications: true,
}

const getInitialTimeLeft = (mode: TimerMode, settings: PomodoroState["settings"]) => {
  switch (mode) {
    case "work":
      return settings.workMinutes * 60
    case "shortBreak":
      return settings.shortBreakMinutes * 60
    case "longBreak":
      return settings.longBreakMinutes * 60
  }
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      mode: "work",
      timeLeft: DEFAULT_SETTINGS.workMinutes * 60,
      cycles: 0,
      lastUpdate: Date.now(),
      settings: DEFAULT_SETTINGS,
      toggleTimer: () => {
        const state = get()
        set({ isRunning: !state.isRunning })
      },
      resetTimer: () => {
        const state = get()
        const newTimeLeft = getInitialTimeLeft(state.mode, state.settings)
        set({
          isRunning: false,
          timeLeft: newTimeLeft,
        })
      },
      setMode: (mode) => {
        const state = get()
        const newTimeLeft = getInitialTimeLeft(mode, state.settings)
        set({
          mode,
          timeLeft: newTimeLeft,
          isRunning: false,
        })
      },
      updateSettings: (settings) => {
        const state = get()
        const newTimeLeft = getInitialTimeLeft(state.mode, settings)
        set({ 
          settings,
          timeLeft: newTimeLeft,
          isRunning: false,
        })
      },
      setTimeLeft: (timeLeft) => {
        const validTimeLeft = Number.isFinite(timeLeft) ? Math.max(0, timeLeft) : 0
        set({ timeLeft: validTimeLeft })
      },
      setCycles: (cycles) => set({ cycles }),
      setIsRunning: (isRunning) => set({ isRunning }),
      updateLastUpdate: () => set({ lastUpdate: Date.now() }),
    }),
    {
      name: "pomodoro-storage",
    },
  ),
) 