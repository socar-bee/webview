import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'

import type { RouteObject } from 'react-router'

const PaymentPage = lazy(() => import('@/pages/payment/PaymentPage'))
const PaymentCompletePage = lazy(() => import('@/pages/payment/PaymentCompletePage'))

// 진입: /?type=monthly&seq=123 (앱이 식별자만 전달)
const routes: RouteObject[] = [
  { path: '/', index: true, Component: PaymentPage },
  { path: '/payment', Component: PaymentPage },
  { path: '/payment/complete', Component: PaymentCompletePage }
]

const router = createBrowserRouter(routes)

export default router
