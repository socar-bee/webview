'use client'

import { useEffect } from 'react'

import DockBar from '@/shared/components/layout/DockBar'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload()
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  return (
    <div className="flex h-full flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      <DockBar />
    </div>
  )
}
