# 02 · API Layer

## 두 개의 axios 인스턴스

### `apiClient` (기본)

- 위치: `src/shared/lib/apiClient.ts`
- baseURL: `process.env.NEXT_PUBLIC_MODU_API_HOST`
- 용도: 일반 API (로그인, 유저 프로필, 마이티켓, 검색 등)

### `advanceApiClient` (preview)

- 위치: `src/app/(tabs)/map/model/api.ts`
- baseURL: `https://moduapi-dev-preview-advance-purchase.socar.me`
- 용도: **사전예약(advance purchase) preview 환경 전용**. 지도 핀 v2, 주차장 상세, 주차권 list/detail/daily-able-time

## 어떤 엔드포인트를 어떤 클라이언트로 부르는가

`modu-web-app`의 `milestone/ticket-reservation` 브랜치 정책을 그대로 따르므로, 새 엔드포인트 추가 시 그쪽 정책을 우선 확인한다. 현재 분기 기준:

| 엔드포인트                               | 클라이언트         | 비고                       |
| ---------------------------------------- | ------------------ | -------------------------- |
| `/poi/pins` (v2, geohash)                | `advanceApiClient` | 헤더 `modu-api-version: 2` |
| `/poi/pins/:type/:seq` (상세)            | `advanceApiClient` |                            |
| `/poi/meta`                              | `advanceApiClient` | bounds 기반 핀 존재 여부   |
| `/poi/pin-assets`                        | `advanceApiClient` |                            |
| `/poi/pins/ticket-group`                 | `advanceApiClient` |                            |
| `/poi/sitemap`                           | `advanceApiClient` |                            |
| `/ticket/list`                           | `advanceApiClient` |                            |
| `/ticket/:couponSeq`                     | `advanceApiClient` | 주차권 상세                |
| `/ticket/:seq/daily-able-time`           | `advanceApiClient` |                            |
| `/ticket/time-filter-options`            | `advanceApiClient` |                            |
| `/ticket/:seq/monthly-able-date`         | `apiClient`        |                            |
| `/ticket/payment/...`                    | `apiClient`        | 결제                       |
| `/ticket/my-ticket/...`                  | `apiClient`        | 내 주차권                  |
| `/user/...`, `/login/...`, `/search/...` | `apiClient`        |                            |

## `parkingDate` / `durationId` query 규칙

사전예약 엔드포인트는 시간필터를 query string으로 받는다. **반드시 같이 보낸다.**

- `parkingDate`: `YYYY-MM-DD` (Asia/Seoul). 없으면 오늘로 fallback.
- `durationId`: 시간 옵션 ID (예: `PT1H`). 선택값 — 없으면 보내지 않음.

### 기본값 헬퍼

```ts
import { getTodayInSeoul, resolveParkingDate } from '@/shared/lib/date'

resolveParkingDate(searchParams.get('parkingDate'))
// → 값 있으면 그대로, 없으면 getTodayInSeoul() 반환
```

### 호출 사이트별 주입 위치

- **API 함수** (`*/model/api.ts`): `parkingDate` 파라미터 받고 query에 넣는다.
- **쿼리 훅** (`*/model/queries.ts`): queryKey에 `parkingDate`/`durationId` 포함 → 필터 변경 시 자동 refetch.
- **ViewModel**: `useSearchParams`로 URL에서 읽어서 전달.
- **SSR 페이지** (`/p/[id]/page.tsx`): `searchParams`에서 받아 `resolveParkingDate`로 보정 후 fetch.

### 네비게이션 전파

페이지 간 이동 시 query string을 carry한다 (예: `goToPayment`):

```ts
const carryQuery = useMemo(() => {
  const p = new URLSearchParams()
  if (parkingDate) p.set('parkingDate', parkingDate)
  if (durationId) p.set('durationId', durationId)
  const s = p.toString()
  return s ? `&${s}` : ''
}, [parkingDate, durationId])

router.push(`/parking/${seq}/payment?couponSeq=${couponSeq}${carryQuery}`)
```

## 에러 처리

- `retry: 1`이 기본. 4xx에서 재시도 안 하려면 query별로 재정의.
- SSR 페이지는 try/catch로 감싸고 `notFound()` 반환.
- 클라이언트 에러는 `error` 상태로 노출만 하고 사용자 토스트로 처리.

## class-transformer 미사용

`modu-web-app`은 DTO에 `class-transformer`를 쓰지만, **`modu-web`에서는 plain object + TypeScript 타입으로만** 다룬다. axios 응답 타입을 generic으로 박는다.

```ts
const { data } = await advanceApiClient.get<{ data: TicketDetail }>(`/ticket/${couponSeq}`, {
  params: { parkingDate }
})
return data.data
```
