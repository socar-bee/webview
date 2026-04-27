'use client'

import Lottie from 'lottie-react'

import loadingAnimation from '@/shared/assets/lottie/loadingAnimation.json'

interface MapPinLoaderProps {
  /** 표시 여부 */
  show: boolean
  /** 애니메이션 크기(px) */
  size?: number
}

/**
 * 지도 핀 조회 중 정중앙에 노출되는 로딩 애니메이션.
 * 부모는 relative + 풀스크린 지도 컨테이너여야 함 (z-[var(--z-map-ui)]로 지도 위에 떠 있음).
 * pointer-events-none으로 지도 인터랙션을 가로막지 않음.
 */
export default function MapPinLoader({ show, size = 96 }: MapPinLoaderProps) {
  if (!show) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-[var(--z-map-ui)] flex items-center justify-center">
      <Lottie animationData={loadingAnimation} loop autoplay style={{ width: size, height: size }} />
    </div>
  )
}
