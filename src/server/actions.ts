'use server'

import { calculatePlan } from '@/domain/calc'
import { isPlanEmpty } from '@/domain/plan'
import type { Calculation, Constraint, FutureSpendPlan, Profile } from '@/domain/types'
import type { Prisma } from '@prisma/client'
import { actionError, type ActionResult } from './errors'
import { prisma } from './prisma'
import { loadProfile } from './repository'

/**
 * TEC-05 — Server Actions 입력·출력·에러 계약.
 *
 * 공개 REST 엔드포인트를 만들지 않는다 (`C-TEC-002`).
 * 오류를 성공 결과로 변환하지 않는다 — 상태 코드 6종 중 하나를 반환한다.
 * 금액은 규칙 엔진이 계산한다. AI를 호출하지 않는다 (`C-TEC-005`·`C-TEC-006` 기각).
 */

const DIRECTION = { increase: 'INCREASE', decrease: 'DECREASE' } as const

/** 도메인 값을 Prisma Json 컬럼에 넣기 위한 좁은 변환. 값을 바꾸지 않는다. */
const toJson = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue

/** DB 예외를 명시적 오류 상태로 바꾼다. 던져서 성공/실패가 불분명해지는 것을 막는다 (TEC-05). */
async function guard<T>(
  label: string,
  run: () => Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false; error: ReturnType<typeof actionError> }> {
  try {
    return { ok: true, value: await run() }
  } catch (cause) {
    console.error(`[action] ${label} 실패`, cause)
    return { ok: false, error: actionError('FIXTURE_UNAVAILABLE', [label]) }
  }
}

/** 화면이 보낸 계획을 검증한다. 형식 오류와 0건을 같은 코드로 막는다 (AC-001). */
function validatePlan(plan: FutureSpendPlan[]): string[] {
  const problems: string[] = []
  for (const item of plan) {
    if (!Number.isInteger(item.amount) || item.amount < 0) problems.push(`${item.category}: 금액`)
    if (item.month_offset < 1 || item.month_offset > 12) problems.push(`${item.category}: 시점`)
    if (!item.category.trim()) problems.push('카테고리 누락')
  }
  if (isPlanEmpty(plan)) problems.push('확인할 계획 0건')
  return problems
}

export async function loadProfileAction(fixtureId: string): Promise<ActionResult<Profile>> {
  return loadProfile(fixtureId)
}

/** 세션을 만들고 제안값을 미확정 상태로 적재한다. */
export async function startSessionAction(
  fixtureId: string,
  sessionId: string,
): Promise<ActionResult<{ sessionId: string; profile: Profile }>> {
  const loaded = await loadProfile(fixtureId)
  if (!loaded.ok) return loaded

  const written = await guard('세션 시작', async () => {
    await prisma.session.upsert({
      where: { id: sessionId },
      create: { id: sessionId, fixtureId },
      update: {},
    })
    await prisma.futureSpendPlan.deleteMany({ where: { sessionId } })
    await prisma.futureSpendPlan.createMany({
      data: loaded.data.suggested_plan.map((item) => ({
        sessionId,
        planKey: item.plan_id,
        category: item.category,
        amount: item.amount,
        direction: DIRECTION[item.direction],
        monthOffset: item.month_offset,
        origin: 'suggested',
        confirmed: false,
      })),
    })
  })
  if (!written.ok) return { ok: false, error: written.error }

  return { ok: true, data: { sessionId, profile: loaded.data } }
}

/** 미래지출 저장 — 확정 전 초안 상태로만 저장한다. */
export async function savePlanAction(
  fixtureId: string,
  sessionId: string,
  plan: FutureSpendPlan[],
): Promise<ActionResult<{ saved: number }>> {
  const problems = validatePlan(plan).filter((item) => item !== '확인할 계획 0건')
  if (problems.length > 0) {
    return { ok: false, error: actionError('INVALID_PLAN', problems) }
  }

  // 온보딩을 거치지 않고 입력 화면으로 직접 진입할 수 있으므로 세션을 먼저 보장한다
  const written = await guard('계획 저장', async () => {
    await prisma.session.upsert({
      where: { id: sessionId },
      create: { id: sessionId, fixtureId },
      update: {},
    })
    await prisma.futureSpendPlan.deleteMany({ where: { sessionId } })
    if (plan.length > 0) {
      await prisma.futureSpendPlan.createMany({
        data: plan.map((item) => ({
          sessionId,
          planKey: item.plan_id,
          category: item.category,
          amount: item.amount,
          direction: DIRECTION[item.direction],
          monthOffset: item.month_offset,
          origin: item.source,
          confirmed: false,
        })),
      })
    }
  })
  if (!written.ok) return { ok: false, error: written.error }

  return { ok: true, data: { saved: plan.length } }
}

export interface CalculateOutput {
  calculationId: string
  calculation: Calculation
}

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

  const result = calculatePlan({ profile: loaded.data, plan, constraint })
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
  const persisted = await guard('계산 기록', async () => {
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
  })
  if (!persisted.ok) return { ok: false, error: persisted.error }

  return { ok: true, data: { calculationId: persisted.value.id, calculation } }
}

/** 조합 확정 — 확정 시점 값으로 동결한다. 자동 재계산하지 않는다 (T43). */
export async function confirmPlanAction(
  calculationId: string,
  candidateKey: string,
): Promise<ActionResult<{ confirmedAt: string; netBenefit: number }>> {
  const calculation = await prisma.calculation.findUnique({
    where: { id: calculationId },
    include: { candidates: true },
  })
  if (!calculation) {
    return { ok: false, error: actionError('FIXTURE_UNAVAILABLE', [calculationId]) }
  }
  const candidate = calculation.candidates.find(
    (item) => item.candidateKey === candidateKey && (item.role === 'chosen' || item.role === 'current'),
  )
  if (!candidate) {
    return { ok: false, error: actionError('FIXTURE_INVALID', [candidateKey]) }
  }

  const row = await prisma.confirmedPlan.create({
    data: {
      calculationId,
      candidateKey,
      asOfDate: calculation.asOfDate,
      ruleVersions: toJson(calculation.ruleVersions ?? {}),
      netBenefit: candidate.netBenefit,
    },
  })
  return {
    ok: true,
    data: { confirmedAt: row.confirmedAt.toISOString(), netBenefit: row.netBenefit },
  }
}
