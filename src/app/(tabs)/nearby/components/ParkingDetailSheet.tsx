'use client'

import { useState } from 'react'

import AnimationSheet, { type SheetSnap } from '@/shared/components/ui/AnimationSheet'

type TabKey = 'tickets' | 'info' | 'recommend' | 'nearby'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'tickets', label: '주차권' },
  { key: 'info', label: '정보' },
  { key: 'recommend', label: '추천' },
  { key: 'nearby', label: '주변' }
]

export interface ParkingDetailData {
  seq: number
  name: string
  type: string // '제휴' | '공영' 등
  capacity: number
}

interface ParkingDetailSheetProps {
  isOpen: boolean
  snap: SheetSnap
  onSnapChange: (s: SheetSnap) => void
  onClose: () => void
  data: ParkingDetailData | null
}

export default function ParkingDetailSheet({ isOpen, snap, onSnapChange, onClose, data }: ParkingDetailSheetProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('tickets')

  if (!data) return null

  return (
    <AnimationSheet
      isOpen={isOpen}
      snap={snap}
      onSnapChange={onSnapChange}
      onClose={onClose}
      peekHeight={96}
      halfRatio={0.45}
      navigationBar={<NavigationBar title={data.name} onBack={() => onSnapChange('half')} />}
      peek={<PeekBar data={data} onExpand={() => onSnapChange('half')} />}
    >
      <div className="flex flex-col">
        {/* 사진 영역 (half 부터 노출) */}
        <div className="grid grid-cols-2 gap-0.5 px-0">
          <div className="bg-bg-soft aspect-[4/3]" />
          <div className="bg-bg-soft aspect-[4/3]" />
        </div>

        {/* Sticky 탭 헤더 */}
        <div className="border-stroke-soft bg-bg-white sticky top-0 z-10 border-b">
          <div className="flex">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex-1 py-3.5 text-[15px] font-semibold transition-colors ${
                    isActive ? 'text-text-strong' : 'text-text-soft'
                  }`}
                >
                  {tab.label}
                  {isActive && <span className="bg-primary absolute inset-x-4 bottom-0 h-0.5 rounded-full" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-4 pt-4 pb-[120px]">
          {activeTab === 'tickets' && <TicketsTab />}
          {activeTab === 'info' && <InfoTab />}
          {activeTab === 'recommend' && <RecommendTab />}
          {activeTab === 'nearby' && <NearbyTab />}
        </div>
      </div>

      {/* 지도보기 고정 CTA */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
        <button
          onClick={() => onSnapChange('peek')}
          className="bg-primary text-static-white shadow-02 pointer-events-auto flex h-11 items-center gap-1.5 rounded-full px-5 text-[14px] font-semibold"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          지도보기
        </button>
      </div>
    </AnimationSheet>
  )
}

/* ─── Navigation bar (full 진입 시 상단) ─── */
function NavigationBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex h-12 items-center justify-between px-2">
      <button onClick={onBack} className="flex size-10 items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#171717" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h2 className="text-text-strong text-[16px] font-bold">{title}</h2>
      <div className="size-10" />
    </div>
  )
}

/* ─── Peek bar (항상 노출) ─── */
function PeekBar({ data, onExpand }: { data: ParkingDetailData; onExpand: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 pt-1 pb-4" onClick={onExpand}>
      <div className="min-w-0 flex-1">
        <h3 className="text-text-strong truncate text-[17px] font-bold">{data.name}</h3>
        <p className="text-text-soft mt-0.5 text-[13px]">
          {data.type} · {data.capacity.toLocaleString()}면
        </p>
      </div>
      <button
        onClick={(e) => e.stopPropagation()}
        className="bg-primary text-static-white flex size-11 shrink-0 items-center justify-center rounded-full"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3L21 12L12 21M21 12H3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}

/* ─── Tabs (임시 목업 content) ─── */

function TicketsTab() {
  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-10 bg-bg-soft flex items-center justify-between px-4 py-3">
        <span className="text-text-strong text-[14px]">
          입차 시간 <strong className="text-primary ml-1">3.20(수) · 1시간</strong>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 6L15 12L9 18" stroke="#A3A3A3" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      {[
        { name: '평일 2시간권', price: 11000 },
        { name: '평일 5시간권', price: 14000 },
        { name: '평일 5시간권', price: 14000 }
      ].map((t, i) => (
        <div key={i} className="rounded-10 border-stroke-soft flex items-start justify-between border p-4">
          <div className="flex flex-col gap-1">
            <span className="text-text-strong text-[15px] font-semibold">{t.name}</span>
            <span className="text-text-strong text-[17px] font-bold">{t.price.toLocaleString()}원</span>
            <span className="text-text-soft mt-1 text-[12px]">
              <span className="bg-primary/10 text-primary mr-1 rounded-sm px-1 py-px text-[11px] font-semibold">
                판매중
              </span>
              3.20(수) 00:00 ~ 23:59 이용가능
            </span>
          </div>
          <button className="rounded-8 bg-primary text-static-white h-9 shrink-0 px-3 text-[13px] font-semibold">
            구매하기
          </button>
        </div>
      ))}
    </div>
  )
}

function InfoTab() {
  return (
    <div className="flex flex-col gap-5">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-text-strong text-[16px] font-bold">주차정보</h4>
          <span className="text-text-soft text-[12px]">정보 업데이트: 2024.08.23(금)</span>
        </div>
        <dl className="flex flex-col gap-2 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-text-soft">운영 시간</dt>
            <dd className="text-text-strong">00:00 ~ 24:00</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-soft">현장 요금</dt>
            <dd className="text-text-strong">1시간 기준 6,000원</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-soft">주소</dt>
            <dd className="text-text-strong">서울 성동구 왕십리로 83-12</dd>
          </div>
        </dl>
        <button className="rounded-8 border-stroke-soft text-text-strong h-10 border text-[14px] font-semibold">
          로드뷰 보기
        </button>
      </section>
    </div>
  )
}

function RecommendTab() {
  return <div className="text-text-soft text-[14px]">다른 주차장은 어떠세요? (준비중)</div>
}

function NearbyTab() {
  return <div className="text-text-soft text-[14px]">AI 요약 (준비중)</div>
}
