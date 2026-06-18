import axios from 'axios'

import { getCookie } from '@/utils/getCookie'

// baseURL: 로컬 dev는 vite proxy('/api')로 CORS 우회, 배포는 VITE_API_BASE_URL
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api'
})

// 앱이 주입한 토큰 쿠키(modu-access-token) → Authorization: Bearer 헤더
apiClient.interceptors.request.use((config) => {
  const token = getCookie('modu-access-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
