'use server'

import { actionError, type ActionResult } from '@/server/errors'
import type { FutureSpendPlan } from '@/domain/cardfit/types'
import { guard, validatePlan } from '@/server/action-guard'
import { replacePlan } from '@/server/repositories/plan.repository'

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
  const written = await guard('계획 저장', () => replacePlan(fixtureId, sessionId, plan))
  if (!written.ok) return { ok: false, error: written.error }

  return { ok: true, data: { saved: plan.length } }
}
