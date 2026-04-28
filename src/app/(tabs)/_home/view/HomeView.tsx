'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

import type { HeroBanner, PopularParking, QuickMenuItem, RecommendedRegion } from '../model'

import { useHomeViewModel } from '../viewmodel'

export default function HomeView() {
  const vm = useHomeViewModel()

  return (
    <div className="bg-bg-white flex min-h-full flex-col overflow-x-hidden">
      <TopBar />
      <LocationChip label="현재 위치 · 강남구 역삼동" onClick={vm.goNearby} />
      <HeroCarousel banners={vm.banners} index={vm.heroIndex} scrollRef={vm.heroRef} onScroll={vm.onHeroScroll} />
      <QuickMenuGrid items={vm.quickMenu} />
      <div className="bg-bg-weak h-2.5" />
      <RegionsSection
        regions={vm.regions}
        isLoading={vm.isRegionsLoading}
        onClickRegion={vm.goToRegion}
        onNearby={vm.goNearby}
      />
      <div className="bg-bg-weak h-2.5" />
      <BestParkingsSection parkings={vm.parkings} isLoading={vm.isParkingsLoading} onClickParking={vm.goToParking} />
      <div className="h-10" />
    </div>
  )
}

/* ─── Top Bar (sticky) ─── */
function TopBar() {
  return (
    <header className="bg-bg-white sticky top-0 z-20">
      <div className="flex items-center gap-2.5 px-4 pt-3 pb-2">
        <Link
          href="/"
          aria-label="홈"
          className="bg-primary flex size-9 shrink-0 items-center justify-center rounded-full"
        >
          <span className="text-static-white text-[16px] font-extrabold">M</span>
        </Link>
        <Link href="/search" className="bg-bg-soft flex h-10 flex-1 items-center gap-2 rounded-full px-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#A3A3A3" strokeWidth="1.8" />
            <path d="M16 16L20 20" stroke="#A3A3A3" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="text-text-soft text-[13px]">목적지 또는 주차장을 검색하세요</span>
        </Link>
        <button aria-label="최근" className="text-text-sub flex size-9 items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <button aria-label="알림" className="text-text-sub relative flex size-9 items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M10 21a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="bg-primary absolute top-1.5 right-1.5 size-1.5 rounded-full" />
        </button>
      </div>
    </header>
  )
}

/* ─── 위치 칩 ─── */
function LocationChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-text-strong flex items-center gap-1 px-5 pt-1 pb-3 text-left">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF5252">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
      </svg>
      <span className="text-[16px] font-bold tracking-[-0.2px]">{label}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M6 9l6 6 6-6" stroke="#171717" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

/* ─── Hero Carousel ─── */
function HeroCarousel({
  banners,
  index,
  scrollRef,
  onScroll
}: {
  banners: HeroBanner[]
  index: number
  scrollRef: React.RefObject<HTMLDivElement | null>
  onScroll: () => void
}) {
  if (!banners.length) {
    return (
      <div className="px-5">
        <div className="bg-bg-soft h-[180px] animate-pulse rounded-2xl" />
      </div>
    )
  }
  return (
    <div className="relative px-5">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="scrollbar-hide overflow-x-auto rounded-2xl"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        <div className="flex">
          {banners.map((b) => (
            <div key={b.id} className="w-full shrink-0" style={{ scrollSnapAlign: 'start' }}>
              <div
                className="relative flex h-[180px] flex-col justify-between overflow-hidden rounded-2xl p-5"
                style={{ background: b.background }}
              >
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-[20px] leading-[1.3] font-extrabold tracking-[-0.3px] whitespace-pre-line text-white">
                    {b.title}
                  </h2>
                  {b.subtitle && <p className="text-[13px] leading-[1.4] font-medium text-white/85">{b.subtitle}</p>}
                </div>
                {b.decorEmoji && (
                  <div className="flex items-end justify-between">
                    <span className="text-[44px] leading-none">{b.decorEmoji}</span>
                  </div>
                )}
                <span aria-hidden className="absolute -top-10 -right-10 size-32 rounded-full bg-white/15 blur-2xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 페이지 인디케이터 */}
      <span className="absolute right-8 bottom-3 rounded-full bg-black/45 px-2.5 py-0.5 text-[11px] font-semibold text-white">
        {index + 1} / {banners.length}
      </span>
    </div>
  )
}

/* ─── 퀵메뉴 4×5 그리드 ─── */
function QuickMenuGrid({ items }: { items: QuickMenuItem[] }) {
  if (!items.length) {
    return (
      <section className="grid grid-cols-5 gap-y-5 px-5 py-6">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="bg-bg-soft size-12 animate-pulse rounded-2xl" />
            <div className="bg-bg-soft h-3 w-12 animate-pulse rounded" />
          </div>
        ))}
      </section>
    )
  }
  return (
    <section className="grid grid-cols-5 gap-y-5 px-3 py-6">
      {items.map((it) => (
        <Link key={it.id} href={it.href} className="flex flex-col items-center gap-1.5">
          <span
            className="relative flex size-12 items-center justify-center rounded-2xl"
            style={{ background: it.bgColor }}
          >
            <span className="text-[24px] leading-none">{it.emoji}</span>
            {it.badge && (
              <span
                className={`absolute -top-1 -right-0.5 flex h-[18px] min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] leading-none font-extrabold text-white ${
                  it.badge === 'HOT' ? 'bg-[#FF5252]' : 'bg-[#FF5252]'
                }`}
              >
                {it.badge}
              </span>
            )}
          </span>
          <span className="text-text-strong text-[11px] leading-tight font-medium tracking-[-0.2px]">{it.label}</span>
        </Link>
      ))}
    </section>
  )
}

/* ─── 어디로 가시나요? (라운드 지역 카드) ─── */
function RegionsSection({
  regions,
  isLoading,
  onClickRegion,
  onNearby
}: {
  regions: RecommendedRegion[]
  isLoading: boolean
  onClickRegion: (r: RecommendedRegion) => void
  onNearby: () => void
}) {
  return (
    <section className="bg-bg-white py-6">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-text-strong text-[18px] font-bold tracking-[-0.3px]">어디로 가시나요?</h2>
        <button
          onClick={onNearby}
          className="border-stroke-soft text-text-strong flex items-center gap-1 rounded-full border px-3 py-1.5 text-[12px] font-semibold"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF5252">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
          </svg>
          내 주변
        </button>
      </div>

      <div className="scrollbar-hide mt-4 grid grid-flow-col grid-rows-2 gap-x-3 gap-y-4 overflow-x-auto px-5">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex w-[88px] shrink-0 flex-col items-center gap-2">
                <div className="bg-bg-soft size-[88px] animate-pulse rounded-2xl" />
                <div className="bg-bg-soft h-3 w-14 animate-pulse rounded" />
              </div>
            ))
          : regions.map((r, i) => <RegionCard key={r.id} region={r} index={i} onClick={() => onClickRegion(r)} />)}
      </div>
    </section>
  )
}

function RegionCard({ region, index, onClick }: { region: RecommendedRegion; index: number; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25, ease: 'easeOut' }}
      className="flex w-[88px] shrink-0 flex-col items-center gap-2 text-left"
    >
      <div
        className="relative flex size-[88px] items-end justify-end overflow-hidden rounded-2xl p-2"
        style={{ background: region.gradient }}
      >
        <span className="text-[36px] leading-none">{region.emoji}</span>
        {region.badge && (
          <span className="absolute top-1.5 left-1.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] leading-none font-bold text-[#FF5252]">
            {region.badge}
          </span>
        )}
        <span aria-hidden className="absolute -top-4 -right-4 size-12 rounded-full bg-white/20 blur-xl" />
      </div>
      <span className="text-text-strong text-[12px] leading-tight font-semibold tracking-[-0.2px]">{region.name}</span>
    </motion.button>
  )
}

/* ─── 인기 주차장 BEST (원형 카드) ─── */
function BestParkingsSection({
  parkings,
  isLoading,
  onClickParking
}: {
  parkings: PopularParking[]
  isLoading: boolean
  onClickParking: (p: PopularParking) => void
}) {
  return (
    <section className="bg-bg-white py-6">
      <div className="flex items-center justify-between px-5">
        <h2 className="text-text-strong text-[18px] font-bold tracking-[-0.3px]">인기 주차장 BEST</h2>
      </div>
      <div className="scrollbar-hide mt-4 flex gap-4 overflow-x-auto px-5">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex w-[88px] shrink-0 flex-col items-center gap-2">
                <div className="bg-bg-soft size-[88px] animate-pulse rounded-full" />
                <div className="bg-bg-soft h-3 w-14 animate-pulse rounded" />
              </div>
            ))
          : parkings.map((p, i) => (
              <motion.button
                key={p.seq}
                onClick={() => onClickParking(p)}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.25, ease: 'easeOut' }}
                className="flex w-[88px] shrink-0 flex-col items-center gap-2"
              >
                <div
                  className="relative flex size-[88px] items-center justify-center overflow-hidden rounded-full"
                  style={{ background: p.gradient }}
                >
                  <span className="text-[40px] leading-none">{p.emoji}</span>
                  <span aria-hidden className="absolute -top-2 -right-2 size-10 rounded-full bg-white/25 blur-md" />
                </div>
                <span className="text-text-strong w-full truncate text-center text-[12px] leading-tight font-semibold tracking-[-0.2px]">
                  {p.name}
                </span>
                <span className="text-text-sub -mt-1 text-[11px]">{p.shortLabel}</span>
              </motion.button>
            ))}
      </div>
    </section>
  )
}
