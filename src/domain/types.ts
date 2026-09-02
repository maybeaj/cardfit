// 도메인 타입 — 브라우저 API·화면 카피를 참조하지 않는다 (TECH_SPEC 4절).
// 금액은 모두 정수 원 단위다.

export type CardStatus = '신규' | '유지' | '정리'
export type SpendDirection = 'increase' | 'decrease'
export type HoldReason = '임계미달' | '제약과다'

/** 값의 출처 — 없는 값을 0으로 채우지 않기 위한 계약 (T42) */
export interface SourceRef {
  label: string
  as_of_date: string
}

export interface BenefitTier {
  /** 전월실적 하한 (원) */
  min_monthly_spend: number
  /** 적립·할인율 */
  rate: number
  /** 월 통합 혜택 한도 (원) */
  monthly_cap: number
}

export interface UnmodeledBound {
  label: string
  /** 약관에 명시된 한도. 추정값을 넣지 않는다 (T7·T42) */
  bound: number
  source: SourceRef
}

export interface TransitionCost {
  /** 이 카드를 정리할 때 발생하는 실적 재적립 손실 */
  requalification_loss: number
  /** 이 카드를 신규 발급할 때의 발급 대기 비용 */
  issuance_wait_cost: number
  source: SourceRef
}

export interface CardProduct {
  card_id: string
  issuer: string
  name: string
  annual_fee: number
  /** 카드사 공식 페이지. 신규 발급 1장만 아웃링크 대상 (T25) */
  official_url: string
  owned: boolean
  /** 보유 카드의 실적 기준월 사용액. 신규 후보는 0 */
  qualifying_month_spend: number
  transition: TransitionCost
}

export interface BenefitRule {
  card_id: string
  rule_version: string
  /** 적용 기준일 — 근거 6항목 중 하나 */
  as_of_date: string
  effective_from: string
  effective_to: string
  /** 혜택이 적용되는 카테고리 */
  categories: string[]
  tiers: BenefitTier[]
  /** 제외 조건 — 근거 6항목 중 하나 */
  excluded: string[]
  /** 미반영 항목. 출처를 댈 수 없으면 항목 자체를 두지 않는다 (T42) */
  unmodeled: UnmodeledBound[]
}

export interface PastSpend {
  category: string
  /** 최근 12개월 월평균 지출 */
  monthly_amount: number
}

export interface FutureSpendPlan {
  plan_id: string
  category: string
  /** 항상 양수. 감소는 direction으로 표현한다 (T20) */
  amount: number
  direction: SpendDirection
  /** 기준일 +1~12개월 */
  month_offset: number
  source: 'suggested' | 'user'
}

export interface Constraint {
  /** 사용 카드 최대 2장 (T6) */
  max_cards: number
  allow_new_card: boolean
  /** 신규 발급 최대 1장 (T6) */
  max_new_cards: number
}

export interface Profile {
  fixture_id: string
  as_of_date: string
  cards: CardProduct[]
  rules: BenefitRule[]
  past_spend: PastSpend[]
  suggested_plan: FutureSpendPlan[]
  constraint: Constraint
}

/* ── 계산 산출물 ─────────────────────────────────────────── */

export interface AllocationRow {
  category: string
  card_id: string
  amount: number
  benefit: number
}

export interface CardEvidence {
  card_id: string
  issuer: string
  name: string
  /** 실적구간 */
  applied_tier: { min_monthly_spend: number; rate: number } | null
  /** 혜택한도 */
  monthly_cap: number | null
  annual_fee: number
  excluded: string[]
  as_of_date: string
  rule_version: string
  unmodeled: UnmodeledBound[]
  /** 연회비가 12개월 창에 통째로 반영된 사실 고지 대상인지 (T40) */
  annual_fee_whole_window_notice: boolean
  /** 6항목 충족 여부 */
  complete: boolean
  missing: string[]
}

export interface SwitchingCost {
  annual_fee: number
  requalification_loss: number
  issuance_wait_cost: number
  total: number
}

export interface PlanCandidate {
  candidate_id: string
  card_ids: string[]
  statuses: Record<string, CardStatus>
  /** 조합 자체의 12개월 혜택 합계 */
  gross_benefit_absolute: number
  /** 현재 조합 대비 추가 혜택 — 게이팅과 배너가 쓰는 Gross Benefit */
  gross_benefit: number
  switching_cost: SwitchingCost
  net_benefit: number
  passes_threshold: boolean
  allocations: AllocationRow[]
  /** 제약을 완화해야만 나오는 후보인지 (T38 제약과다 판정용) */
  relaxed: boolean
}

export interface Calculation {
  fixture_id: string
  as_of_date: string
  rule_versions: Record<string, string>
  /** 사용자가 확인한 계획 스냅샷 */
  plan_snapshot: FutureSpendPlan[]
  constraint_snapshot: Constraint
  decision: '변경' | '유지'
  hold_reason: HoldReason | null
  /** 결론 조합 */
  chosen: PlanCandidate
  /** 현재 조합 (비교 기준선) */
  current: PlanCandidate
  /** 검토했던 대안 — 게이팅 미통과 후보 (T21) */
  reviewed: PlanCandidate[]
  evidence: CardEvidence[]
  /** 기준일이 3개월 초과여서 경고할 대상 (T41) */
  stale_as_of_warning: boolean
  /** 6항목 미달로 후보에서 제외된 카드와 사유 (T41) */
  excluded_cards: { card_id: string; reason: string }[]
  /** 현재 조합 카드 장수 — 캡션 하드코딩 금지 (T26) */
  current_card_count: number
}

export type CalculationResult =
  | { ok: true; calculation: Calculation }
  | { ok: false; code: 'EMPTY_PLAN' | 'EVIDENCE_INCOMPLETE'; reason: string }
