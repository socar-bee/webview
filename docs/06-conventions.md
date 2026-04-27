# 06 · Conventions

코드/커밋/PR 스타일 합의.

## TypeScript & 모듈

- Path alias: `@/*` → `src/*`. 상대 경로 점 두 단계 이상이면 alias 우선.
- `import type { ... }` — 타입만 가져올 땐 항상 `type` 모디파이어. 트리쉐이킹 + tsc 속도.
- 함수/유틸은 default export 지양, named export 우선. 컴포넌트는 default export 허용.
- enum보다 `as const` + union 타입 선호. (예: `DETAIL_TABS`)

## ESLint / Prettier

- 사전 커밋 hook(lint-staged)이 자동 `eslint --fix` + `prettier --write`. 커밋 실패 시 hook 메시지 따라 수정.
- 빠르게 자동 정리: `pnpm eslint src --ext .ts,.tsx --fix` (특히 `import/order` 위반).
- `react-hooks/set-state-in-effect` 위반은 의도적 예외만 줄 단위 disable + 주석.
- `<img>` 대신 `next/image` 사용 (Footer 광고 배너 같은 예외만 disable 허용).

## 네이밍

- 컴포넌트 파일: PascalCase (`ParkingDetailSheet.tsx`)
- 훅 파일: `use<Name>.ts` 또는 viewmodel 폴더에 `use<Name>ViewModel.ts`
- 모델 함수: `fetch<Resource>` (axios), `<resource>QueryKeys`, `use<Resource>`
- 라우트 상수: `<NAME>_ROUTES` (`routes.ts`)
- public 이미지: snake_case (`dock_map_pin.webp`, `img_app_banner.webp`)

## 주석

- **WHY 위주.** 명명만으로 안 잡히는 의도/제약/회피사유.
- 한 줄 코멘트 우선. 다단락 docblock 금지.
- "TODO/FIXME" 남길 때 컨텍스트(이슈/PR/날짜) 같이.

## 커밋 스타일

```
<type>: <한국어 짧은 요약> — <보조 설명/원인 위주>

(본문) ‘왜’ 중심으로 1-3문단. 변경 파일이 많을 땐 bullet.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

- type: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`
- 요약은 70자 이내. 본문은 wrap 100자.
- 한국어 본문 + 영문 type 혼용. 회사 컨벤션 그대로.

## PR

- 제목 70자 이내. 본문에 Summary / Test plan 섹션. ([CLAUDE.md 참조])
- 동일 영역 변경은 한 PR에 묶고, 큰 작업은 의미 단위 분리.
- 스크린샷이 도움되는 변경(UI)은 항상 첨부.

## 새 라우트 추가 시 체크리스트

1. [ ] `src/app/<route>/{model, view, viewmodel, routes.ts, page.tsx}` 구조로 정렬
2. [ ] `model/api.ts` — 적절한 axios 클라이언트 선택 ([02-api-layer.md](./02-api-layer.md))
3. [ ] `model/queries.ts` — 의존하는 query param을 queryKey에 포함
4. [ ] `view/`는 viewmodel만 import, store/queryClient 직접 호출 금지
5. [ ] hydration mismatch 위험 코드(`localStorage`, `window`, `Date.now()`) 점검 ([05-ui-patterns.md](./05-ui-patterns.md#hydration-안전-패턴))
6. [ ] DockBar 같은 공유 자원에 영향 있으면 `--dock-height` 등 CSS 변수 동작 확인
7. [ ] type-check + ESLint 통과

## 메모리 / 외부 시스템

- 글로벌 Jira/Confluence 규칙은 `~/.claude/CLAUDE.md` (티켓/문서 자동 생성 시 참고).
- 프로젝트 외 컨텍스트(상위 인접 레포 `modu-web-app`, `modu-web-admin` 등)는 `~/Desktop/modu/`에 위치. 디자인/정책 레퍼런스가 필요하면 거기서 가져온다.
