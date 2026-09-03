'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useFlow } from '@/state/store'

/** 동의 전에는 온보딩 외의 딥링크·직접 URL 접근을 허용하지 않는다. */
export function ConsentGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { consented, hydrated } = useFlow()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!hydrated || consented || pathname === '/app') return
    setRedirecting(true)
    router.replace('/app')
  }, [consented, hydrated, pathname, router])

  if (pathname !== '/app' && (!hydrated || !consented || redirecting)) {
    return <div className="route-loading" role="status" aria-live="polite">불러오는 중…</div>
  }
  return <>{children}</>
}
