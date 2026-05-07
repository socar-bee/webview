'use client'

import { useAuthStore } from '@/shared/stores/authStore'

import LoginView from '../login/view'

import MyView from './view'

export default function MyPage() {
  const { isLoggedIn } = useAuthStore()

  if (!isLoggedIn) return <LoginView />

  return <MyView />
}
