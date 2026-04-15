'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import TimeFilterSheet, { formatDateLabel } from '@/shared/components/map/TimeFilterSheet'
import { type SheetSnap } from '@/shared/components/ui/AnimationSheet'
import { useHash } from '@/shared/hooks/useHash'

import ParkingDetailSheet, { type ParkingDetailData } from './components/ParkingDetailSheet'
import { useNearbyViewModel } from './viewmodel'

// TODO: 핀 클릭 시 실제 선택된 주차장 데이터로 교체
const MOCK_PARKING: ParkingDetailData = {
  seq: 1,
  name: '서울숲 디타워주차장',
  type: '제휴',
  capacity: 9999
}

// hash 키 (향후 다른 시트도 같은 hash 공간에 공존: detail=1, timefilter=1 ...)
const HASH_KEY = {
  DETAIL: 'detail',
  PARKING: 'parking'
} as const

export default function NearbyView() {
  // ─── Parking Detail Sheet 상태 ───
  // open/close 는 URL hash (#detail=1&parking={seq}) 로 제어 → 안드로이드 백버튼/공유 링크 대응.
  // snap(peek/half/full)은 history 오염 방지 위해 로컬 state로 둠.
  const { hash, set: setHash, back: hashBack } = useHash()
  const [detailSnap, setDetailSnap] = useState<SheetSnap>('peek')

  const detailOpen = hash[HASH_KEY.DETAIL] === '1'
  // TODO: hash[PARKING] (seq) → 실제 상세 데이터 fetch. 우선은 mock 매칭.
  const selectedParking: ParkingDetailData | null = detailOpen ? MOCK_PARKING : null

  // 지도 여백 탭 → 열려있는 상세 시트 닫기 (백버튼과 동일한 history.back 경로)
  const vm = useNearbyViewModel({
    onMapClick: () => {
      if (detailOpen) hashBack()
    }
  })

  const handleOpenDetail = () => {
    setHash({ [HASH_KEY.DETAIL]: '1', [HASH_KEY.PARKING]: MOCK_PARKING.seq })
    setDetailSnap('peek')
  }
  const handleCloseDetail = () => {
    hashBack()
  }

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
      document.head.removeChild(script)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const timeFilterLabel =
    vm.selectedDate && vm.selectedDurationId && vm.timeFilterOptions
      ? `${formatDateLabel(vm.selectedDate)} · ${vm.timeFilterOptions.durations.find((d) => d.id === vm.selectedDurationId)?.label ?? ''}`
      : null

  return (
    <div className="relative h-full w-full">
      {/* Search Bar + Filter Chips */}
      <div className="absolute top-0 left-0 z-[var(--z-map-ui)] flex w-full flex-col gap-2.5 px-4 pt-2">
        <Link href="/search" className="rounded-10 bg-bg-white shadow-02 flex h-12 w-full items-center gap-2.5 px-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#A3A3A3" strokeWidth="1.8" />
            <path d="M16 16L20 20" stroke="#A3A3A3" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="text-text-soft" style={{ fontSize: 'var(--font-size-b4)' }}>
            목적지 또는 주소 검색
          </span>
        </Link>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 px-1">
          {timeFilterLabel && (
            <button
              onClick={vm.openTimeFilter}
              className="border-primary bg-primary text-static-white inline-flex min-h-[34px] shrink-0 items-center justify-center rounded-full border px-3 py-1 text-[13px] font-medium whitespace-nowrap"
            >
              {timeFilterLabel}
            </button>
          )}
          <button className="border-stroke-soft bg-bg-white text-text-strong inline-flex min-h-[34px] shrink-0 items-center justify-center rounded-full border px-3 py-1 text-[13px] font-medium whitespace-nowrap">
            구매 가능
          </button>
          {/* TODO(임시): 상세 시트 오픈 테스트용. 핀 클릭 핸들러로 연결 예정 */}
          <button
            onClick={handleOpenDetail}
            className="border-stroke-soft bg-bg-white text-text-strong inline-flex min-h-[34px] shrink-0 items-center justify-center rounded-full border px-3 py-1 text-[13px] font-medium whitespace-nowrap"
          >
            상세보기(테스트)
          </button>
        </div>
      </div>

      {/* Map */}
      <div id="nearby-map" className="size-full" />

      {/* Current Location */}
      <button
        onClick={vm.moveToCurrentLocation}
        className="bg-bg-white shadow-02 absolute right-4 bottom-4 z-[var(--z-map-ui)] flex size-10 items-center justify-center rounded-full"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" fill="#0099FF" />
          <circle cx="12" cy="12" r="8" stroke="#0099FF" strokeWidth="1.5" />
          <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="#0099FF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Loading */}
      {vm.isLoading && (
        <div className="bg-bg-white shadow-02 absolute top-[108px] left-1/2 z-[var(--z-map-ui)] -translate-x-1/2 rounded-full px-4 py-2">
          <span className="text-text-sub" style={{ fontSize: 'var(--font-size-c2)' }}>
            주차장 검색중...
          </span>
        </div>
      )}

      {/* Time Filter Bottom Sheet */}
      {vm.timeFilterOptions && (
        <TimeFilterSheet
          isOpen={vm.isTimeFilterOpen}
          options={vm.timeFilterOptions}
          selectedDate={vm.selectedDate}
          selectedDurationId={vm.selectedDurationId}
          onDateChange={vm.setSelectedDate}
          onDurationChange={vm.setSelectedDurationId}
          onClose={vm.closeTimeFilter}
          onConfirm={vm.handleTimeFilterConfirm}
        />
      )}

      {/* Parking Detail Sheet (peek → half → full) */}
      <ParkingDetailSheet
        isOpen={detailOpen}
        snap={detailSnap}
        onSnapChange={setDetailSnap}
        onClose={handleCloseDetail}
        data={selectedParking}
      />
    </div>
  )
}
