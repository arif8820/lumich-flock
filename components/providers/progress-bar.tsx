'use client'
// client: needs usePathname + useSearchParams + useState to detect navigation and show overlay

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function ProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const prevKey = useRef(`${pathname}?${searchParams}`)
  // track pending hide timeout so fast navigations don't flicker
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const currentKey = `${pathname}?${searchParams}`
    if (currentKey !== prevKey.current) {
      prevKey.current = currentKey
      if (hideTimer.current) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setLoading(false), 150)
    }
  }, [pathname, searchParams])

  // intercept link clicks to show overlay immediately
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('http') || anchor.target === '_blank') return
      if (hideTimer.current) clearTimeout(hideTimer.current)
      setLoading(true)
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  if (!loading) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(247,245,241,0.6)', backdropFilter: 'blur(2px)' }}
    >
      <div
        className="w-10 h-10 rounded-full border-[3px] border-transparent animate-spin"
        style={{
          borderTopColor: '#7aadd4',
          borderRightColor: '#bbd5ee',
        }}
      />
    </div>
  )
}
