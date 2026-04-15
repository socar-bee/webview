'use client'
import Link from 'next/link'

import { IcoChevronRight } from '@/shared/components/icons'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body>
        <section className="flex h-dvh flex-col items-center justify-center px-6 text-center">
          <h1 className="mb-3 text-[20px] font-bold text-[#171717] md:text-[24px]">일시적인 오류가 발생했습니다</h1>
          <p className="mb-10 max-w-[320px] text-[14px] leading-relaxed text-[#5c5c5c]">
            잠시 후 다시 시도해 주세요. 문제가 계속되면 고객센터(1899-8242)로 문의해 주세요.
          </p>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={reset}
              className="rounded-10 inline-flex items-center gap-2 bg-[#0099FF] px-8 py-3.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90 active:opacity-80"
            >
              다시 시도하기
              <IcoChevronRight />
            </button>
            <Link href="/" className="text-[14px] font-medium text-[#5c5c5c] transition-colors hover:text-[#171717]">
              홈으로 돌아가기 →
            </Link>
          </div>
        </section>
      </body>
    </html>
  )
}
