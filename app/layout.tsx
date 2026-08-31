import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Diagnóstico UNISOL Brasil',
  description: 'Diagnóstico participativo dos empreendimentos — CooperaMais / UNISOL Brasil',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Diagnóstico UNISOL',
  },
}

export const viewport: Viewport = {
  themeColor: '#1B5E37',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
