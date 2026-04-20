'use client'

import { useEffect } from 'react'

const useInitKakaoSdk = () => {
  useEffect(() => {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.3.0/kakao.min.js'
    script.integrity = 'sha384-70k0rrouSYPWJt7q9rSTKpiTfX6USlMYjZUtr1Du+9o4cGvhPAWxngdtVZDdErlh'
    script.crossOrigin = 'anonymous'

    document.head.appendChild(script)

    const onLoad = () => {
      window.Kakao?.init(process.env.NEXT_PUBLIC_KAKAO_API_JS_KEY || '')
    }

    script.addEventListener('load', onLoad)

    return () => {
      document.head.removeChild(script)
      script.removeEventListener('load', onLoad)
    }
  }, [])
}

export { useInitKakaoSdk }
