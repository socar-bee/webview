'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { IcoHome, IcoMyPage, IcoNearby, IcoReviews, IcoTickets } from '@/shared/components/icons'
const NAV_ITEMS = [
  { label: '홈', href: '/', icon: IcoHome },
  { label: '후기', href: '/reviews', icon: IcoReviews },
  { label: '내 주변', href: '/map', icon: IcoNearby },
  { label: '내 주차권', href: '/tickets', icon: IcoTickets },
  { label: 'MY', href: '/my', icon: IcoMyPage }
] as const

export default function DockBar() {
  const pathname = usePathname()
  const router = useRouter()
  const navRef = useRef<HTMLElement>(null)

  // 시트/오버레이에서 참조할 수 있도록 dock 높이를 :root CSS 변수로 노출
  useEffect(() => {
    const el = navRef.current
    if (!el) return
    const update = () => {
      const h = el.getBoundingClientRect().height
      document.documentElement.style.setProperty('--dock-height', `${h}px`)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--dock-height')
    }
  }, [])

  const handleClick = (item: (typeof NAV_ITEMS)[number]) => {
    router.push(item.href)
  }

  return (
    <nav
      ref={navRef}
      className="border-stroke-soft bg-bg-white relative z-[var(--z-dock)] shrink-0 border-t pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around py-2.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <button
              key={item.href}
              onClick={() => handleClick(item)}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Icon active={isActive} />
              <span
                className={`text-[10px] leading-[14px] ${isActive ? 'text-primary font-medium' : 'text-[#222222]'}`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
