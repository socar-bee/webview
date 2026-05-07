'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

import { useMyViewModel } from '../viewmodel'
import type { UserAuth, UserProfile } from '@/shared/types/auth'

export default function MyView() {
  const vm = useMyViewModel()

  return (
    <main className="bg-bg-white flex min-h-full flex-col">
      {/* ─── App Bar ─── */}
      <header className="bg-bg-white sticky top-0 z-10 flex h-14 items-center justify-between px-5">
        <h1 className="text-text-strong text-[22px] font-extrabold tracking-[-0.4px]">MY</h1>
        <div className="flex items-center gap-1">
          <IconButton ariaLabel="알림" onClick={vm.goNotices} dot={(vm.profile?.noticeCount ?? 0) > 0}>
            <BellIcon />
          </IconButton>
          <IconButton ariaLabel="설정" onClick={vm.goCustomerCenter}>
            <SettingIcon />
          </IconButton>
        </div>
      </header>

      {/* ─── Profile (large avatar + email sub + linked socials) ─── */}
      <section className="px-5 pt-1 pb-2">
        {vm.isLoading && !vm.profile ? (
          <ProfileSkeleton />
        ) : vm.profile ? (
          <ProfileRow profile={vm.profile} />
        ) : (
          <ProfileError onRetry={() => vm.refetch()} />
        )}
      </section>

      {/* ─── Status — 본인인증 미완료시에만 노출 ─── */}
      {vm.profile && !vm.profile.isVerifiedUser && (
        <section className="px-5 pt-3">
          <VerifyCard />
        </section>
      )}

      {/* ─── Assets card — UserProfile 실데이터 (주차권 / 결제카드 / 공지) ─── */}
      {vm.profile && (
        <section className="px-5 pt-3">
          <AssetsCard
            ticketCount={vm.profile.paymentcount ?? 0}
            cardCount={vm.profile.cardBills?.length ?? 0}
            noticeCount={vm.profile.noticeCount ?? 0}
            onTickets={vm.goTickets}
            onNotices={vm.goNotices}
          />
        </section>
      )}

      {/* ─── Promo carousel — 5s auto ─── */}
      <section className="px-5 pt-4">
        <PromoCarousel />
      </section>

      {/* ─── Menu — sub-text 동적 바인딩 ─── */}
      <section className="px-5 pt-4 pb-2">
        <MenuList>
          <MenuItem
            label="주문 내역"
            sub={vm.profile?.paymentcount ? `최근 결제 ${vm.profile.paymentcount}건` : '주차권 · 결제 내역 모아보기'}
            onClick={vm.goTickets}
          />
          <MenuItem label="즐겨찾기" sub="자주 가는 주차장 한 번에" onClick={vm.goFavorites} />
          <MenuItem
            label="내 후기"
            sub={
              vm.profile?.paymentcount
                ? `작성 가능한 후기 ${vm.profile.paymentcount}건`
                : '주차장 이용 후기를 남겨보세요'
            }
            onClick={vm.goReviews}
          />
          <MenuItem
            label="공지사항"
            sub={vm.profile?.noticeCount ? `읽지 않은 공지 ${vm.profile.noticeCount}건` : undefined}
            onClick={vm.goNotices}
            badgeNew={(vm.profile?.noticeCount ?? 0) > 0}
          />
          <MenuItem label="고객센터" sub="자주 묻는 질문 · 1:1 문의" onClick={vm.goCustomerCenter} />
          <MenuItem label="이용약관 · 개인정보 처리방침" onClick={vm.goCustomerCenter} />
        </MenuList>
      </section>

      {/* ─── Logout & version ─── */}
      <section className="mt-auto px-5 pt-3 pb-3">
        <button
          onClick={vm.handleLogout}
          className="text-text-soft hover:text-text-sub cursor-pointer text-[12px] font-medium underline-offset-4 transition-colors hover:underline"
        >
          로그아웃
        </button>
      </section>
      <footer className="text-text-disabled pb-6 text-center text-[10px] tabular-nums">v 1.0.0</footer>
    </main>
  )
}

/* ═══════════════════════════════════════════════════════
   IconButton — App-bar
   ═══════════════════════════════════════════════════════ */
function IconButton({
  children,
  ariaLabel,
  onClick,
  dot
}: {
  children: React.ReactNode
  ariaLabel: string
  onClick: () => void
  dot?: boolean
}) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      className="text-icon-strong active:bg-bg-weak/60 relative flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors"
    >
      {children}
      {dot && <span className="bg-primary ring-bg-white absolute top-1.5 right-2 size-1.5 rounded-full ring-2" />}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════
   Profile Row — 큰 아바타 + 이름·이메일 + 연동 소셜 chip + 우측 편집 버튼
   API: profile.userName / email / profileThumbnail / userAuth
   ═══════════════════════════════════════════════════════ */
function ProfileRow({ profile }: { profile: UserProfile }) {
  const linked = useMemo(() => buildLinkedSocials(profile.userAuth), [profile.userAuth])

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-center gap-3.5"
    >
      <Avatar src={profile.profileThumbnail} name={profile.userName} verified={profile.isVerifiedUser} />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <button className="flex cursor-pointer items-center gap-1 text-left">
          <span className="text-text-strong truncate text-[17px] font-extrabold tracking-[-0.3px]">
            {profile.userName || '이름 없음'}
          </span>
          <ChevronRight />
        </button>
        <p className="text-text-sub truncate text-[12px] tracking-[-0.1px]">{profile.email}</p>
        {linked.length > 0 && (
          <div className="mt-0.5 flex items-center gap-1">
            {linked.map((s) => (
              <span
                key={s.key}
                aria-label={`${s.name} 연동`}
                title={`${s.name} 연동`}
                className="flex size-[14px] items-center justify-center rounded-full text-[8px] font-extrabold"
                style={{ backgroundColor: s.bg, color: s.fg }}
              >
                {s.short}
              </span>
            ))}
          </div>
        )}
      </div>

      <button className="border-stroke-soft text-text-strong hover:bg-bg-weak/50 shrink-0 cursor-pointer rounded-[10px] border px-3 py-1.5 text-[12px] font-bold transition-colors">
        프로필 편집
      </button>
    </motion.div>
  )
}

function buildLinkedSocials(auth: UserAuth) {
  const list: { key: string; name: string; short: string; bg: string; fg: string }[] = []
  if (auth.isKakao) list.push({ key: 'kakao', name: '카카오', short: 'K', bg: '#FEE500', fg: '#191919' })
  if (auth.isNaver) list.push({ key: 'naver', name: '네이버', short: 'N', bg: '#03C75A', fg: '#FFFFFF' })
  if (auth.isApple) list.push({ key: 'apple', name: 'Apple', short: '', bg: '#0F172A', fg: '#FFFFFF' })
  if (auth.isFacebook) list.push({ key: 'fb', name: 'Facebook', short: 'f', bg: '#1877F2', fg: '#FFFFFF' })
  if (auth.isCitypass) list.push({ key: 'citypass', name: '시티패스', short: 'C', bg: '#7C4DFF', fg: '#FFFFFF' })
  return list
}

/* ═══════════════════════════════════════════════════════
   Avatar — 48px
   - profileThumbnail 있으면 이미지, 로드 실패(onError) 시 fallback
   - 이름 있으면 이니셜 그라디언트, 없으면 회색 user 아이콘
   - 인증 시 우하단 체크 dot
   ═══════════════════════════════════════════════════════ */
function Avatar({ src, name, verified }: { src?: string; name: string; verified?: boolean }) {
  // src 자체를 키로 추적 — src 변경 시 자동으로 showImage 재활성화
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const trimmed = name?.trim() ?? ''
  const initial = trimmed.charAt(0).toUpperCase()
  const showImage = !!src && failedSrc !== src

  return (
    <span className="relative size-12 shrink-0">
      <span className="bg-bg-white ring-stroke-soft/70 block size-full overflow-hidden rounded-full ring-1 ring-inset">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={trimmed ? `${trimmed} 프로필 이미지` : '프로필 이미지'}
            className="h-full w-full object-cover"
            draggable={false}
            onError={() => setFailedSrc(src ?? null)}
          />
        ) : initial ? (
          <span
            aria-label="프로필 이미지 없음"
            className="text-static-white flex h-full w-full items-center justify-center text-[18px] font-extrabold"
            style={{ background: 'linear-gradient(135deg, #99D6FF 0%, #0099FF 100%)' }}
          >
            {initial}
          </span>
        ) : (
          <span
            aria-label="프로필 이미지 없음"
            className="bg-bg-soft text-text-soft flex h-full w-full items-center justify-center"
          >
            <UserSilhouetteIcon />
          </span>
        )}
      </span>
      {verified && (
        <span className="bg-primary text-static-white ring-bg-white absolute -right-0.5 -bottom-0.5 flex size-[16px] items-center justify-center rounded-full ring-[2px]">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </span>
      )}
    </span>
  )
}

function UserSilhouetteIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="9" r="3.5" />
      <path d="M4.5 19.5c1.2-3.5 4.2-5.5 7.5-5.5s6.3 2 7.5 5.5v.5h-15v-.5z" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════
   VerifyCard — !isVerifiedUser 일 때만 표출
   ═══════════════════════════════════════════════════════ */
function VerifyCard() {
  return (
    <button className="border-primary-light bg-primary-lighter/40 hover:bg-primary-lighter/60 flex w-full cursor-pointer items-center gap-3 rounded-[12px] border px-4 py-3.5 text-left transition-colors">
      <span className="bg-primary-lighter text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
        <ShieldIcon />
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-primary-darker text-[14px] font-bold tracking-[-0.2px]">본인인증을 진행해 주세요</span>
        <span className="text-text-sub text-[12px]">사전예약 · 결제를 위해 필요해요</span>
      </div>
      <ChevronRight muted />
    </button>
  )
}

/* ═══════════════════════════════════════════════════════
   Assets card — 3-col stat (주차권/결제카드/공지)
   API: paymentcount / cardBills / noticeCount
   ═══════════════════════════════════════════════════════ */
function AssetsCard({
  ticketCount,
  cardCount,
  noticeCount,
  onTickets,
  onNotices
}: {
  ticketCount: number
  cardCount: number
  noticeCount: number
  onTickets: () => void
  onNotices: () => void
}) {
  return (
    <div className="border-stroke-soft overflow-hidden rounded-[12px] border bg-white">
      <div className="divide-stroke-soft grid grid-cols-3 divide-x">
        <StatCol label="주차권" value={ticketCount} unit="매" onClick={onTickets} />
        <StatCol label="결제카드" value={cardCount} unit="장" hint />
        <StatCol
          label="공지"
          value={noticeCount}
          unit="건"
          onClick={noticeCount > 0 ? onNotices : undefined}
          highlight={noticeCount > 0}
        />
      </div>
    </div>
  )
}

function StatCol({
  label,
  value,
  unit,
  onClick,
  highlight,
  hint
}: {
  label: string
  value: number
  unit: string
  onClick?: () => void
  highlight?: boolean
  hint?: boolean
}) {
  const Wrapper = onClick ? 'button' : 'div'
  return (
    <Wrapper
      onClick={onClick}
      className={`flex flex-col gap-1 px-4 py-3.5 ${
        onClick ? 'hover:bg-bg-weak/30 cursor-pointer text-left transition-colors' : ''
      }`}
    >
      <span className="text-text-sub flex items-center gap-0.5 text-[12px] font-medium tracking-[-0.1px]">
        {label}
        {(onClick || hint) && <ChevronRight tiny />}
      </span>
      <span
        className={`text-[16px] font-extrabold tracking-[-0.3px] tabular-nums ${
          highlight ? 'text-primary' : value > 0 ? 'text-text-strong' : 'text-text-sub'
        }`}
      >
        {value.toLocaleString()}
        <span className="text-text-soft ml-0.5 text-[12px] font-semibold">{unit}</span>
      </span>
    </Wrapper>
  )
}

/* ═══════════════════════════════════════════════════════
   Promo Carousel — 3 배너 5초 자동 슬라이드
   ═══════════════════════════════════════════════════════ */
type PromoBannerData = {
  id: string
  title: string
  desc: string
  illustration: React.ReactNode
}

const PROMO_BANNERS: PromoBannerData[] = [
  {
    id: 'invite',
    title: '친구초대 이벤트',
    desc: '친구초대하고 3,000P 적립 받아가세요',
    illustration: <GiftLargeIcon />
  },
  {
    id: 'advance',
    title: '사전예약 첫 이용',
    desc: '미리 예약하고 합리적인 가격에 주차하세요',
    illustration: <ClockLargeIcon />
  },
  {
    id: 'review',
    title: '후기 작성하기',
    desc: '후기 한 번에 적립 포인트를 챙겨가세요',
    illustration: <StarLargeIcon />
  }
]

const SLIDE_INTERVAL_MS = 5000

function PromoCarousel() {
  const [idx, setIdx] = useState(0)
  const total = PROMO_BANNERS.length

  useEffect(() => {
    if (total <= 1) return
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % total)
    }, SLIDE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [total])

  return (
    <div>
      <div className="overflow-hidden rounded-[12px]">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${idx * 100}%)`, width: `${total * 100}%` }}
        >
          {PROMO_BANNERS.map((b) => (
            <div key={b.id} className="shrink-0" style={{ width: `${100 / total}%` }}>
              <PromoBannerInner data={b} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-1.5">
        {PROMO_BANNERS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            aria-label={`${i + 1}번 배너로 이동`}
            onClick={() => setIdx(i)}
            className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
              i === idx ? 'bg-text-strong w-4' : 'bg-text-disabled w-1.5'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function PromoBannerInner({ data }: { data: PromoBannerData }) {
  return (
    <button
      className="flex w-full cursor-pointer items-center gap-4 px-4 py-5 text-left transition-opacity hover:opacity-95"
      style={{ backgroundColor: '#3A3F47' }}
    >
      <span
        className="flex size-[60px] shrink-0 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: '#2B2F36' }}
      >
        {data.illustration}
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-static-white text-[15px] font-extrabold tracking-[-0.3px]">{data.title}</span>
        <span className="text-static-white/75 text-[12px] font-medium">{data.desc}</span>
      </div>
    </button>
  )
}

function GiftLargeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path d="M5 14h22v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V14z" fill="#FFE56B" />
      <rect x="4" y="10" width="24" height="5" rx="1.5" fill="#FFE56B" />
      <path d="M16 10v18" stroke="#3A3F47" strokeWidth="1.8" />
      <path
        d="M11.5 10c-1.5 0-2.5-.9-2.5-2 0-1.1 1-2 2-2 1.5 0 3 1.5 5 4 2-2.5 3.5-4 5-4 1 0 2 .9 2 2 0 1.1-1 2-2.5 2"
        stroke="#3A3F47"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function ClockLargeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="11" fill="#66C2FF" />
      <path d="M16 9.5v7l4 2.5" stroke="#3A3F47" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="1.4" fill="#3A3F47" />
    </svg>
  )
}

function StarLargeIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <path
        d="M16 4.5l3.4 7.6 8.1.9-6 5.7 1.7 8.1L16 22.7 8.8 26.8l1.7-8.1-6-5.7 8.1-.9L16 4.5z"
        fill="#FFAFB1"
        stroke="#3A3F47"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════
   Menu — label + dynamic sub
   ═══════════════════════════════════════════════════════ */
function MenuList({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col">{children}</ul>
}

function MenuItem({
  label,
  sub,
  onClick,
  badgeNew
}: {
  label: string
  sub?: string
  onClick: () => void
  badgeNew?: boolean
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className="active:bg-bg-weak/40 -mx-2 flex w-full cursor-pointer items-center gap-2 rounded-[10px] px-2 py-3.5 text-left transition-colors"
      >
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-text-strong text-[15px] font-bold tracking-[-0.2px]">{label}</span>
            {badgeNew && <span className="text-primary inline-flex items-center text-[11px] font-extrabold">N</span>}
          </div>
          {sub && <span className="text-text-soft text-[12px]">{sub}</span>}
        </div>
        <ChevronRight muted />
      </button>
    </li>
  )
}

/* ═══════════════════════════════════════════════════════
   Skeleton & Error
   ═══════════════════════════════════════════════════════ */
function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-3.5">
      <div className="bg-bg-soft size-12 shrink-0 animate-pulse rounded-full" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="bg-bg-soft h-4 w-24 animate-pulse rounded" />
        <div className="bg-bg-soft h-3 w-40 animate-pulse rounded" />
      </div>
      <div className="bg-bg-soft h-7 w-20 animate-pulse rounded-[10px]" />
    </div>
  )
}

function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-text-sub text-[13px]">프로필을 불러오지 못했어요</p>
      <button
        onClick={onRetry}
        className="bg-primary text-static-white cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-semibold"
      >
        다시 시도
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   Icons
   ═══════════════════════════════════════════════════════ */
function ChevronRight({ muted, tiny }: { muted?: boolean; tiny?: boolean }) {
  const size = tiny ? 12 : 16
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={muted ? 'text-text-disabled' : 'text-text-sub'}
      aria-hidden
    >
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M10 21a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function SettingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l8 3v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-3z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
