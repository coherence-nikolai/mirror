import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title:       'Mirror',
  description: 'A state translation instrument.',
  viewport:    'width=device-width, initial-scale=1, viewport-fit=cover',
  themeColor:  '#080a0e',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
