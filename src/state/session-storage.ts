import type { Constraint, FutureSpendPlan } from '@/domain/cardfit/types'

/**
 * 외부 링크 복귀용 임시 화면 상태 (T28 · ADR-003).
 * **정본 데이터는 Server Actions를 통해 DB에 저장한다** — sessionStorage가 정본을 대체하지 않는다.
 */
export interface SessionState {
  /** 로그인이 없어 클라이언트가 만든 세션 키. 정본 데이터를 DB에서 묶는 데 쓴다 (ADR-003) */
  sessionId: string
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
