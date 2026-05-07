'use client'

import { motion } from 'framer-motion'

import { useMyViewModel } from '../viewmodel'
import type { UserProfile } from '@/shared/types/auth'

export default function MyView() {
  const vm = useMyViewModel()

  return (
    <main className="bg-bg-weak flex min-h-full flex-col">
      {/* ─── Header ─── */}
      <header className="bg-bg-weak/80 border-stroke-soft/60 sticky top-0 z-10 flex h-12 items-center justify-between border-b px-5 backdrop-blur">
        <h1 className="text-text-strong text-[18px] font-extrabold tracking-[-0.3px]">MY</h1>
      </header>

      {/* ─── Profile Hero ─── */}
      <section className="px-5 pt-5">
        {vm.isLoading && !vm.profile ? (
          <ProfileSkeleton />
        ) : vm.profile ? (
          <ProfileHero profile={vm.profile} />
        ) : (
          <ProfileError onRetry={() => vm.refetch()} />
        )}
      </section>

      {/* ─── Stats ─── */}
      {vm.profile && (
        <section className="px-5 pt-3">
          <Stats
            tickets={vm.profile.paymentcount ?? 0}
            cards={vm.profile.cardBills?.length ?? 0}
            notices={vm.profile.noticeCount ?? 0}
          />
        </section>
      )}

      {/* ─── Menu groups ─── */}
      <section className="space-y-3 px-5 pt-4 pb-2">
        <MenuGroup>
          <MenuRow
            icon={<TicketIcon />}
            label="내 주차권"
            onClick={vm.goTickets}
            badge={vm.profile?.paymentcount ? String(vm.profile.paymentcount) : undefined}
          />
          <MenuRow icon={<HeartIcon />} label="즐겨찾기" onClick={vm.goFavorites} />
          <MenuRow icon={<MessageIcon />} label="내 후기" onClick={vm.goReviews} />
        </MenuGroup>

        <MenuGroup>
          <MenuRow
            icon={<BellIcon />}
            label="공지사항"
            onClick={vm.goNotices}
            badge={vm.profile?.noticeCount ? String(vm.profile.noticeCount) : undefined}
          />
          <MenuRow icon={<HelpIcon />} label="고객센터" onClick={vm.goCustomerCenter} />
        </MenuGroup>

        <MenuGroup>
          <MenuRow icon={<LogoutIcon />} label="로그아웃" onClick={vm.handleLogout} variant="muted" />
        </MenuGroup>
      </section>

      <footer className="text-text-soft mt-auto py-6 text-center text-[11px] tabular-nums">v 1.0.0</footer>
    </main>
  )
}

/* ─── Profile Hero — gradient card with decorative blobs ─── */
function ProfileHero({ profile }: { profile: UserProfile }) {
  const linked = [
    profile.userAuth.isKakao && { name: '카카오', bg: '#FEE500', fg: '#191919' },
    profile.userAuth.isNaver && { name: '네이버', bg: '#03C75A', fg: '#FFFFFF' },
    profile.userAuth.isApple && { name: 'Apple', bg: '#0F172A', fg: '#FFFFFF' },
    profile.userAuth.isFacebook && { name: 'Facebook', bg: '#1877F2', fg: '#FFFFFF' },
    profile.userAuth.isCitypass && { name: '시티패스', bg: '#7C4DFF', fg: '#FFFFFF' }
  ].filter(Boolean) as { name: string; bg: string; fg: string }[]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[20px] p-5 shadow-[0_4px_18px_rgba(0,153,255,0.10)]"
      style={{ background: 'linear-gradient(135deg, #E8F3FF 0%, #DCEAFF 50%, #E5DDFF 100%)' }}
    >
      <span aria-hidden className="bg-primary/15 absolute -top-12 -right-10 size-36 rounded-full blur-2xl" />
      <span aria-hidden className="absolute -bottom-12 -left-8 size-28 rounded-full bg-[#7C4DFF]/15 blur-2xl" />

      <div className="relative z-10 flex items-center gap-4">
        <Avatar src={profile.profileThumbnail} name={profile.userName} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-text-strong truncate text-[20px] font-extrabold tracking-[-0.3px]">
              {profile.userName || '이름 없음'}
            </h2>
            {profile.isVerifiedUser && <VerifiedBadge />}
          </div>
          <p className="text-text-sub truncate text-[13px]">{profile.email}</p>
          {profile.phone && (
            <p className="text-text-soft truncate text-[12px] tabular-nums">{formatPhone(profile.phone)}</p>
          )}
        </div>
      </div>

      {linked.length > 0 && (
        <div className="relative z-10 mt-4 flex flex-wrap items-center gap-1.5">
          {linked.map((p) => (
            <span
              key={p.name}
              className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
              style={{ backgroundColor: p.bg, color: p.fg }}
            >
              {p.name}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ─── Stats — 3 column ─── */
function Stats({ tickets, cards, notices }: { tickets: number; cards: number; notices: number }) {
  return (
    <div className="bg-bg-white border-stroke-soft/80 divide-stroke-soft/60 grid grid-cols-3 divide-x overflow-hidden rounded-[16px] border">
      <StatItem label="결제" value={tickets} />
      <StatItem label="카드" value={cards} />
      <StatItem label="알림" value={notices} highlight={notices > 0} />
    </div>
  )
}

function StatItem({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 py-3.5">
      <span
        className={`text-[20px] font-extrabold tracking-[-0.3px] tabular-nums ${
          highlight ? 'text-primary' : 'text-text-strong'
        }`}
      >
        {value}
      </span>
      <span className="text-text-soft text-[11px] font-medium">{label}</span>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="bg-bg-white border-stroke-soft/80 flex items-center gap-4 rounded-[20px] border px-5 py-6">
      <div className="bg-bg-soft size-[68px] shrink-0 animate-pulse rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="bg-bg-soft h-5 w-24 animate-pulse rounded" />
        <div className="bg-bg-soft h-3.5 w-40 animate-pulse rounded" />
        <div className="bg-bg-soft h-3 w-28 animate-pulse rounded" />
      </div>
    </div>
  )
}

function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-bg-white border-stroke-soft/80 flex flex-col items-center gap-3 rounded-[20px] border px-5 py-8">
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

/* ─── Avatar ─── */
function Avatar({ src, name }: { src?: string; name: string }) {
  if (src) {
    return (
      <span className="bg-bg-white relative size-[68px] shrink-0 overflow-hidden rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] ring-4 ring-white/80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
      </span>
    )
  }
  const initial = name?.trim().charAt(0).toUpperCase() || 'U'
  return (
    <span
      className="text-static-white flex size-[68px] shrink-0 items-center justify-center rounded-full text-[26px] font-extrabold shadow-[0_4px_12px_rgba(0,0,0,0.08)] ring-4 ring-white/80"
      style={{ background: 'linear-gradient(135deg, #0099FF 0%, #7C4DFF 100%)' }}
    >
      {initial}
    </span>
  )
}

function VerifiedBadge() {
  return (
    <span className="bg-primary text-static-white inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
      인증
    </span>
  )
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return phone
}

/* ─── Menu Group + Row ─── */
function MenuGroup({ children }: { children: React.ReactNode }) {
  return (
    <ul className="bg-bg-white border-stroke-soft/80 divide-stroke-soft/60 divide-y overflow-hidden rounded-[16px] border">
      {children}
    </ul>
  )
}

function MenuRow({
  icon,
  label,
  onClick,
  badge,
  variant
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  badge?: string
  variant?: 'default' | 'muted'
}) {
  const labelColor = variant === 'muted' ? 'text-text-sub' : 'text-text-strong'
  const iconColor = variant === 'muted' ? 'text-text-disabled' : 'text-text-sub'
  return (
    <li>
      <button
        onClick={onClick}
        className="active:bg-bg-soft/50 flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left transition-colors"
      >
        <span className={`flex size-7 items-center justify-center ${iconColor}`}>{icon}</span>
        <span className={`flex-1 text-[14px] font-medium ${labelColor}`}>{label}</span>
        {badge && (
          <span className="bg-primary text-static-white rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums">
            {badge}
          </span>
        )}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-text-disabled">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </li>
  )
}

/* ─── Icons ─── */
function TicketIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 9v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>
  )
}
function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function MessageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1 4.5A7.97 7.97 0 0 1 21 12z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 21a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function HelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  )
}
function LogoutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 12H4m0 0l4-4m-4 4l4 4M9 4h7a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
