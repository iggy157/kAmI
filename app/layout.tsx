import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import ErrorBoundary from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'kAmI - 神様生成開宗SNS',
  description: '神様を作成し、対話し、信仰を深める宗教SNS',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body>
        <ErrorBoundary>
          {children}
          <Toaster richColors position="top-right" />
        </ErrorBoundary>
      </body>
    </html>
  )
}
