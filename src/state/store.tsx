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
import type { Calculation, Constraint, FutureSpendPlan, Profile } from '@/domain/types'
import type { ActionError } from '@/server/errors'
import { engine } from '@/domain/recommendation'
import { clearSession, loadSession, saveSession, type SessionState } from './session'

/**
 * 화면 상태. 결정론적 계산은 즉시 수행하고 DB 기록은 화면 전환과 분리한다 (TEC-05).
 * `src/fixtures`를 직접 import하지 않는다 — Mock의 정본은 DB다 (TECH_SPEC 4절).
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
  requestCalculation: () => void
  confirmCombination: () => void
  clearError: () => void
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
  const [error, setError] = useState<ActionError | null>(null)
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
    setError(null)
  }, [])

  const value = useMemo<DemoContextValue>(() => {
    return {
      ...state,
      profile,
      calculation,
      error,
      pending: false,
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
        const result = engine.calculate({ profile, plan: state.plan, constraint: state.constraint })
        if (!result.ok) {
          setError({
            code: result.code === 'EMPTY_PLAN' ? 'INVALID_PLAN' : 'EVIDENCE_INCOMPLETE',
            message: result.reason,
            missing: [],
            retryable: true,
          })
          patch({ planConfirmed: false })
          return
        }
        setCalculation(result.calculation)
        patch({ planConfirmed: true })
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
        void fetch('/api/calculations/confirm', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            fixtureId: profile.fixture_id,
            sessionId,
            plan: state.plan,
            constraint: state.constraint,
            candidateKey: shown.candidate_id,
          }),
          keepalive: true,
        }).then(async (response) => {
          if (response.ok) return
          const result = (await response.json()) as { error?: ActionError }
          if (result.error && typeof result.error !== 'string') setError(result.error)
        })
      },
    }
  }, [state, profile, calculation, error, patch, invalidate])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemo는 DemoProvider 안에서만 사용할 수 있습니다.')
  return context
}
