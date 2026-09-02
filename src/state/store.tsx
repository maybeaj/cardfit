'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { BASE_SPENDS, type SpendItem } from '@/fixtures/prototype'
import {
  buildOutcomes,
  isPlanEmpty,
  signedTotal,
  type Outcome,
  type Outcomes,
  type ScenarioKey,
} from '@/domain/scenario'
import { logEvent } from './events'

/**
 * 앱 흐름의 상태 — 기준본의 모듈 스코프 변수(`spends`·`maxCards`·`includeNew`·`outcomes`)를
 * 화면 사이에서 유지하기 위한 컨테이너다 (`D-011`).
 *
 * **왜 클라이언트인가** — 기준본은 결정론적 Mock이고 서버가 만들어 낼 값이 없다.
 * 계산은 `src/domain/scenario.ts`가 순수 함수로 수행하며 같은 입력이면 같은 결과가 나온다 (NFR-001).
 * 실연동 전환 지점은 `src/server/repository.ts` 하나로 남겨 둔다 (ADR-001).
 *
 * 세션 저장소에 상태를 남기는 이유 — 아웃링크(카드사 공식 페이지)에서 돌아왔을 때
 * 입력값과 결과가 그대로 있어야 한다 (`T28`). 새로고침으로 홈에 돌아가는 것은 정상 동작이다.
 */

const STORAGE_KEY = 'cardfit.flow'

interface FlowState {
  consented: boolean
  spends: SpendItem[]
  maxCards: number
  includeNew: boolean
  scenario: ScenarioKey
  /** 계산 결과. 계산 전에는 `null`이다 */
  outcomes: Outcomes | null
  liked: boolean
  /** 방금 지운 항목 — 되돌리기용. 삭제는 확인 없이 되지만 되돌릴 수 있어야 한다 */
  lastRemoved: { index: number; item: SpendItem } | null
}

function initialState(): FlowState {
  return {
    consented: false,
    // 입력 화면은 빈 폼으로 열리지 않는다 — 제안값이 이미 채워져 있다 (`T3` · FR-006)
    spends: BASE_SPENDS.map((item) => ({ ...item })),
    maxCards: 2,
    includeNew: true,
    scenario: 'expected',
    outcomes: null,
    liked: false,
    lastRemoved: null,
  }
}

interface FlowContextValue extends FlowState {
  /** 현재 선택한 시나리오의 결과. 계산 전에는 `null` */
  outcome: Outcome | null
  planTotal: number
  planEmpty: boolean
  consent: () => void
  setCategory: (index: number, category: string) => void
  setAmount: (index: number, amount: number) => void
  setSpendingMonths: (index: number, months: number) => void
  addSpend: () => void
  removeSpend: (index: number) => void
  undoRemove: () => void
  dismissRemoved: () => void
  changeMaxCards: (delta: number) => void
  setIncludeNew: (value: boolean) => void
  /** 기준본 `calculate()` — 세 시나리오를 한 번에 만들고 `예상대로`를 선택한다 */
  calculate: () => Outcomes
  /** 결과가 없으면 현재 입력으로 계산한다. 딥링크·새로고침 진입을 막지 않는다 */
  ensureOutcomes: () => Outcomes
  selectScenario: (key: ScenarioKey) => void
  like: () => void
  reset: () => void
}

const FlowContext = createContext<FlowContextValue | null>(null)

/** 저장된 값이 지금 스키마와 맞는지 확인한다. 복원할 수 없는 값은 폐기한다 */
function restore(): FlowState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<FlowState>
    if (!Array.isArray(parsed.spends)) return null
    return { ...initialState(), ...parsed, spends: parsed.spends.map((item) => ({ ...item })) }
  } catch {
    return null
  }
}

export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FlowState>(initialState)
  const hydrated = useRef(false)

  useEffect(() => {
    /*
     * 랜딩 CTA는 `/app?restart=1`로 넘어온다 — 이전 세션 입력을 지우고 처음부터 시작하라는 뜻이다.
     * 아웃링크에서 돌아올 때는 이 표시가 없으므로 입력값과 결과가 그대로 복원된다 (`T28`).
     */
    if (new URLSearchParams(window.location.search).get('restart') === '1') {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY)
      } catch {
        // 삭제 실패는 흐름을 막지 않는다
      }
      // 주소창에 표시가 남으면 새로고침할 때마다 입력이 지워진다
      window.history.replaceState(null, '', window.location.pathname)
      hydrated.current = true
      return
    }

    const restored = restore()
    if (restored) setState(restored)
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // 저장 실패는 흐름을 막지 않는다
    }
  }, [state])

  /** 계획이 바뀌면 이전 결과를 버린다 — 옛 결과를 새 입력의 결론처럼 보여주지 않는다 */
  const patchSpends = useCallback((next: (spends: SpendItem[]) => SpendItem[]) => {
    setState((prev) => ({ ...prev, spends: next(prev.spends), outcomes: null, liked: false }))
  }, [])

  const value = useMemo<FlowContextValue>(() => {
    const outcome = state.outcomes ? state.outcomes[state.scenario] : null

    const run = (): Outcomes => {
      const outcomes = buildOutcomes(state.spends, state.maxCards, state.includeNew)
      setState((prev) => ({ ...prev, outcomes, scenario: 'expected', liked: false }))
      return outcomes
    }

    return {
      ...state,
      outcome,
      planTotal: signedTotal(state.spends),
      planEmpty: isPlanEmpty(state.spends),

      consent: () => setState((prev) => ({ ...prev, consented: true })),

      setCategory: (index, category) =>
        patchSpends((spends) =>
          spends.map((item, i) => (i === index ? { ...item, label: category } : item)),
        ),

      setAmount: (index, amount) =>
        patchSpends((spends) =>
          spends.map((item, i) =>
            i === index ? { ...item, amount: Math.max(0, Number(amount) || 0) } : item,
          ),
        ),

      setSpendingMonths: (index, months) =>
        patchSpends((spends) =>
          spends.map((item, i) => (i === index ? { ...item, spendingMonths: months } : item)),
        ),

      // 중간 선택창 없이 편집 가능한 새 항목이 즉시 추가된다 (UI-002)
      addSpend: () =>
        patchSpends((spends) => [
          ...spends,
          { id: `custom${Date.now()}`, label: '기타', amount: 0, spendingMonths: 1 },
        ]),

      removeSpend: (index) => {
        const item = state.spends[index]
        if (!item) return
        setState((prev) => ({
          ...prev,
          spends: prev.spends.filter((_, i) => i !== index),
          lastRemoved: { index, item },
          outcomes: null,
          liked: false,
        }))
      },

      undoRemove: () =>
        setState((prev) => {
          if (!prev.lastRemoved) return prev
          const spends = [...prev.spends]
          spends.splice(prev.lastRemoved.index, 0, prev.lastRemoved.item)
          return { ...prev, spends, lastRemoved: null, outcomes: null, liked: false }
        }),

      dismissRemoved: () => setState((prev) => ({ ...prev, lastRemoved: null })),

      changeMaxCards: (delta) =>
        setState((prev) => ({
          ...prev,
          maxCards: Math.max(1, Math.min(3, prev.maxCards + delta)),
          outcomes: null,
          liked: false,
        })),

      setIncludeNew: (includeNew) =>
        setState((prev) => ({ ...prev, includeNew, outcomes: null, liked: false })),

      calculate: () => {
        logEvent('계산요청', {
          itemCount: state.spends.length,
          amount: signedTotal(state.spends),
          maxCards: state.maxCards,
          includeNew: state.includeNew,
        })
        return run()
      },

      ensureOutcomes: () => state.outcomes ?? run(),

      selectScenario: (key) =>
        setState((prev) => ({
          ...prev,
          scenario: key,
          // 시나리오를 바꾸면 조합이 통째로 바뀐다 — 좋아요도 초기화한다 (UI-005)
          liked: false,
        })),

      like: () => {
        logEvent('조합좋아요', {
          scenario: state.scenario,
          cards: state.outcomes?.[state.scenario].cards.map((card) => card.name).join(' · ') ?? '',
        })
        setState((prev) => ({ ...prev, liked: true }))
      },

      reset: () => setState(initialState()),
    }
  }, [state, patchSpends])

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>
}

export function useFlow(): FlowContextValue {
  const context = useContext(FlowContext)
  if (!context) throw new Error('useFlow는 FlowProvider 안에서만 사용할 수 있습니다.')
  return context
}
