import type { Prisma } from '@prisma/client'
import { isPlanEmpty } from '@/domain/cardfit/plan'
import { SPENDING_MONTHS } from '@/domain/cardfit/types'
import type { FutureSpendPlan } from '@/domain/cardfit/types'
import { actionError } from './errors'

/**
 * Server Action이 공유하는 안전장치.
 *
 * `'use server'` 파일은 export한 것이 전부 원격 호출 지점이 되므로 헬퍼를 거기 두지 않는다 —
 * 검증 함수가 실수로 엔드포인트가 된다.
 */

/** 도메인 값을 Prisma Json 컬럼에 넣기 위한 좁은 변환. 값을 바꾸지 않는다. */
export const toJson = (value: unknown): Prisma.InputJsonValue =>
  JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue

/** DB 예외를 명시적 오류 상태로 바꾼다. 던져서 성공/실패가 불분명해지는 것을 막는다 (TEC-05). */
export async function guard<T>(
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
export function validatePlan(plan: FutureSpendPlan[]): string[] {
  const problems: string[] = []
  for (const item of plan) {
    if (!Number.isInteger(item.amount) || item.amount < 0) problems.push(`${item.category}: 금액`)
    if (!SPENDING_MONTHS.includes(item.spending_months)) problems.push(`${item.category}: 지출 기간`)
    if (!item.category.trim()) problems.push('카테고리 누락')
  }
  if (isPlanEmpty(plan)) problems.push('확인할 계획 0건')
  return problems
}
