import 'server-only'
import type { Calculation } from '@/domain/cardfit/types'
import { prisma } from '../db/prisma'
import { toJson } from '../action-guard'

/**
 * 계산 결과 적재 — `TEC-06`. Prisma는 이 경계 밖으로 나가지 않는다.
 *
 * 액션은 "무엇을 계산하고 무엇을 저장할지"만 정하고, 표를 어떻게 나눠 담는지는 모른다.
 * 조합 후보와 배분 행이 한 트랜잭션에 함께 들어가야 결과와 근거가 어긋나지 않는다.
 */
export async function saveCalculation(
  fixtureId: string,
  sessionId: string,
  calculation: Calculation,
) {

await prisma.session.upsert({
  where: { id: sessionId },
  create: { id: sessionId, fixtureId },
  update: {},
})
await prisma.futureSpendPlan.updateMany({ where: { sessionId }, data: { confirmed: true } })

return prisma.calculation.create({
  data: {
    fixtureId,
    sessionId,
    asOfDate: new Date(`${calculation.as_of_date}T00:00:00Z`),
    planSnapshot: toJson(calculation.plan_snapshot),
    constraintSnapshot: toJson(calculation.constraint_snapshot),
    ruleVersions: toJson(calculation.rule_versions),
    decision: calculation.decision === '변경' ? 'CHANGE' : 'HOLD',
    holdReason:
      calculation.hold_reason === '임계미달'
        ? 'THRESHOLD_NOT_MET'
        : calculation.hold_reason === '제약과다'
          ? 'CONSTRAINT_TOO_TIGHT'
          : null,
    staleAsOfWarning: calculation.stale_as_of_warning,
    excludedCards: toJson(calculation.excluded_cards),
    candidates: {
      create: [
        { role: 'chosen', candidate: calculation.chosen },
        { role: 'current', candidate: calculation.current },
        ...calculation.reviewed.map((item) => ({ role: 'reviewed', candidate: item })),
      ].map(({ role, candidate }) => ({
        role,
        candidateKey: candidate.candidate_id,
        grossBenefitAbsolute: candidate.gross_benefit_absolute,
        grossBenefit: candidate.gross_benefit,
        annualFeeCost: candidate.switching_cost.annual_fee,
        requalificationLoss: candidate.switching_cost.requalification_loss,
        issuanceWaitCost: candidate.switching_cost.issuance_wait_cost,
        netBenefit: candidate.net_benefit,
        passesThreshold: candidate.passes_threshold,
        statuses: toJson(candidate.statuses),
        allocations: {
          create: candidate.allocations.map((allocation) => ({
            category: allocation.category,
            cardId: allocation.card_id,
            amount: allocation.amount,
            benefit: allocation.benefit,
          })),
        },
      })),
    },
  },
})
}
