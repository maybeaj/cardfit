import 'server-only'
import type { FutureSpendPlan } from '@/domain/cardfit/types'
import { prisma } from '../db/prisma'

/**
 * 미래지출 계획 적재 — `TEC-06`.
 *
 * 온보딩을 거치지 않고 입력 화면으로 직접 들어올 수 있어 세션을 먼저 보장한다.
 * 저장은 항상 통째 교체다 — 부분 갱신하면 화면에서 지운 항목이 DB에 남는다.
 */
export async function replacePlan(
  fixtureId: string,
  sessionId: string,
  plan: FutureSpendPlan[],
) {

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
          spendingMonths: item.spending_months,
        origin: item.source,
        confirmed: false,
      })),
    })
  }
}
