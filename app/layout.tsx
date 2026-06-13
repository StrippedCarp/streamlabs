import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StreamLab - VSCode Style Streaming Platform',
  description: 'Personal streaming platform with VSCode UI powered by Vidfast',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
