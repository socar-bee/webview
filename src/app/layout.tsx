import type { Metadata, Viewport } from 'next'

import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import './globals.css'

import QueryProvider from '@/shared/providers/QueryProvider'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
}

export const metadata: Metadata = {
  title: '모두의주차장',
  description: '주차장 검색부터 주차권 구매까지, 모두의주차장',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon.ico'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="font-sans">
        <QueryProvider>
          <div className="mx-auto h-dvh w-full max-w-[480px] overflow-hidden shadow-[0_0_12px_rgba(0,0,0,0.04)]">
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
