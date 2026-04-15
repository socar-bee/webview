# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (Turbopack, APP_ENV=local)
pnpm build        # Type-check + Next.js build
pnpm type-check   # tsc --noEmit
pnpm lint         # ESLint
pnpm format       # Prettier
```

No test runner is configured. Pre-commit hook runs `eslint --fix` + `prettier --write` via lint-staged.

After editing any TypeScript file, run `pnpm eslint src --ext .ts,.tsx --fix` to auto-fix `import/order` violations before committing.

## Architecture

### Route structure

Every route follows this MVVM layout:

```
src/app/<route>/
  model/
    types.ts      # TypeScript types / interfaces
    api.ts        # axios API calls (no hooks)
    queries.ts    # TanStack Query hooks (useQuery, query key factories)
    index.ts      # re-exports
  view/
    <Name>View.tsx  # UI component, imports from ../viewmodel
    index.ts
  viewmodel/
    use<Name>ViewModel.ts  # state + query integration
    index.ts
  routes.ts       # <NAME>_ROUTES constants
  page.tsx        # thin shell: `import View from './view'; export default View`
```

Routes that don't yet have this structure should be migrated to it.

### State management

- **Server state**: TanStack Query v5. `QueryProvider` wraps the root layout (`src/shared/providers/QueryProvider.tsx`). Default `staleTime: 60_000`, `retry: 1`.
- **Client state**: Zustand v5. Auth store at `src/shared/stores/authStore.ts` with localStorage persistence.

### HTTP

All API calls use axios. Two clients:

- `src/shared/lib/apiClient.ts` — baseURL: `NEXT_PUBLIC_MODU_API_HOST`
- `src/app/(tabs)/map/model/api.ts` — `advanceApiClient`, baseURL: `https://moduapi-dev-preview-advance-purchase.socar.me` (map/parking-specific)

### Key shared components

- `src/shared/components/ui/AnimationSheet.tsx` — framer-motion bottom sheet with 3 snap points (`peek` / `half` / `full`). Clicking the drag handle closes the sheet.
- `src/shared/components/map/TimeFilterSheet.tsx` — bottom sheet positioned above the Dock via `style={{ bottom: 'var(--dock-height, 0px)' }}`
- `src/shared/components/layout/DockBar.tsx` — sets `--dock-height` CSS variable via ResizeObserver

### Map tab specifics

- Naver Maps API loaded dynamically in `MapView.tsx`; init called via `vm.initMap()`
- Sheet open state: `?sheet=1` query param only (no `parking=` or hash)
- Marker icon caching: keyed by `markerType|label|ticketName|ticketPrice|isOn` fingerprint stored in `markerIconCache` ref
- Pin fingerprinting: `pinFingerprints` ref skips redrawing markers whose visual state hasn't changed

### Path aliases

`@/*` → `src/*`

### Node version

Requires Node ^24.12.0 (see `.nvmrc` → `24`).
