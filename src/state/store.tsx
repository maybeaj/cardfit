'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Calculation, Constraint, FutureSpendPlan, Profile } from '@/domain/cardfit/types'
import type { ActionError } from '@/server/errors'
import { calculateAction } from '@/actions/cardfit/calculate-plan'
import { savePreferenceAction } from '@/actions/cardfit/save-preference'
import { clearSession, loadSession, saveSession, type SessionState } from './session-storage'

/**
 * 화면 상태.
 *
 * **계산 엔진을 여기서 부르지 않는다.** 금액을 만드는 경로는 Server Action 하나뿐이고,
 * 화면은 그 결과를 받아 그릴 뿐이다 — 클라이언트에도 엔진이 있으면 같은 입력에 두 개의
 * 계산 경로가 생기고, 어느 쪽 금액이 정본인지 말할 수 없게 된다 (`NFR-001`).
 *
 * `src/fixtures`도 직접 import하지 않는다 — Mock의 정본은 DB다 (`ADR-004`).
 */
interface DemoContextValue extends SessionState {
  profile: Profile
  calculation: Calculation | null
  error: ActionError | null
  pending: boolean
  connect: () => void
  updatePlan: (plan: FutureSpendPlan[]) => void
  refillPlan: () => void
  updateConstraint: (patch: Partial<Constraint>) => void
  requestCalculation: () => Promise<void>
  confirmCombination: () => void
  clearError: () => void
  /** 지출 탐색 시나리오별 결과. 서버가 한 번에 만들어 내려준다 */
  scenarios: Record<string, Calculation | null>
}

const DemoContext = createContext<DemoContextValue | null>(null)

function newSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `s-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

function initialState(profile: Profile): SessionState {
  return {
    sessionId: '',
    connected: false,
    // 입력 화면은 빈 폼으로 열리지 않는다 — 제안값이 이미 채워져 있다 (T3 · FR-006)
    plan: profile.suggested_plan.map((item) => ({ ...item })),
    constraint: { ...profile.constraint },
    planConfirmed: false,
    confirmed: null,
  }
}

export function DemoProvider({ children, profile }: { children: ReactNode; profile: Profile }) {
  const [state, setState] = useState<SessionState>(() => initialState(profile))
  const [calculation, setCalculation] = useState<Calculation | null>(null)
  const [scenarios, setScenarios] = useState<Record<string, Calculation | null>>({})
  const [calculationId, setCalculationId] = useState<string | null>(null)
  const [error, setError] = useState<ActionError | null>(null)
  const [pending, setPending] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    /*
     * 랜딩 CTA는 `/app?restart=1`로 넘어온다 — 이전 세션 입력을 지우고 처음부터 시작하라는 뜻이다.
     * 아웃링크에서 돌아올 때는 이 표시가 없으므로 입력값과 확정 조합이 그대로 복원된다 (`T28`).
     */
    const restart = new URLSearchParams(window.location.search).get('restart') === '1'
    if (restart) {
      clearSession()
      // 주소창에 표시가 남으면 새로고침할 때마다 입력이 지워진다
      window.history.replaceState(null, '', window.location.pathname)
      setState(initialState(profile))
      setHydrated(true)
      return
    }

    const restored = loadSession()
    setState((prev) => ({ ...(restored ?? prev), sessionId: restored?.sessionId || newSessionId() }))
    setHydrated(true)
  }, [profile])

  useEffect(() => {
    if (hydrated) saveSession(state)
  }, [state, hydrated])

  const patch = useCallback((next: Partial<SessionState>) => {
    setState((prev) => ({ ...prev, ...next }))
  }, [])

  const invalidate = useCallback(() => {
    setCalculation(null)
    setScenarios({})
    setCalculationId(null)
    setError(null)
  }, [])

  const value = useMemo<DemoContextValue>(() => {
    return {
      ...state,
      profile,
      calculation,
      scenarios,
      error,
      pending,
      clearError: () => setError(null),

      connect: () => {
        const sessionId = state.sessionId || newSessionId()
        patch({ connected: true, sessionId })
      },

      updatePlan: (plan) => {
        patch({ plan, planConfirmed: false, confirmed: null })
        invalidate()
        if (!state.sessionId) patch({ sessionId: newSessionId() })
      },

      refillPlan: () => {
        const plan = profile.suggested_plan.map((item) => ({ ...item }))
        patch({ plan, planConfirmed: false, confirmed: null })
        invalidate()
      },

      updateConstraint: (next) => {
        patch({ constraint: { ...state.constraint, ...next }, planConfirmed: false, confirmed: null })
        invalidate()
      },

      requestCalculation: () => {
        setError(null)
        setPending(true)
        const sessionId = state.sessionId || newSessionId()
        return calculateAction(profile.fixture_id, sessionId, state.plan, state.constraint)
          .then((result) => {
            if (!result.ok) {
              setError(result.error)
              patch({ sessionId, planConfirmed: false })
              return
            }
            setCalculation(result.data.calculation)
            setScenarios(result.data.scenarios)
            setCalculationId(result.data.calculationId)
            patch({ sessionId, planConfirmed: true })
          })
          .finally(() => setPending(false))
      },

      confirmCombination: () => {
        if (!calculation) return
        const shown = calculation.decision === '변경' ? calculation.chosen : calculation.current
        const sessionId = state.sessionId || newSessionId()
        patch({
          sessionId,
          confirmed: {
            candidate_id: shown.candidate_id,
            rule_versions: calculation.rule_versions,
            as_of_date: calculation.as_of_date,
            net_benefit: shown.net_benefit,
            confirmed_at: new Date().toISOString(),
          },
        })
        // 기록 실패가 결과 확인 흐름을 막지 않는다 — 화면은 이미 선택을 반영했다
        if (calculationId) void savePreferenceAction(calculationId, shown.candidate_id)
      },
    }
  }, [state, profile, calculation, scenarios, calculationId, error, pending, patch, invalidate])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemo는 DemoProvider 안에서만 사용할 수 있습니다.')
  return context
}
