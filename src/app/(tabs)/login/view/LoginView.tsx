'use client'

import Link from 'next/link'

import { IcoEmail, IcoKakao, IcoNaver } from '@/shared/components/icons'

import { useLoginViewModel } from '../viewmodel'

export default function LoginView() {
  const vm = useLoginViewModel()

  if (vm.showEmailForm) return <EmailForm vm={vm} />

  return (
    <div className="bg-bg-white relative flex min-h-full w-full flex-col">
      {/* ─── Top bar (logo + customer support) ─── */}
      <header className="flex h-14 shrink-0 items-center justify-center px-5">
        <Link
          href="https://help.modu.kr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-soft absolute top-1/2 right-5 -translate-y-1/2 text-[12px] hover:underline"
        >
          고객센터
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.webp" alt="모두의주차장" className="h-7 select-none" draggable={false} />
      </header>

      {/* ─── Hero card ─── */}
      <div className="px-5 pt-2">
        <div
          className="relative h-[280px] overflow-hidden rounded-[20px]"
          style={{
            backgroundImage: 'linear-gradient(135deg, #0A1A2E 0%, #16314D 60%, #1B4373 100%)'
          }}
        >
          {/* Soft glow */}
          <span aria-hidden className="absolute -top-16 -right-16 size-48 rounded-full bg-[#0099FF]/30 blur-3xl" />
          <span aria-hidden className="absolute -bottom-12 -left-12 size-40 rounded-full bg-[#7C4DFF]/25 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col p-6">
            <span className="self-start rounded-full bg-[#FF9F43]/15 px-2.5 py-1 text-[12px] font-bold text-[#FFB85C]">
              #사전예약 OPEN
            </span>
            <h1 className="mt-4 text-[26px] leading-[1.25] font-extrabold tracking-[-0.4px] text-white">
              주차 걱정 없이
              <br />
              원하는 곳으로
            </h1>
            <p className="mt-2 text-[13px] leading-[1.5] text-white/70">
              원하는 시간에 미리 예약하고
              <br />더 합리적으로 주차하세요
            </p>
          </div>

          {/* Decorative parking pin glyph */}
          <svg
            width="180"
            height="180"
            viewBox="0 0 24 24"
            className="absolute -right-6 -bottom-6 text-white/[0.06]"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
          </svg>
        </div>
      </div>

      {/* spacer */}
      <div className="flex-1" />

      {/* ─── CTA cluster ─── */}
      <div className="flex flex-col items-center gap-4 px-5 pb-6">
        {/* Tooltip bubble */}
        <div className="relative">
          <span className="border-primary text-primary block rounded-full border bg-white px-3 py-1 text-[12px] font-semibold">
            3초만에 빠른 회원가입
          </span>
          <span
            aria-hidden
            className="border-primary absolute -bottom-[6px] left-1/2 size-2.5 -translate-x-1/2 rotate-45 border-r border-b bg-white"
          />
        </div>

        {/* Primary Kakao */}
        <button
          onClick={vm.handleKakaoLogin}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] bg-[#FEE500] py-4 text-[15px] font-bold text-[#191919] transition-transform active:scale-[0.98]"
        >
          <IcoKakao />
          카카오로 시작
        </button>

        {vm.error && <p className="text-error-base text-center text-[12px]">{vm.error}</p>}

        {/* Divider */}
        <div className="flex w-full items-center gap-3 pt-1">
          <span className="bg-stroke-soft h-px flex-1" />
          <span className="text-text-soft text-[12px]">또는</span>
          <span className="bg-stroke-soft h-px flex-1" />
        </div>

        {/* Secondary social row — circular icon-only */}
        <div className="flex items-center gap-3">
          <CircleButton onClick={vm.handleNaverLogin} aria-label="네이버로 시작">
            <IcoNaver className="text-[#03C75A]" />
          </CircleButton>
          <CircleButton onClick={vm.openEmailForm} aria-label="이메일로 로그인">
            <IcoEmail className="text-text-strong" width={20} height={20} />
          </CircleButton>
          <CircleButton
            href={process.env.NEXT_PUBLIC_WEBAPP_HOST || 'https://app.modu.kr'}
            aria-label="비회원으로 둘러보기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-text-strong">
              <path
                d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </CircleButton>
        </div>

        {/* Terms */}
        <p className="text-text-soft mt-2 text-center text-[11px] leading-[1.6]">
          회원가입 시{' '}
          <Link href="https://app.modu.kr/terms" className="underline-offset-2 hover:underline">
            이용약관
          </Link>
          {' 및 '}
          <Link href="https://app.modu.kr/privacy" className="underline-offset-2 hover:underline">
            개인정보처리방침
          </Link>
          에 동의하게 됩니다
        </p>
      </div>
    </div>
  )
}

/* ─── Circle Button (icon-only secondary) ─── */
function CircleButton({
  children,
  onClick,
  href,
  ...rest
}: {
  children: React.ReactNode
  onClick?: () => void
  href?: string
} & Pick<React.AriaAttributes, 'aria-label'>) {
  const className =
    'border-stroke-soft flex size-12 cursor-pointer items-center justify-center rounded-full border bg-white transition-transform active:scale-90'
  if (href) {
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <button onClick={onClick} className={className} {...rest}>
      {children}
    </button>
  )
}

/* ─── Email Form (separate screen) ─── */
function EmailForm({ vm }: { vm: ReturnType<typeof useLoginViewModel> }) {
  return (
    <div className="bg-bg-white flex min-h-full w-full flex-col">
      {/* Top bar with back */}
      <header className="flex h-12 shrink-0 items-center px-2">
        <button
          onClick={vm.closeEmailForm}
          aria-label="뒤로"
          className="flex size-10 cursor-pointer items-center justify-center"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#171717"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <div className="mx-auto flex w-full max-w-[320px] flex-1 flex-col px-6 pt-4 pb-8">
        <h1 className="text-text-strong text-[22px] font-extrabold tracking-[-0.3px]">이메일로 로그인</h1>
        <p className="text-text-soft mt-1 text-[13px]">가입한 이메일과 비밀번호를 입력하세요</p>

        <div className="mt-8 flex flex-col gap-4">
          <Field label="이메일">
            <input
              type="email"
              value={vm.email}
              onChange={(e) => vm.setEmail(e.target.value)}
              placeholder="example@modu.kr"
              autoComplete="email"
              className="border-stroke-soft text-text-strong placeholder:text-text-soft focus:border-primary w-full rounded-[12px] border px-4 py-3.5 text-[14px] transition-colors outline-none"
              onKeyDown={(e) => e.key === 'Enter' && vm.handleEmailLogin()}
            />
          </Field>
          <Field label="비밀번호">
            <input
              type="password"
              value={vm.password}
              onChange={(e) => vm.setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              autoComplete="current-password"
              className="border-stroke-soft text-text-strong placeholder:text-text-soft focus:border-primary w-full rounded-[12px] border px-4 py-3.5 text-[14px] transition-colors outline-none"
              onKeyDown={(e) => e.key === 'Enter' && vm.handleEmailLogin()}
            />
          </Field>

          {vm.error && <p className="text-error-base text-[12px]">{vm.error}</p>}
        </div>

        <div className="mt-auto pt-8">
          <button
            onClick={vm.handleEmailLogin}
            disabled={vm.isLoading || !vm.email || !vm.password}
            className="bg-primary text-static-white w-full cursor-pointer rounded-[12px] py-3.5 text-[14px] font-bold transition-all active:scale-[0.98] disabled:cursor-default disabled:opacity-40 disabled:active:scale-100"
          >
            {vm.isLoading ? '로그인 중…' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-text-sub text-[12px] font-medium">{label}</span>
      {children}
    </label>
  )
}
