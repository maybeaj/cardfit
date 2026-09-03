'use server'

import type { ActionResult } from '@/server/errors'
import type { Profile } from '@/domain/cardfit/types'
import { prisma } from '@/server/db/prisma'
import { loadProfile } from '@/server/repositories/profile.repository'
import { guard } from '@/server/action-guard'

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
        spendingMonths: item.spending_months,
        origin: 'suggested',
        confirmed: false,
      })),
    })
  })
  if (!written.ok) return { ok: false, error: written.error }

  return { ok: true, data: { sessionId, profile: loaded.data } }
}
