import { buildMonthlySpend, isPlanEmpty } from './plan'
import type {
  CalculationResult,
  CardEvidence,
  CardProduct,
  CardStatus,
  Constraint,
  FutureSpendPlan,
  HoldReason,
  PlanCandidate,
  Profile,
} from './types'
import { NET_BENEFIT_FLOOR, NET_BENEFIT_RATIO, STALE_AS_OF_MONTHS } from './constants'
import { allocatePlan, simulate } from './allocation'
import { statusesFor, switchingCostFor } from './switching-cost'
import { EVIDENCE_FIELDS, buildEvidenceRow, monthsBetween } from './evidence'

export {
  ANNUAL_FEE_NOTICE_MONTH,
  NET_BENEFIT_FLOOR,
  NET_BENEFIT_RATIO,
  STALE_AS_OF_MONTHS,
} from './constants'

/**
 * 조합 열거와 임계 판정 — 규칙 엔진의 입구.
 *
 * 후보를 만들고(`combinations`), 하나씩 배분·혜택·전환비용을 구해(`allocation`,
 * `switching-cost`) 이중 임계로 거른 뒤(`D-002`) 결론 하나를 고른다.
 */

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]]
  if (size > items.length) return []
  const out: T[][] = []
  const walk = (start: number, picked: T[]) => {
    if (picked.length === size) {
      out.push([...picked])
      return
    }
    for (let i = start; i < items.length; i += 1) {
      picked.push(items[i] as T)
      walk(i + 1, picked)
      picked.pop()
    }
  }
  walk(0, [])
  return out
}

export interface CalculateInput {
  profile: Profile
  /** 사용자가 `이 계획대로 계산하기`로 확인한 계획 */
  plan: FutureSpendPlan[]
  constraint: Constraint
  /** 계산 시점. 기준일 경고 판정에만 쓴다 */
  today?: string
}

export function calculatePlan(input: CalculateInput): CalculationResult {
  const { profile, plan, constraint } = input
  const today = input.today ?? profile.as_of_date

  // AC-001 — 확인할 미래 계획이 0건이면 결과를 반환하지 않는다
  if (isPlanEmpty(plan)) {
    return { ok: false, code: 'EMPTY_PLAN', reason: '확인할 앞으로의 지출 계획이 0건입니다.' }
  }

  const cards = new Map(profile.cards.map((card) => [card.card_id, card]))
  const rules = new Map(profile.rules.map((rule) => [rule.card_id, rule]))
  const months = buildMonthlySpend(profile.past_spend, plan)

  // T41 — 6항목 미달 카드는 조합 후보 단계에서 제외하고 사유를 남긴다
  const excluded_cards: { card_id: string; reason: string }[] = []
  const eligible: CardProduct[] = []
  for (const card of profile.cards) {
    const rule = rules.get(card.card_id)
    const probe = simulate([card.card_id], cards, rules, months)
    const row = buildEvidenceRow(card, rule, probe.appliedTier.get(card.card_id) ?? null)
    if (row.complete) eligible.push(card)
    else excluded_cards.push({ card_id: card.card_id, reason: `근거 미달: ${row.missing.join('·')}` })
  }

  const ownedIds = profile.cards.filter((card) => card.owned).map((card) => card.card_id)
  const eligibleOwned = eligible.filter((card) => card.owned).map((card) => card.card_id)
  const eligibleNew = eligible.filter((card) => !card.owned).map((card) => card.card_id)

  const makeCandidate = (cardIds: string[], relaxed: boolean, currentGross: number): PlanCandidate => {
    const sim = simulate(cardIds, cards, rules, months)
    const statuses = statusesFor(cardIds, ownedIds, cards)
    const switching = switchingCostFor(cardIds, ownedIds, cards)
    const grossDelta = sim.grossBenefit - currentGross
    const net = grossDelta - switching.total
    return {
      candidate_id: [...cardIds].sort().join('+'),
      card_ids: [...cardIds].sort(),
      statuses,
      gross_benefit_absolute: sim.grossBenefit,
      gross_benefit: grossDelta,
      switching_cost: switching,
      net_benefit: net,
      passes_threshold:
        net >= NET_BENEFIT_FLOOR && net >= Math.floor(grossDelta * NET_BENEFIT_RATIO),
      allocations: sim.allocations,
      plan_allocations: allocatePlan(plan, cardIds, statuses, rules),
      relaxed,
    }
  }

  // 현재 조합 — 비교 기준선. 전환비용 0, 차액 0
  const currentSim = simulate(ownedIds, cards, rules, months)
  const currentStatuses = Object.fromEntries(
    ownedIds.map((id) => [id, '유지' as CardStatus]),
  ) as Record<string, CardStatus>
  const current: PlanCandidate = {
    candidate_id: [...ownedIds].sort().join('+'),
    card_ids: [...ownedIds].sort(),
    statuses: currentStatuses,
    gross_benefit_absolute: currentSim.grossBenefit,
    gross_benefit: 0,
    switching_cost: { annual_fee: 0, requalification_loss: 0, issuance_wait_cost: 0, total: 0 },
    net_benefit: 0,
    passes_threshold: false,
    allocations: currentSim.allocations,
    plan_allocations: allocatePlan(plan, ownedIds, currentStatuses, rules),
    relaxed: false,
  }

  const buildSet = (maxCards: number, maxNew: number, relaxed: boolean): PlanCandidate[] => {
    const out: PlanCandidate[] = []
    const newAllowed = constraint.allow_new_card ? Math.min(maxNew, eligibleNew.length) : 0
    for (let total = 1; total <= maxCards; total += 1) {
      for (let newCount = 0; newCount <= Math.min(newAllowed, total); newCount += 1) {
        const keepCount = total - newCount
        for (const keep of combinations(eligibleOwned, keepCount)) {
          for (const fresh of combinations(eligibleNew, newCount)) {
            const ids = [...keep, ...fresh]
            if (ids.length === 0) continue
            if ([...ids].sort().join('+') === current.candidate_id) continue
            out.push(makeCandidate(ids, relaxed, currentSim.grossBenefit))
          }
        }
      }
    }
    return out
  }

  const candidates = buildSet(constraint.max_cards, constraint.max_new_cards, false)
  const rank = (a: PlanCandidate, b: PlanCandidate) => {
    if (b.net_benefit !== a.net_benefit) return b.net_benefit - a.net_benefit
    const aNew = a.card_ids.filter((id) => !cards.get(id)?.owned).length
    const bNew = b.card_ids.filter((id) => !cards.get(id)?.owned).length
    if (aNew !== bNew) return aNew - bNew
    if (a.card_ids.length !== b.card_ids.length) return a.card_ids.length - b.card_ids.length
    return a.candidate_id.localeCompare(b.candidate_id)
  }

  const passing = candidates.filter((item) => item.passes_threshold).sort(rank)
  const failing = candidates.filter((item) => !item.passes_threshold).sort(rank)

  let decision: '변경' | '유지' = '유지'
  let hold_reason: HoldReason | null = null
  let chosen = current

  if (passing.length > 0) {
    decision = '변경'
    chosen = passing[0] as PlanCandidate
  } else {
    // T38 — 제약을 완화한 가상 후보가 임계를 넘으면 `제약과다`, 완화해도 못 넘으면 `임계미달`
    const relaxedSet = buildSet(constraint.max_cards + 1, constraint.max_new_cards + 1, true)
    hold_reason = relaxedSet.some((item) => item.passes_threshold) ? '제약과다' : '임계미달'
  }

  // 근거 순서를 card_id로 고정한다 — 카드 선언 순서에 결과가 흔들리면 NFR-001이 깨진다
  const evidenceTargets = [...(decision === '변경' ? chosen.card_ids : ownedIds)].sort()
  const evidenceSim = decision === '변경' ? simulate(chosen.card_ids, cards, rules, months) : currentSim
  const evidence: CardEvidence[] = evidenceTargets.map((id) => {
    const card = cards.get(id) as CardProduct
    return buildEvidenceRow(card, rules.get(id), evidenceSim.appliedTier.get(id) ?? null)
  })

  // AC-002 — 결론 카드가 6항목 미달이면 응답을 거부한다
  const incomplete = evidence.filter((row) => !row.complete)
  if (incomplete.length > 0) {
    return {
      ok: false,
      code: 'EVIDENCE_INCOMPLETE',
      reason: `근거 ${EVIDENCE_FIELDS.length}항목 미달: ${incomplete
        .map((row) => `${row.name}(${row.missing.join('·')})`)
        .join(', ')}`,
    }
  }

  return {
    ok: true,
    calculation: {
      fixture_id: profile.fixture_id,
      as_of_date: profile.as_of_date,
      rule_versions: Object.fromEntries(
        evidenceTargets.map((id) => [id, rules.get(id)?.rule_version ?? '']),
      ),
      plan_snapshot: plan.map((item) => ({ ...item })),
      constraint_snapshot: { ...constraint },
      decision,
      hold_reason,
      chosen,
      current,
      // T21 — 유지 결론에서도 검토했던 대안을 손익과 함께 노출한다
      reviewed: (decision === '변경' ? passing.slice(1) : failing).slice(0, 3),
      evidence,
      stale_as_of_warning: monthsBetween(profile.as_of_date, today) > STALE_AS_OF_MONTHS,
      excluded_cards,
      current_card_count: ownedIds.length,
    },
  }
}
