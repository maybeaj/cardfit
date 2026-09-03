'use server'

import { actionError, type ActionResult } from '@/server/errors'
import { prisma } from '@/server/db/prisma'
import { toJson } from '@/server/action-guard'

/**
 * 조합 선택 기록 — 고른 시점의 값으로 동결한다. 자동 재계산하지 않는다 (`T43`).
 *
 * `확정`이 아니라 `선택`이다. 서비스가 신청·해지를 대행하지 않으므로 확정할 것이 없고,
 * 기록하는 것은 사용자가 어느 조합을 골랐는가뿐이다 (`T12` · UI-008).
 */
export async function savePreferenceAction(
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
