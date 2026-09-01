import type { Constraint, FutureSpendPlan } from '@/domain/types'

/**
 * 세션 상태 — 아웃링크로 나갔다 돌아왔을 때 입력값과 확정 조합을 보존한다 (T28 · ADR-003).
 * 서버·DB에 저장하지 않는다. 새로고침으로 홈에 돌아가는 것은 정상 동작이다.
 */
export interface SessionState {
  connected: boolean
  plan: FutureSpendPlan[]
  constraint: Constraint
  planConfirmed: boolean
  /** 확정 시점 스냅샷 — 자동 재계산하지 않는다 (T43) */
  confirmed: {
    candidate_id: string
    rule_versions: Record<string, string>
    as_of_date: string
    net_benefit: number
    confirmed_at: string
  } | null
}

const KEY = 'cardfit.session'

export function loadSession(): SessionState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw) as SessionState
  } catch {
    // 복원할 수 없는 값은 폐기한다
    return null
  }
}

export function saveSession(state: SessionState): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // 저장 실패는 흐름을 막지 않는다
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    // no-op
  }
}
