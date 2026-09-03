import type {
  AllocationReason,
  AllocationRow,
  BenefitRule,
  BenefitTier,
  CardProduct,
  CardStatus,
  FutureSpendPlan,
  PlanAllocationRow,
} from './types'
import { HORIZON_MONTHS, type MonthlySpend } from './plan'
import { benefitOf, tierFor } from './benefit'

/**
 * FR-004 결제 배분 — 어느 지출을 어느 카드로 결제할지 정한다.
 *
 * **혜택 계산과 배분을 따로 떼지 않는다.** 담당 카드를 한계 혜택이 가장 큰 쪽으로 고르기
 * 때문에, 배분을 정하려면 혜택을 계산해야 하고 혜택을 계산하려면 배분이 정해져야 한다.
 * 억지로 나누면 두 벌의 금액이 생긴다. 한 함수 안에서 함께 푼다.
 */
export interface Simulation {
  grossBenefit: number
  allocations: AllocationRow[]
  /** 카드별 적용 실적구간 — 근거 화면이 읽는다 */
  appliedTier: Map<string, BenefitTier>
}

interface Bucket {
  /** 실적 산정 대상 배분액 (제외 항목 제외) */
  qualifying: number
  /** 혜택 산정 대상 배분액 */
  eligible: number
  benefit: number
}

/**
 * 조합 하나를 12개월 시뮬레이션한다.
 *
 * 실적구간은 그 달에 카드로 배분된 금액으로 판정한다. 전월실적을 직전 달 값으로 물리면
 * 배분과 실적이 서로를 참조해 순환하므로, 12개월 균질 계획에서는 같은 달 배분액으로 근사하고
 * 그 사실을 근거 화면에 고지한다. 이 방식은 같은 입력에 항상 같은 결과를 준다 (NFR-001).
 */
export function simulate(
  cardIds: string[],
  cards: Map<string, CardProduct>,
  rules: Map<string, BenefitRule>,
  months: MonthlySpend,
): Simulation {
  const ordered = [...cardIds].sort()
  const rows = new Map<string, AllocationRow>()
  const appliedTier = new Map<string, BenefitTier>()
  let grossBenefit = 0

  for (let m = 0; m < HORIZON_MONTHS; m += 1) {
    const monthBucket = months[m]
    if (!monthBucket) continue

    const state = new Map<string, Bucket>()
    for (const id of ordered) state.set(id, { qualifying: 0, eligible: 0, benefit: 0 })

    const categories = [...monthBucket.entries()]
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0], 'ko'))

    for (const [category, amount] of categories) {
      let bestId = ordered[0] as string
      let bestMarginal = -1
      let bestNext: Bucket | null = null

      for (const id of ordered) {
        const rule = rules.get(id)
        const current = state.get(id) as Bucket
        const isExcluded = rule?.excluded.includes(category) ?? true
        const isCovered = (rule?.categories.includes(category) ?? false) && !isExcluded
        const next: Bucket = {
          qualifying: current.qualifying + (isExcluded ? 0 : amount),
          eligible: current.eligible + (isCovered ? amount : 0),
          benefit: 0,
        }
        const { benefit } = benefitOf(rule, next.qualifying, next.eligible)
        next.benefit = benefit
        const marginal = benefit - current.benefit
        if (marginal > bestMarginal) {
          bestMarginal = marginal
          bestId = id
          bestNext = next
        }
      }

      const previous = (state.get(bestId) as Bucket).benefit
      if (bestNext) state.set(bestId, bestNext)
      const gained = Math.max(0, (state.get(bestId) as Bucket).benefit - previous)
      grossBenefit += gained

      const key = `${category}::${bestId}`
      const row = rows.get(key)
      if (row) {
        row.amount += amount
        row.benefit += gained
      } else {
        /*
         * 담당 사유는 고른 뒤에 판정한다. 고르는 기준은 한계 혜택이고, 그 결과가
         * 혜택 업종이라서인지 다른 카드의 한도가 차서인지를 규칙으로 되읽는다.
         */
        const bestRule = rules.get(bestId)
        const covered =
          (bestRule?.categories.includes(category) ?? false) &&
          !(bestRule?.excluded.includes(category) ?? true)
        const reason: AllocationReason = covered ? '주 혜택 업종' : '월 한도 분산'
        rows.set(key, { category, card_id: bestId, amount, benefit: gained, reason })
      }
    }

    for (const id of ordered) {
      const rule = rules.get(id)
      const bucket = state.get(id) as Bucket
      const tier = rule ? tierFor(rule, bucket.qualifying) : null
      if (tier) appliedTier.set(id, tier)
    }
  }

  const allocations = [...rows.values()].sort(
    (a, b) => (b.amount - a.amount) || a.category.localeCompare(b.category, 'ko'),
  )
  return { grossBenefit, allocations, appliedTier }
}

/**
 * UI-006 계획 배분 — 확인한 지출 항목마다 담당 카드를 정한다.
 *
 * 전체 배분(`simulate`)과 다른 질문에 답한다. 저쪽은 *"12개월 지출로 얼마를 받나"*이고
 * 이쪽은 *"내가 말한 이 돈을 어느 카드로 내나"*다. 화면에 전체 배분을 띄우면 입력한 적
 * 없는 카테고리가 줄줄이 나와 사용자가 자기 입력을 못 찾는다.
 *
 * 규칙은 둘뿐이다 (SRS UI-006).
 * ① 그 카테고리를 혜택 대상으로 삼는 카드가 있으면 그 카드 — `주 혜택 업종`
 * ② 없으면 지금까지 가장 적게 맡은 카드 — `월 한도 분산`
 *
 * **`정리` 카드에는 배분하지 않는다** (`AC-003`). 앞으로 쓰지 않을 카드다.
 */
export function allocatePlan(
  plan: FutureSpendPlan[],
  cardIds: string[],
  statuses: Record<string, CardStatus>,
  rules: Map<string, BenefitRule>,
): PlanAllocationRow[] {
  const pool = cardIds.filter((id) => statuses[id] !== '정리')
  // 전원이 `정리`면 배분할 곳이 없어진다 — 그때만 전체를 후보로 되돌린다
  const targets = pool.length > 0 ? pool : cardIds
  if (targets.length === 0) return []

  const assigned = new Map<string, number>(targets.map((id) => [id, 0]))

  return plan
    .filter((item) => item.amount > 0)
    .map((item) => {
      const affine = targets.find((id) => {
        const rule = rules.get(id)
        return (
          (rule?.categories.includes(item.category) ?? false) &&
          !(rule?.excluded.includes(item.category) ?? true)
        )
      })
      /* 동률이면 카드 순서로 끊는다 — 무작위면 같은 입력에 다른 결과가 나온다 (NFR-001) */
      const spread = [...targets].sort(
        (a, b) => (assigned.get(a) ?? 0) - (assigned.get(b) ?? 0) || a.localeCompare(b),
      )[0]!
      const card_id = affine ?? spread
      const reason: AllocationReason = affine ? '주 혜택 업종' : '월 한도 분산'
      assigned.set(card_id, (assigned.get(card_id) ?? 0) + item.amount)

      return {
        plan_id: item.plan_id,
        category: item.category,
        spending_months: item.spending_months,
        amount: item.amount,
        card_id,
        reason,
      }
    })
}
