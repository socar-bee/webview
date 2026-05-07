'use client'

import { motion } from 'framer-motion'

import { useMyViewModel } from '../viewmodel'
import type { UserProfile } from '@/shared/types/auth'

export default function MyView() {
  const vm = useMyViewModel()

  return (
    <main className="bg-bg-weak flex min-h-full flex-col">
      {/* ─── Header ─── */}
      <header className="bg-bg-white border-stroke-soft/60 sticky top-0 z-10 flex h-12 items-center justify-between border-b px-5">
        <h1 className="text-text-strong text-[18px] font-bold tracking-[-0.3px]">MY</h1>
      </header>

      {vm.isLoading && !vm.profile ? (
        <ProfileSkeleton />
      ) : vm.profile ? (
        <ProfileCard profile={vm.profile} />
      ) : (
        <ProfileError onRetry={() => vm.refetch()} />
      )}

      {/* ─── Menu ─── */}
      <section className="bg-bg-white mt-2 px-2">
        <ul className="divide-stroke-soft/60 divide-y">
          <MenuRow
            icon={<TicketIcon />}
            label="내 주차권"
            onClick={vm.goTickets}
            badge={vm.profile?.paymentcount ? String(vm.profile.paymentcount) : undefined}
          />
          <MenuRow icon={<HeartIcon />} label="즐겨찾기" onClick={vm.goFavorites} />
          <MenuRow icon={<MessageIcon />} label="내 후기" onClick={vm.goReviews} />
        </ul>
      </section>

      <section className="bg-bg-white mt-2 px-2">
        <ul className="divide-stroke-soft/60 divide-y">
          <MenuRow
            icon={<BellIcon />}
            label="공지사항"
            onClick={vm.goNotices}
            badge={vm.profile?.noticeCount ? String(vm.profile.noticeCount) : undefined}
          />
          <MenuRow icon={<HelpIcon />} label="고객센터" onClick={vm.goCustomerCenter} />
        </ul>
      </section>

      <section className="bg-bg-white mt-2 px-2">
        <ul className="divide-stroke-soft/60 divide-y">
          <MenuRow icon={<LogoutIcon />} label="로그아웃" onClick={vm.handleLogout} variant="danger" />
        </ul>
      </section>

      <footer className="text-text-soft mt-auto py-6 text-center text-[11px]">v1.0.0</footer>
    </main>
  )
}

/* ─── Profile Card ─── */
function ProfileCard({ profile }: { profile: UserProfile }) {
  const linked = [
    profile.userAuth.isKakao && '카카오',
    profile.userAuth.isNaver && '네이버',
    profile.userAuth.isApple && 'Apple',
    profile.userAuth.isFacebook && 'Facebook',
    profile.userAuth.isCitypass && '시티패스'
  ].filter(Boolean) as string[]

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="bg-bg-white px-5 pt-6 pb-6"
    >
      <div className="flex items-center gap-4">
        <Avatar src={profile.profileThumbnail} name={profile.userName} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-text-strong truncate text-[18px] font-extrabold tracking-[-0.3px]">
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
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="text-text-soft text-[11px]">연결된 계정</span>
          {linked.map((p) => (
            <span key={p} className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-semibold">
              {p}
            </span>
          ))}
        </div>
      )}
    </motion.section>
  )
}

function ProfileSkeleton() {
  return (
    <section className="bg-bg-white flex items-center gap-4 px-5 pt-6 pb-6">
      <div className="bg-bg-soft size-16 shrink-0 animate-pulse rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="bg-bg-soft h-5 w-24 animate-pulse rounded" />
        <div className="bg-bg-soft h-3.5 w-40 animate-pulse rounded" />
        <div className="bg-bg-soft h-3 w-28 animate-pulse rounded" />
      </div>
    </section>
  )
}

function ProfileError({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="bg-bg-white flex flex-col items-center gap-3 px-5 pt-8 pb-8">
      <p className="text-text-sub text-[13px]">프로필을 불러오지 못했어요</p>
      <button
        onClick={onRetry}
        className="bg-bg-soft text-text-strong cursor-pointer rounded-full px-4 py-1.5 text-[13px] font-semibold"
      >
        다시 시도
      </button>
    </section>
  )
}

/* ─── Avatar ─── */
function Avatar({ src, name }: { src?: string; name: string }) {
  if (src) {
    return (
      <span className="bg-bg-soft relative size-16 shrink-0 overflow-hidden rounded-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
      </span>
    )
  }
  const initial = name?.trim().charAt(0).toUpperCase() || 'U'
  return (
    <span className="bg-primary/10 text-primary flex size-16 shrink-0 items-center justify-center rounded-full text-[24px] font-extrabold">
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

/* ─── Menu Row ─── */
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
  variant?: 'default' | 'danger'
}) {
  const labelColor = variant === 'danger' ? 'text-error-base' : 'text-text-strong'
  return (
    <li>
      <button
        onClick={onClick}
        className="active:bg-bg-soft/60 flex w-full cursor-pointer items-center gap-3 px-3 py-3.5 text-left transition-colors"
      >
        <span className="text-text-sub flex size-6 items-center justify-center">{icon}</span>
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
