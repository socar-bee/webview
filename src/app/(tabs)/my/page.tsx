'use client'

import { useAuthStore } from '@/shared/stores/authStore'

import LoginView from '../login/view'

export default function MyPage() {
  const { isLoggedIn } = useAuthStore()

  if (!isLoggedIn) return <LoginView />

  return (
    <main className="flex min-h-full items-center justify-center">
      <h1 className="text-text-strong text-[20px] font-bold">MY</h1>
    </main>
  )
}
