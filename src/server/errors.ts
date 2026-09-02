import 'server-only'

/**
 * 오류 상태 계약 (TEC-05 · `docs/diagrams/TECHNICAL_DESIGN.md` 6.7절).
 * 오류를 성공 결과로 변환하지 않는다.
 */
export const ERROR_CODES = [
  'INVALID_PLAN',
  'THRESHOLD_NOT_MET',
  'FIXTURE_UNAVAILABLE',
  'FIXTURE_INVALID',
  'RULE_INCOMPLETE',
  'EVIDENCE_INCOMPLETE',
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

export interface ActionError {
  code: ErrorCode
  /** 사용자에게 그대로 보여줄 안내 문구 */
  message: string
  /** 누락된 항목 목록. 없으면 빈 배열 */
  missing: string[]
  /** 보완 후 재검증이 가능한지 — true일 때만 재검사 액션을 노출한다 */
  retryable: boolean
}

const MESSAGES: Record<ErrorCode, string> = {
  INVALID_PLAN: '확인할 앞으로의 지출이 0건이라 계산하지 않습니다.',
  THRESHOLD_NOT_MET: '바꿀 가치가 기준에 못 미쳐 현재 조합을 유지합니다.',
  FIXTURE_UNAVAILABLE: '예시 데이터를 불러오지 못했습니다.',
  FIXTURE_INVALID: '예시 데이터에 기준일 또는 규칙 버전이 없어 계산을 보류했습니다.',
  RULE_INCOMPLETE: '카드 규칙이 일부 비어 있어 해당 카드를 후보에서 제외했습니다.',
  EVIDENCE_INCOMPLETE: '필수 근거가 모두 확인되지 않아 추천 결과를 보류했습니다.',
}

const RETRYABLE: Record<ErrorCode, boolean> = {
  INVALID_PLAN: true,
  THRESHOLD_NOT_MET: false,
  FIXTURE_UNAVAILABLE: true,
  FIXTURE_INVALID: false,
  RULE_INCOMPLETE: true,
  EVIDENCE_INCOMPLETE: true,
}

export function actionError(code: ErrorCode, missing: string[] = [], message?: string): ActionError {
  return { code, message: message ?? MESSAGES[code], missing, retryable: RETRYABLE[code] }
}

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ActionError }
