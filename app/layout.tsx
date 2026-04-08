import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Start Empoderada',
  description: 'Sua transformação começa aqui',
}

export const viewport: Viewport = {
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0A0A0A] font-inter antialiased" style={{ overscrollBehavior: 'none' }}>
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
          {children}
        </div>
      </body>
    </html>
  )
}
