'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import DockBar from '@/shared/components/layout/DockBar'
import MapPinLoader from '@/shared/components/map/MapPinLoader'
import { type SheetSnap } from '@/shared/components/ui/AnimationSheet'

import type { ParkingLotDetail, ParkingLotType } from '@/shared/types/parking'
import { ParkingLotType as PLType } from '@/shared/types/parking'

import ParkingDetailSheet, { type ParkingDetailData } from '@/app/(tabs)/map/view/ParkingDetailSheet'
import { useMapViewModel } from '@/app/(tabs)/map/viewmodel'

interface PartnerDetailViewProps {
  seq: number
  initialDetail?: ParkingLotDetail
}

export default function PartnerDetailView({ seq, initialDetail }: PartnerDetailViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  // ?snap=full 로 진입 시 시트를 full로 시작 (예: 주차권 상세 → 뒤로가기)
  const initialSnap: SheetSnap = searchParams?.get('snap') === 'full' ? 'full' : 'peek'
  const [detailSnap, setDetailSnap] = useState<SheetSnap>(initialSnap)
  const [detailOpen, setDetailOpen] = useState(false)

  const needPanRef = useRef(false)

  const lat = initialDetail?.basic.latitude
  const lng = initialDetail?.basic.longitude

  const parkingData: ParkingDetailData = {
    seq,
    name: initialDetail?.basic.name ?? '',
    isPartner: initialDetail?.basic.partnerStatus,
    parkingType: 'P' as ParkingLotType
  }

  // hash 동기화
  useEffect(() => {
    const sync = () => setDetailOpen(window.location.hash === '#sheet=1')
    sync()
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  // 최초 진입 시 sheet 열기
  useEffect(() => {
    if (window.location.hash !== '#sheet=1') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#sheet=1`)
    }
    setDetailOpen(true)
  }, [])

  const closeSheet = () => {
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#sheet=0`)
    setDetailOpen(false)
  }

  // sheet 닫힐 때 snap 초기화
  useEffect(() => {
    if (!detailOpen) setDetailSnap('peek')
  }, [detailOpen])

  const vm = useMapViewModel({
    onMapClick: () => {
      if (!detailOpen) return
      if (detailSnap !== 'peek') {
        setDetailSnap('peek')
      } else {
        closeSheet()
      }
    },
    searchCoords: lat && lng ? { lat, lng } : null,
    onPinClick: (data: ParkingDetailData) => {
      if (data.parkingType === PLType.SHARE) return
      // 핀 클릭은 JS 이벤트 → 크롤러 못 따라감 → /map SPA로 전환하여 UX 확보
      router.push(`/map?type=${data.parkingType ?? 'P'}&id=${data.seq}#sheet=1`)
    }
  })

  // sheet 닫힐 때 선택 마커 초기화
  const clearSelectedPin = vm.clearSelectedPin
  useEffect(() => {
    if (!detailOpen) clearSelectedPin()
  }, [detailOpen, clearSelectedPin])

  // 최초 로드 후 해당 주차장 핀 선택
  const selectPin = vm.selectPin
  useEffect(() => {
    selectPin(seq)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // detail 로드 완료 시 좌표 수신 → URL 직접 진입 시 지도 이동
  const centerOnLatLng = vm.centerOnLatLng
  const handleLocationKnown = useCallback(
    (lat: number, lng: number) => {
      if (!needPanRef.current) return
      needPanRef.current = false
      centerOnLatLng(lat, lng)
    },
    [centerOnLatLng]
  )

  // 지도 스크립트 로드 + initMap
  useEffect(() => {
    if (window.naver?.maps) {
      vm.initMap()
      return
    }
    const script = document.createElement('script')
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${process.env.NEXT_PUBLIC_NAVER_MAPS_KEY}&submodules=geocoder`
    script.async = true
    script.onload = () => vm.initMap()
    document.head.appendChild(script)
    return () => {
      if (script.parentNode) document.head.removeChild(script)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex h-full flex-col">
      <main className="relative min-h-0 flex-1">
        {/* Search Bar */}
        <div className="absolute top-0 left-0 z-(--z-map-ui) flex w-full flex-col gap-2.5 px-4 pt-2">
          <Link
            href="/search"
            className="rounded-10 bg-bg-white shadow-02 flex h-12 w-full cursor-pointer items-center gap-2.5 px-4"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#A3A3A3" strokeWidth="1.8" />
              <path d="M16 16L20 20" stroke="#A3A3A3" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span className="text-text-soft" style={{ fontSize: 'var(--font-size-b4)' }}>
              목적지 또는 주소 검색
            </span>
          </Link>
        </div>

        {/* 풀스크린 지도 (useMapViewModel은 id="map"을 찾음) */}
        <div id="map" className="size-full" />

        {/* Loading — 정중앙 Lottie 애니메이션 */}
        <MapPinLoader show={vm.isLoading} />

        {/* ParkingDetailSheet */}
        <ParkingDetailSheet
          isOpen={detailOpen}
          snap={detailSnap}
          onSnapChange={setDetailSnap}
          onClose={closeSheet}
          data={parkingData}
          onLocationKnown={handleLocationKnown}
        />
      </main>
      <DockBar />
    </div>
  )
}
