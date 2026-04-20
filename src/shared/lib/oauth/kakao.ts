const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'

let loadPromise: Promise<void> | null = null

export function loadKakaoSDK(): Promise<void> {
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    if (window.Kakao) {
      initKakao()
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = KAKAO_SDK_URL
    script.async = true
    script.onload = () => {
      initKakao()
      resolve()
    }
    script.onerror = () => {
      loadPromise = null
      reject(new Error('카카오 SDK 로드 실패'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}

function initKakao() {
  const appKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY
  if (!appKey) throw new Error('NEXT_PUBLIC_KAKAO_APP_KEY가 설정되지 않았습니다')
  if (!window.Kakao?.isInitialized()) {
    window.Kakao!.init(appKey)
  }
}

/**
 * 카카오 로그인 → REST API 방식 (인가코드 → 서버에서 토큰 교환)
 * 여기서는 카카오 JS SDK의 authorize를 사용하여 인가코드를 받고,
 * callback 페이지에서 accessToken을 받아 백엔드로 전달하는 흐름.
 *
 * 간소화: SDK의 Kakao.Auth.authorize → redirectUri callback에서 code 추출
 */
export function loginWithKakao() {
  const redirectUri = `${window.location.origin}/login/callback/kakao`
  window.Kakao!.Auth.authorize({ redirectUri })
}
