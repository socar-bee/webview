interface Window {
  Kakao?: {
    init: (appKey: string) => void
    isInitialized: () => boolean
    Auth: {
      authorize: (options: { redirectUri: string; scope?: string }) => void
    }
    API: {
      request: (options: { url: string }) => Promise<{ id: number }>
    }
  }
}
