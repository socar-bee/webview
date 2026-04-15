'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * URL hash 를 `key=value&key2=value2` 형식으로 관리하는 훅.
 *
 * 주 용도:
 * - 시트/모달의 open 상태 (`detail=1`, `timefilter=1`)
 * - 여러 시트/상태가 hash 안에 공존 (`detail=1&parking=123`)
 *
 * 동작:
 * - `set({ key: value })` → 기존 hash에 머지해서 pushState. 브라우저 백버튼으로 close 가능.
 * - `set({ key: null })` / `set({ key: undefined })` / `set({ key: '' })` → 해당 키 제거.
 * - `back()` → `history.back()`. 백버튼과 동일.
 * - 직접 링크(예: `/nearby#detail=1&parking=123`)로 진입 시 앞에 base 엔트리를 replaceState로 삽입해
 *   시트 close → 앱 밖으로 이탈하지 않고 `/nearby` 로 돌아오도록 보정.
 *
 * snap 같이 드래그마다 바뀌는 세부 상태는 hash에 담지 말 것 (history 오염).
 */

export type HashRecord = Record<string, string>
export type HashPartial = Record<string, string | number | null | undefined>

function parseHash(raw: string): HashRecord {
  const clean = raw.startsWith('#') ? raw.slice(1) : raw
  if (!clean) return {}
  return clean.split('&').reduce<HashRecord>((acc, pair) => {
    if (!pair) return acc
    const [key, value] = pair.split('=')
    if (key) acc[decodeURIComponent(key)] = value ? decodeURIComponent(value) : ''
    return acc
  }, {})
}

function serializeHash(record: HashRecord): string {
  const entries = Object.entries(record).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  if (entries.length === 0) return ''
  return '#' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
}

function mergePartial(current: HashRecord, partial: HashPartial): HashRecord {
  const next: HashRecord = { ...current }
  for (const [key, value] of Object.entries(partial)) {
    if (value === null || value === undefined || value === '') delete next[key]
    else next[key] = String(value)
  }
  return next
}

export function useHash() {
  const [hash, setHashState] = useState<HashRecord>(() =>
    typeof window === 'undefined' ? {} : parseHash(window.location.hash)
  )

  // 직접 링크 진입 보정: 현재 history state에 base 플래그가 없으면,
  // 현재 엔트리를 base(hash 제거) + hash 재push 로 교체.
  // → 시트 close 시 `/nearby` 로 되돌아오고, 한 번 더 뒤로가야 앱을 떠남.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.location.hash) return
    const state = window.history.state as { __hashBase?: true } | null
    if (state?.__hashBase) return
    const pathSearch = window.location.pathname + window.location.search
    const full = pathSearch + window.location.hash
    window.history.replaceState({ __hashBase: true }, '', pathSearch)
    window.history.pushState({ __hashBase: true }, '', full)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const sync = () => setHashState(parseHash(window.location.hash))
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  /** hash 키들을 머지 갱신. null/undefined/'' 를 넘기면 해당 키 제거. pushState → 백버튼으로 되돌릴 수 있음. */
  const set = useCallback((partial: HashPartial) => {
    if (typeof window === 'undefined') return
    const current = parseHash(window.location.hash)
    const next = mergePartial(current, partial)
    const hashStr = serializeHash(next)
    const url = `${window.location.pathname}${window.location.search}${hashStr}`
    window.history.pushState({ __hashBase: true }, '', url)
    setHashState(next)
  }, [])

  /** 현재 엔트리를 pushState 없이 replace. 히스토리 안 쌓음. (확정된 필터 파라미터 등) */
  const replace = useCallback((partial: HashPartial) => {
    if (typeof window === 'undefined') return
    const current = parseHash(window.location.hash)
    const next = mergePartial(current, partial)
    const hashStr = serializeHash(next)
    const url = `${window.location.pathname}${window.location.search}${hashStr}`
    window.history.replaceState({ __hashBase: true }, '', url)
    setHashState(next)
  }, [])

  /** 한 칸 뒤로. 시트 close를 백버튼과 동일하게 처리. */
  const back = useCallback(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash) window.history.back()
  }, [])

  return { hash, set, replace, back }
}
