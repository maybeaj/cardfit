'use server'

import { actionError, type ActionResult } from '@/server/errors'
import { calculateForMultiplier, engine } from '@/domain/cardfit/recommendation'
import type { Calculation, Constraint, FutureSpendPlan } from '@/domain/cardfit/types'
import { loadProfile } from '@/server/repositories/profile.repository'
import { guard, validatePlan } from '@/server/action-guard'
import { saveCalculation } from '@/server/repositories/calculation.repository'

export interface CalculateOutput {
  calculationId: string
  calculation: Calculation
  /**
   * 지출 탐색 시나리오별 결과. `예상대로`는 위 `calculation`과 같은 값이다.
   *
   * 화면이 배수를 받아 직접 계산하지 않도록 서버가 한 번에 만들어 내려준다 —
   * 계산 경로가 클라이언트와 서버 둘로 갈라지면 어느 쪽이 정본인지 알 수 없게 된다.
   * 결과에 배수를 곱하지 않고 계획을 바꿔 엔진을 다시 돌린다: 실적구간·혜택한도·
   * 연회비가 금액에 비례하지 않아 곱셈은 틀린 값을 만든다.
   */
  scenarios: Record<string, Calculation | null>
}

/** 지출 탐색 배수 — 화면의 탭과 같은 순서다 */
const SCENARIO_MULTIPLIERS = { low: 0.72, expected: 1, high: 1.28 } as const

/**
 * 계산 요청 — 계획을 확정 처리하고 규칙 엔진을 실행한 뒤 결과를 DB에 남긴다.
 * `THRESHOLD_NOT_MET`은 오류가 아니라 정상 결과이므로 결과와 함께 반환한다 (AC-004).
 */
export async function calculateAction(
  fixtureId: string,
  sessionId: string,
  plan: FutureSpendPlan[],
  constraint: Constraint,
): Promise<ActionResult<CalculateOutput>> {
  const problems = validatePlan(plan)
  if (problems.length > 0) {
    return { ok: false, error: actionError('INVALID_PLAN', problems) }
  }

  const loaded = await loadProfile(fixtureId)
  if (!loaded.ok) return loaded

  const result = engine.calculate({ profile: loaded.data, plan, constraint })
  if (!result.ok) {
    // 계산 엔진의 거부를 성공 결과로 바꾸지 않는다
    if (result.code === 'EMPTY_PLAN') {
      return { ok: false, error: actionError('INVALID_PLAN', ['확인할 계획 0건'], result.reason) }
    }
    const missing = loaded.data.cards
      .map((card) => card.name)
      .filter((name) => result.reason.includes(name))
    return { ok: false, error: actionError('EVIDENCE_INCOMPLETE', missing, result.reason) }
  }

  const calculation = result.calculation
  const persisted = await guard('계산 기록', () =>
    saveCalculation(fixtureId, sessionId, calculation),
  )
  if (!persisted.ok) return { ok: false, error: persisted.error }

  const scenarios: Record<string, Calculation | null> = {}
  for (const [key, multiplier] of Object.entries(SCENARIO_MULTIPLIERS)) {
    if (multiplier === 1) {
      scenarios[key] = calculation
      continue
    }
    const scenario = calculateForMultiplier(
      { profile: loaded.data, plan, constraint },
      multiplier,
    )
    // 시나리오가 결과를 못 만들면 탭을 비운다. 확인한 계획의 결과로 대신 채우지 않는다
    scenarios[key] = scenario.ok ? scenario.calculation : null
  }

  return { ok: true, data: { calculationId: persisted.value.id, calculation, scenarios } }
}
