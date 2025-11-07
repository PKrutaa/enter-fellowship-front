import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ENTER - Extração de PDFs com IA',
  description: 'Sistema de extração estruturada de dados de PDFs com Agentes de IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  )
}

