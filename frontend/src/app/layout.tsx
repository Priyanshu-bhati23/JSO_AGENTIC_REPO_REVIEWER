import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JSO Portfolio Agent — Code Evaluation Intelligence',
  description: 'AI-powered GitHub repository evaluation for technical recruitment on the JSO platform.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-ink text-ink-50 font-body antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
