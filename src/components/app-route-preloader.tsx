'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const APP_ROUTES = [
  '/app',
  '/app/summary',
  '/app/plan',
  '/app/constraint',
  '/app/calculating',
  '/app/result',
  '/app/evidence',
  '/app/confirm',
] as const

/** 앱 흐름은 선형이고 경로 수가 작으므로 첫 화면에서 목적 화면 RSC를 미리 준비한다. */
export function AppRoutePreloader() {
  const router = useRouter()

  useEffect(() => {
    for (const route of APP_ROUTES) router.prefetch(route)
  }, [router])

  return null
}
