import { calculatePlan, NET_BENEFIT_FLOOR, NET_BENEFIT_RATIO } from './calculate-plan'
import type { CalculationResult, Constraint, FutureSpendPlan, Profile } from './types'

/**
 * 추천 엔진 경계 — 화면이 계산 방식을 모르게 한다.
 *
 * 화면은 `RecommendationEngine`만 알고, 그 뒤가 규칙 엔진인지 서버인지 Mock인지
 * 신경 쓰지 않는다. 실연동으로 옮길 때 이 경계 뒤만 갈아 끼우면 화면은 그대로 둔다.
 *
 * **금액은 여기 구현체가 계산한다. LLM에게 생성시키지 않는다.**
 */

/**
 * 변경을 권하는 임계 — 연 5만원 AND 총 카드혜택의 15% 이중 조건 (`D-002` · `T16`).
 * 화면이 고지 문구에 쓴다. 실측이 아니라 과잉 추천을 막는 팀 합의 상수다.
 */
export { NET_BENEFIT_FLOOR, NET_BENEFIT_RATIO }

export interface RecommendationInput {
  profile: Profile
  /** 사용자가 `이 계획대로 계산하기`로 확인한 계획 */
  plan: FutureSpendPlan[]
  constraint: Constraint
  /** 계산 시점. 기준일 경고 판정에만 쓴다 */
  today?: string
}

export interface RecommendationEngine {
  readonly name: string
  calculate(input: RecommendationInput): CalculationResult
}

/**
 * 규칙 엔진 — 실적구간·혜택한도·연회비·제외조건을 적용해 조합을 열거하고 임계를 판정한다.
 * 같은 입력이면 항상 같은 결과다 (NFR-001).
 */
export const ruleEngine: RecommendationEngine = {
  name: 'rule',
  calculate: (input) => calculatePlan(input),
}

/**
 * 화면이 쓰는 엔진.
 *
 * 지금은 규칙 엔진 하나뿐이다. 서버 계산이나 다른 구현이 생기면 여기만 바꾼다 —
 * 화면과 상태 계층은 이 이름만 알고 있어 함께 고칠 필요가 없다.
 */
export const engine: RecommendationEngine = ruleEngine

/**
 * 시나리오별로 계획을 배수만큼 조정해 다시 계산한다.
 *
 * **출력값에 배수를 곱하지 않는다** — 실적구간·혜택한도·연회비는 금액에 비례하지 않아
 * 곱셈으로는 틀린 값이 나온다. 계획을 바꿔 엔진을 다시 돌려야 맞는 금액이 된다.
 *
 * 배수가 1이면 사용자가 확인한 계획 그대로이므로 조정하지 않는다.
 */
export function calculateForMultiplier(
  input: RecommendationInput,
  multiplier: number,
): CalculationResult {
  if (multiplier === 1) return engine.calculate(input)

  return engine.calculate({
    ...input,
    plan: input.plan.map((item) => ({
      ...item,
      amount: Math.round(item.amount * multiplier),
    })),
  })
}
