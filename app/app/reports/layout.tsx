import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reports | Íris",
  description: "Generate and download reports of your tasks and activities",
}

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
} 