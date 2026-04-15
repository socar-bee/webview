'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useAuthStore } from '@/shared/stores/authStore'

import { authModel } from './model'

export function useLoginViewModel() {
  const router = useRouter()
  const { setTokens, setProfile } = useAuthStore()

  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요')
      return
    }
    setError('')
    setIsLoading(true)

    try {
      const res = await authModel.login({
        email,
        password,
        deviceType: 'android',
        deviceToken: 'web',
        version: '2.0.0'
      })
      setTokens(res.accessToken, res.refreshToken, res.userVerificationId)

      try {
        const profile = await authModel.getProfile(res.accessToken)
        setProfile(profile)
      } catch {
        /* profile fetch 실패해도 로그인은 성공 */
      }

      router.push('/')
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const openEmailForm = () => setShowEmailForm(true)

  const closeEmailForm = () => {
    setShowEmailForm(false)
    setError('')
  }

  return {
    showEmailForm,
    email,
    setEmail,
    password,
    setPassword,
    error,
    isLoading,
    handleEmailLogin,
    openEmailForm,
    closeEmailForm
  }
}
