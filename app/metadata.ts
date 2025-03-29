import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "To-Do",
  description: "Organize suas tarefas com facilidade. Inclui temporizador Pomodoro, modo escuro e muito mais.",
  generator: 'Next.js',
  applicationName: 'To-Do',
  referrer: 'origin-when-cross-origin',
  keywords: ['to-do', 'tarefas', 'lista', 'produtividade', 'pomodoro'],
  authors: [{ name: 'To-Do Team' }],
  creator: 'To-Do Team',
  publisher: 'To-Do',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
    other: [
      { 
        rel: 'apple-touch-icon', 
        url: '/apple-icon.png' 
      },
    ],
  },
  openGraph: {
    type: "website",
    title: "To-Do",
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