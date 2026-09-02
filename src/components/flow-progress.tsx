'use client'

import { usePathname } from 'next/navigation'

/**
 * 진행 표시줄 — 기준본 `.progress`. 8칸이며 현재 화면까지 채운다.
 *
 * 기준본은 `go(id)`에서 `i <= Number(id.slice(1))`로 칠하므로 s0에서 1칸, s7에서 8칸이 된다.
 * 여기서는 경로로 같은 순서를 만든다. 탭 네비게이션이 아니라 진행 상태 표시다 (`T14`).
 */
const FLOW_ORDER = [
  '/app',
  '/app/consent',
  '/app/summary',
  '/app/plan',
  '/app/constraint',
  '/app/result',
  '/app/evidence',
  '/app/confirm',
] as const

const STEPS = FLOW_ORDER.length

export function FlowProgress() {
  const pathname = usePathname()

  // 계산 중 화면은 결과와 같은 칸으로 본다 — 없는 단계를 새로 만들지 않는다
  const normalized = pathname === '/app/calculating' ? '/app/result' : pathname
  const index = FLOW_ORDER.indexOf(normalized as (typeof FLOW_ORDER)[number])
  // 동의 시트는 온보딩 위에 열리므로 경로가 /app 그대로다. 최소 1칸은 채운다
  const filled = index < 0 ? 1 : index + 1

  return (
    <div
      className="progress"
      role="progressbar"
      aria-label="진행 상태"
      aria-valuemin={1}
      aria-valuemax={STEPS}
      aria-valuenow={filled}
    >
      {Array.from({ length: STEPS }, (_, i) => (
        <i key={i} className={i < filled ? 'on' : undefined} />
      ))}
    </div>
  )
}
