/**
 * 네이버 로그인은 OAuth 2.0 표준 흐름을 사용합니다.
 * 1) 인가 URL로 리다이렉트 → 사용자 동의
 * 2) callback에서 access_token 추출 (implicit grant, fragment)
 * 3) 백엔드 POST /login/social로 전달
 */
export function loginWithNaver() {
  const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
  if (!clientId) throw new Error('NEXT_PUBLIC_NAVER_CLIENT_ID가 설정되지 않았습니다')

  const redirectUri = `${window.location.origin}/login/callback/naver`
  const state = generateState()

  sessionStorage.setItem('naver_oauth_state', state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state
  })

  window.location.href = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`
}

function generateState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}
