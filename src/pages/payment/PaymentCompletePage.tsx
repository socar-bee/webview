import { sendPaymentResult } from '@/bridge/appBridge'

// 1단계 뼈대: 결제 완료 후 앱으로 결과 전달 검증.
function PaymentCompletePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="header-3 text-text-090">결제 완료 (뼈대)</h1>
      <button
        className="btn-full bg-main-050 text-text-010 py-3"
        onClick={() => sendPaymentResult({ status: 'success' })}
      >
        앱으로 돌아가기
      </button>
    </div>
  )
}

export default PaymentCompletePage
