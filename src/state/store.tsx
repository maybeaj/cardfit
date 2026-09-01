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
import { calculatePlan } from '@/domain/calc'
import type { CalculationResult, Constraint, FutureSpendPlan, Profile } from '@/domain/types'
import { DEFAULT_PROFILE } from '@/fixtures'
import { loadSession, saveSession, type SessionState } from './session'

interface DemoContextValue extends SessionState {
  profile: Profile
  result: CalculationResult | null
  connect: () => void
  updatePlan: (plan: FutureSpendPlan[]) => void
  refillPlan: () => void
  updateConstraint: (patch: Partial<Constraint>) => void
  confirmPlan: () => void
  confirmCombination: (snapshot: NonNullable<SessionState['confirmed']>) => void
  reset: () => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

function initialState(profile: Profile): SessionState {
  return {
    connected: false,
    // 입력 화면은 빈 폼으로 열리지 않는다 — 과거 패턴 기반 제안값이 이미 채워져 있다 (T3 · FR-006)
    plan: profile.suggested_plan.map((item) => ({ ...item })),
    constraint: { ...profile.constraint },
    planConfirmed: false,
    confirmed: null,
  }
}

export function DemoProvider({
  children,
  profile = DEFAULT_PROFILE,
}: {
  children: ReactNode
  profile?: Profile
}) {
  const [state, setState] = useState<SessionState>(() => initialState(profile))
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const restored = loadSession()
    if (restored) setState(restored)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) saveSession(state)
  }, [state, hydrated])

  const patch = useCallback((next: Partial<SessionState>) => {
    setState((prev) => ({ ...prev, ...next }))
  }, [])

  const value = useMemo<DemoContextValue>(() => {
    const result = state.planConfirmed
      ? calculatePlan({ profile, plan: state.plan, constraint: state.constraint })
      : null

    return {
      ...state,
      profile,
      result,
      connect: () => patch({ connected: true }),
      updatePlan: (plan) => patch({ plan, planConfirmed: false, confirmed: null }),
      refillPlan: () =>
        patch({
          plan: profile.suggested_plan.map((item) => ({ ...item })),
          planConfirmed: false,
          confirmed: null,
        }),
      updateConstraint: (next) =>
        patch({ constraint: { ...state.constraint, ...next }, planConfirmed: false, confirmed: null }),
      confirmPlan: () => patch({ planConfirmed: true }),
      confirmCombination: (snapshot) => patch({ confirmed: snapshot }),
      reset: () => setState(initialState(profile)),
    }
  }, [state, profile, patch])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoContextValue {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemo는 DemoProvider 안에서만 사용할 수 있습니다.')
  return context
}
