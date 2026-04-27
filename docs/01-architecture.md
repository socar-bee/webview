# 01 · Architecture

## 한 줄 요약

Next.js 16 App Router, **MVVM 라우트 구조**, 서버 상태는 TanStack Query, 클라이언트 상태는 Zustand. 모바일-first 단일 페이지 흐름.

## 라우트 레이아웃

모든 라우트는 다음 구조를 따른다. 새 라우트도 이 형태로 정렬한다.

```
src/app/<route>/
  model/
    types.ts      TypeScript 타입/인터페이스
    api.ts        axios 호출 함수 (훅 없음)
    queries.ts    TanStack Query 훅 (useQuery, queryKey factory)
    index.ts      re-export
  view/
    <Name>View.tsx  UI 컴포넌트, viewmodel만 import
    index.ts
  viewmodel/
    use<Name>ViewModel.ts  state + query 통합
    index.ts
  routes.ts       <NAME>_ROUTES 상수 (path 빌더)
  page.tsx        thin shell — view를 마운트만
```

**원칙**

- View는 viewmodel만 본다. View 안에 fetch/queryClient/store 직접 호출 금지.
- ViewModel은 query 훅을 모아 화면용 derived state를 만든다. UI 토글 state도 여기에 둔다.
- model은 순수 데이터 레이어. 훅 외 다른 React 의존성 금지.

## 상태 관리

| 종류                   | 도구              | 위치                                                                                                                                                    |
| ---------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 서버 상태              | TanStack Query v5 | `model/queries.ts` 단위로 분산. `QueryProvider`(`src/shared/providers/QueryProvider.tsx`)가 root layout을 감싼다. 기본 `staleTime: 60_000`, `retry: 1`. |
| 클라이언트 상태 (전역) | Zustand v5        | `src/shared/stores/*`. 예: `authStore`(localStorage persist).                                                                                           |
| 클라이언트 상태 (지역) | React state/refs  | viewmodel 내부                                                                                                                                          |
| URL 상태               | `useSearchParams` | 시간필터(`parkingDate`, `durationId`), sheet open(`?sheet=1`), 검색좌표(`lat/lng`) 등                                                                   |

## HTTP 클라이언트

두 종류의 axios 인스턴스가 있다. **반드시 적합한 클라이언트를 골라 쓴다.**

- `apiClient` (`src/shared/lib/apiClient.ts`) — `NEXT_PUBLIC_MODU_API_HOST`. 기본 API.
- `advanceApiClient` (`src/app/(tabs)/map/model/api.ts`) — 사전예약 dev preview (`https://moduapi-dev-preview-advance-purchase.socar.me`). 지도/주차권 예매 관련 엔드포인트 전용.

자세한 정책은 [02-api-layer.md](./02-api-layer.md).

## 공유 자원

- **Providers** — `src/shared/providers/` (QueryProvider, etc.)
- **Components** — `src/shared/components/{layout, map, ui, scripts, icons}`
- **Lib utils** — `src/shared/lib/{apiClient, date, seo, oauth, clustering, constants}`
- **Stores** — `src/shared/stores/`
- **Types** — `src/shared/types/`
- **Lottie/이미지** — `src/shared/assets/lottie/`, `public/images/`

## Path alias

`@/*` → `src/*` (tsconfig).

## Node / 패키지 매니저

- Node `^24.12.0` (`.nvmrc`: `24`)
- pnpm
- 사전 커밋 hook: `husky` + `lint-staged` (`eslint --fix` + `prettier --write`)

## 개발 명령

```bash
pnpm dev          # APP_ENV=local + Turbopack, 포트 5173
pnpm build        # type-check + next build
pnpm type-check
pnpm lint
pnpm format
```

테스트 러너는 미설정. type-check + ESLint로 회귀 방지.
