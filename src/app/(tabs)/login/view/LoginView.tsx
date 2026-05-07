'use client'

import Link from 'next/link'

import { IcoEmail, IcoKakao, IcoNaver } from '@/shared/components/icons'

import { useLoginViewModel } from '../viewmodel'

export default function LoginView() {
  const vm = useLoginViewModel()

  if (vm.showEmailForm) return <EmailForm vm={vm} />

  return (
    <div className="bg-bg-white flex min-h-full w-full flex-col px-6 pt-16 pb-8">
      {/* ─── Brand ─── */}
      <header className="flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.webp" alt="모두의주차장" className="h-12 select-none" draggable={false} />
        <p className="text-text-soft text-[14px] tracking-[-0.2px]">대한민국 No.1 주차 플랫폼</p>
      </header>

      {/* ─── Actions (vertically centered) ─── */}
      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto flex w-full max-w-[320px] flex-col gap-2.5">
          <SocialButton kind="kakao" icon={<IcoKakao />} label="카카오로 시작하기" onClick={vm.handleKakaoLogin} />
          <SocialButton kind="naver" icon={<IcoNaver />} label="네이버로 시작하기" onClick={vm.handleNaverLogin} />

          <Divider />

          <button
            onClick={vm.openEmailForm}
            className="text-text-sub hover:text-text-strong flex cursor-pointer items-center justify-center gap-2 py-2.5 text-[14px] font-medium transition-colors"
          >
            <IcoEmail className="text-text-sub" width={18} height={18} />
            이메일로 로그인
          </button>

          {vm.error && <p className="text-error-base text-center text-[12px]">{vm.error}</p>}
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="mx-auto flex w-full max-w-[320px] flex-col items-center gap-4">
        <Link
          href={process.env.NEXT_PUBLIC_WEBAPP_HOST || 'https://app.modu.kr'}
          className="text-text-sub hover:text-text-strong text-[13px] underline-offset-2 hover:underline"
        >
          비회원으로 둘러보기
        </Link>
        <p className="text-text-soft text-center text-[11px] leading-[1.6]">
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
      </footer>
    </div>
  )
}

/* ─── Social Button ─── */
function SocialButton({
  kind,
  icon,
  label,
  onClick
}: {
  kind: 'kakao' | 'naver'
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  const palette = {
    kakao: 'bg-[#FEE500] text-[#191919]',
    naver: 'bg-[#03C75A] text-white'
  }[kind]

  return (
    <button
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] py-3.5 text-[14px] font-bold transition-transform active:scale-[0.98] ${palette}`}
    >
      <span className="flex size-5 items-center justify-center">{icon}</span>
      {label}
    </button>
  )
}

/* ─── Divider ("또는") ─── */
function Divider() {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="bg-stroke-soft h-px flex-1" />
      <span className="text-text-soft text-[12px]">또는</span>
      <span className="bg-stroke-soft h-px flex-1" />
    </div>
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
