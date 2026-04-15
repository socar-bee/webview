'use client'

import Link from 'next/link'

import { IcoApple, IcoEmail, IcoFacebook, IcoKakao, IcoNaver } from '@/shared/components/icons'

import { useLoginViewModel } from './viewmodel'

export default function LoginView() {
  const vm = useLoginViewModel()

  return (
    <div className="bg-bg-white flex min-h-full w-full flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.webp" alt="모두의주차장" className="h-10" />
        <p className="text-text-sub mt-1.5" style={{ fontSize: 'var(--font-size-c2)' }}>
          대한민국 No.1 주차 플랫폼, 모두의주차장
        </p>
      </div>

      {!vm.showEmailForm ? (
        <>
          {/* Social Login Buttons */}
          <div className="mt-6 flex w-full max-w-[300px] flex-col gap-2.5">
            <button className="rounded-12 flex w-full items-center justify-center gap-2 bg-[#FEE500] py-3 text-[13px] font-bold text-[#191919] transition-opacity hover:opacity-90 active:opacity-80">
              <IcoKakao />
              카카오로 3초만에 시작하기
            </button>

            <button
              onClick={vm.openEmailForm}
              className="rounded-12 text-static-white flex w-full items-center justify-center gap-2 bg-neutral-800 py-3 text-[13px] font-bold transition-opacity hover:opacity-90 active:opacity-80"
            >
              <IcoEmail />
              이메일로 시작하기
            </button>
          </div>

          {/* Divider */}
          <div className="mt-5 flex w-full max-w-[300px] items-center gap-3">
            <div className="bg-stroke-soft h-px flex-1" />
            <span className="text-text-soft text-[11px]">또는</span>
            <div className="bg-stroke-soft h-px flex-1" />
          </div>

          {/* Social Login Icons */}
          <div className="mt-4 flex items-center gap-4">
            <button className="flex size-11 items-center justify-center rounded-full bg-[#03C75A] transition-opacity hover:opacity-90 active:opacity-80">
              <IcoNaver />
            </button>
            <button className="flex size-11 items-center justify-center rounded-full bg-[#1877F2] transition-opacity hover:opacity-90 active:opacity-80">
              <IcoFacebook />
            </button>
            <button className="flex size-11 items-center justify-center rounded-full bg-[#000000] transition-opacity hover:opacity-90 active:opacity-80">
              <IcoApple />
            </button>
          </div>

          {/* Guest */}
          <Link
            href={process.env.NEXT_PUBLIC_WEBAPP_HOST || 'https://app.modu.kr'}
            className="text-text-sub hover:text-text-strong mt-5 text-[13px] font-medium"
          >
            비회원으로 둘러보기
          </Link>

          {/* Terms */}
          <p className="text-text-soft mt-4 text-center leading-[16px]" style={{ fontSize: 'var(--font-size-c4)' }}>
            회원가입 시{' '}
            <Link href="#" className="underline">
              이용약관
            </Link>{' '}
            및{' '}
            <Link href="#" className="underline">
              개인정보처리방침
            </Link>
            에 동의하게 됩니다
          </p>
        </>
      ) : (
        <>
          {/* Email Login Form */}
          <div className="mt-6 flex w-full max-w-[300px] flex-col gap-3">
            <div>
              <label className="text-text-sub mb-1 block text-[12px] font-medium">이메일</label>
              <input
                type="email"
                value={vm.email}
                onChange={(e) => vm.setEmail(e.target.value)}
                placeholder="example@moduparking.com"
                className="rounded-12 border-stroke-soft text-text-strong placeholder:text-text-soft focus:border-primary w-full border px-3.5 py-3 text-[13px] transition-colors outline-none"
                onKeyDown={(e) => e.key === 'Enter' && vm.handleEmailLogin()}
              />
            </div>
            <div>
              <label className="text-text-sub mb-1 block text-[12px] font-medium">비밀번호</label>
              <input
                type="password"
                value={vm.password}
                onChange={(e) => vm.setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="rounded-12 border-stroke-soft text-text-strong placeholder:text-text-soft focus:border-primary w-full border px-3.5 py-3 text-[13px] transition-colors outline-none"
                onKeyDown={(e) => e.key === 'Enter' && vm.handleEmailLogin()}
              />
            </div>

            {vm.error && <p className="text-error-base text-[12px]">{vm.error}</p>}

            <button
              onClick={vm.handleEmailLogin}
              disabled={vm.isLoading}
              className="rounded-12 bg-primary text-static-white mt-1 w-full py-3 text-[13px] font-bold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
            >
              {vm.isLoading ? '로그인 중...' : '로그인'}
            </button>

            <button
              onClick={vm.closeEmailForm}
              className="text-text-sub hover:text-text-strong text-[13px] font-medium"
            >
              다른 방법으로 로그인
            </button>
          </div>
        </>
      )}
    </div>
  )
}
