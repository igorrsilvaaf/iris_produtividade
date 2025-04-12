import type { Metadata, Viewport } from "next"
import { CHANGELOG_DATA } from "@/lib/changelog-data"

// Get the current version from the changelog for other uses if needed
const currentVersion = CHANGELOG_DATA[0]?.version || ""
const appTitle = "Íris"

export const metadata: Metadata = {
  title: appTitle,
  description: "Organize suas tarefas com facilidade. Inclui temporizador Pomodoro, modo escuro e muito mais.",
  generator: 'Next.js',
  applicationName: appTitle,
  referrer: 'origin-when-cross-origin',
  keywords: ['íris', 'to-do', 'tarefas', 'lista', 'produtividade', 'pomodoro'],
  authors: [{ name: 'Íris Team' }],
  creator: 'Íris Team',
  publisher: 'Íris',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png' },
    ],
    other: [
      { 
        rel: 'apple-touch-icon', 
        url: '/icons/apple-touch-icon.png' 
      },
    ],
  },
  openGraph: {
    type: "website",
    title: appTitle,
    description: "Organize suas tarefas com facilidade",
    url: "/",
    images: [
      {
        url: "/icons/android-chrome-512x512.png",
        width: 512,
        height: 512,
      },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' },
  ],
} 