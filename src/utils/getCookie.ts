/** document.cookie에서 key에 해당하는 값 반환. 앱이 주입한 토큰 읽기용. */
export function getCookie(findKey: string): string | null {
  if (typeof document === 'undefined' || !document.cookie) return null
  for (const cookie of document.cookie.split(';')) {
    const [key, value] = cookie.trim().split('=')
    if (key === findKey) return decodeURIComponent(value ?? '')
  }
  return null
}
