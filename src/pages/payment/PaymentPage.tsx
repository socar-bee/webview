import { useMemo } from 'react'

import { parseEntry, closeWebView } from '@/bridge/appBridge'
import DailyPaymentView from '@/pages/payment/sections/DailyPaymentView'

// daily는 결제 화면 구현됨(목업). 나머지 타입은 진입 파싱 뼈대.
function PaymentPage() {
  const entry = useMemo(() => parseEntry(window.location.search), [])

  if (!entry) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="body-1 text-text-090">잘못된 접근입니다.</p>
        <button className="btn-full bg-main-050 text-text-010 py-3" onClick={closeWebView}>
          닫기
        </button>
      </div>
    )
  }

  if (entry.type === 'daily') {
    return <DailyPaymentView seq={entry.parkinglotSeq} />
  }

  return (
    <div className="flex min-h-screen flex-col gap-3 p-4">
      <h1 className="header-3 text-text-090">주차권 결제 (뼈대)</h1>
      <p className="body-2 text-text-070">type: {entry.type}</p>
      <pre className="caption-1 bg-020 rounded-md p-3">{JSON.stringify(entry, null, 2)}</pre>
      <p className="caption-2 text-text-050">→ 다음: 결제준비 API 조회 + 결제수단 선택</p>
    </div>
  )
}

export default PaymentPage
