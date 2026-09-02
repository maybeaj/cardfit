/**
 * 시나리오 계산 엔진 — 기준본 `projectedGross` · `buildScenario`의 이식본 (`D-011`).
 *
 * 결정론적이다. 같은 입력이면 항상 같은 결과가 나온다 (NFR-001).
 * 금액은 이 규칙 엔진이 계산하고 AI는 쓰지 않는다.
 *
 * 시나리오는 `적게·예상대로·많이` 3개이며 **각각 독립적으로 계산한다** (AC-014).
 * 탭을 바꾸면 Net Benefit·카드 조합·상태가 함께 교체된다.
 */
import {
  CURRENT_STATE,
  HOLD_CARDS,
  SCENARIO_VARIANTS,
  type OutcomeCard,
  type SpendItem,
} from '@/fixtures/prototype'

export type ScenarioKey = 'low' | 'expected' | 'high'

export interface ScenarioOption {
  key: ScenarioKey
  label: string
  multiplier: number
}

/** 기준본의 배수 — `적게 .72` · `예상대로 1` · `많이 1.28` */
export const SCENARIOS: ScenarioOption[] = [
  { key: 'low', label: '적게', multiplier: 0.72 },
  { key: 'expected', label: '예상대로', multiplier: 1 },
  { key: 'high', label: '많이', multiplier: 1.28 },
]

export const SCENARIO_LABEL: Record<ScenarioKey, string> = {
  low: '적게',
  expected: '예상대로',
  high: '많이',
}

/** D-002 · T16 — 이중 조건이다. 하나라도 미달이면 `현재 조합 유지`를 반환한다 (AC-004) */
export const NET_BENEFIT_FLOOR = 50_000
export const NET_BENEFIT_RATIO = 0.15

/** 계산 기간은 기준일 + 12개월이고 모든 결과 금액은 `연 n원`이다 (`T15`) */
export const HORIZON_MONTHS = 12

/** 신규 카드를 허용할 때만 발생하는 전환비용 — 연회비는 안분하지 않는다 (`T40`) */
const NEW_CARD_COST = { fee: 38_000, requalificationLoss: 12_000, issuanceWait: 8_000 } as const

/** 사용자가 확인한 계획의 합계 (원). 입력은 만원 단위다 */
export function signedTotal(spends: SpendItem[]): number {
  return spends.reduce((sum, item) => sum + Math.max(0, Number(item.amount) || 0) * 10_000, 0)
}

/** 확인할 미래 계획이 0건이면 결과를 반환하지 않는다 (G2 · AC-001) */
export function isPlanEmpty(spends: SpendItem[]): boolean {
  return signedTotal(spends) === 0
}

/**
 * 12개월 창에 계획을 펼친 뒤 월 한도를 씌워 Gross Benefit을 만든다.
 *
 * 한 항목을 `spendingMonths`로 나눠 그 개월 수만큼 배분하므로, 같은 총액이라도
 * `한 번에`는 첫 달에 한도가 걸리고 `12개월`은 걸리지 않는다 — 기간 선택이 결과를 바꾼다.
 */
export function projectedGross(
  spends: SpendItem[],
  includeNew: boolean,
  multiplier: number,
): number {
  const rate = includeNew ? 0.1365 : 0.062
  const monthlyCap = includeNew ? 1_000_000 : 450_000
  const monthlySpend = Array<number>(HORIZON_MONTHS).fill(0)

  for (const item of spends) {
    const months = item.spendingMonths || 1
    const distributed = (Math.max(0, Number(item.amount) || 0) * 10_000 * multiplier) / months
    for (let month = 0; month < months && month < HORIZON_MONTHS; month += 1) {
      monthlySpend[month] = (monthlySpend[month] ?? 0) + distributed
    }
  }

  const gross = monthlySpend.reduce((sum, value) => sum + Math.min(value * rate, monthlyCap), 0)
  // 천원 단위로 끊는다 — 원 단위 잔돈은 예시 수치에 의미가 없다
  return Math.round(gross / 1000) * 1000
}

/** `현재 조합 유지`의 원인을 2종으로 분해해 기록한다 (`T38`) */
export type HoldReason = '제약과다' | '임계미달' | null

export interface Outcome {
  key: ScenarioKey
  label: string
  multiplier: number
  /** 시나리오 배수를 반영한 계획 총액 */
  total: number
  gross: number
  fee: number
  requalificationLoss: number
  issuanceWait: number
  net: number
  /** 결과 화면에 크게 띄우는 연간 혜택 */
  displayBenefit: number
  /** 현재 조합(₩486,000) 대비 추가 혜택 */
  benefitIncrease: number
  pass: boolean
  holdReason: HoldReason
  holdMessage: string
  cards: OutcomeCard[]
  /** 계산에 쓴 계획을 그대로 얼려 둔다 — 근거 화면이 이 값을 읽는다 */
  spends: SpendItem[]
}

export function buildScenario(
  key: ScenarioKey,
  multiplier: number,
  spends: SpendItem[],
  maxCards: number,
  includeNew: boolean,
): Outcome {
  const total = Math.round(signedTotal(spends) * multiplier)
  const gross = projectedGross(spends, includeNew, multiplier)
  const fee = includeNew ? NEW_CARD_COST.fee : 0
  const requalificationLoss = includeNew ? NEW_CARD_COST.requalificationLoss : 0
  const issuanceWait = includeNew ? NEW_CARD_COST.issuanceWait : 0
  const net = gross - fee - requalificationLoss - issuanceWait

  const pass = net >= NET_BENEFIT_FLOOR && net >= gross * NET_BENEFIT_RATIO

  /*
   * 제약(카드 수)을 풀면 임계를 넘는 경우와, 풀어도 못 넘는 경우를 나눈다.
   * `제약과다`일 때만 결과 화면에 힌트 한 줄을 노출한다 (`T38`).
   */
  const holdReason: HoldReason = pass
    ? null
    : maxCards < 2 && net >= NET_BENEFIT_FLOOR
      ? '제약과다'
      : '임계미달'
  const holdMessage = pass
    ? ''
    : holdReason === '제약과다'
      ? '설정한 최대 카드 수가 적어요'
      : '예상 추가 혜택이 변경 기준보다 작아요'

  const cards = pass ? SCENARIO_VARIANTS[key] : HOLD_CARDS
  const displayBenefit = cards.reduce((sum, card) => sum + card.benefit, 0)
  /*
   * 현재 조합 대비 차액만 말한다. 기준선 없는 차액을 화면에 띄우지 않는다 (`T26`).
   * 기준선은 `최근 12개월 받은 혜택`(₩486,000)이다 — 현재 화면에서 사용자가 이미 본 값이라
   * 결과의 차액을 자기 눈으로 대조할 수 있다.
   */
  const benefitIncrease = Math.max(0, displayBenefit - CURRENT_STATE.annualBenefit)

  return {
    key,
    label: SCENARIO_LABEL[key],
    multiplier,
    total,
    gross,
    fee,
    requalificationLoss,
    issuanceWait,
    net,
    displayBenefit,
    benefitIncrease,
    pass,
    holdReason,
    holdMessage,
    cards,
    spends: spends.map((item) => ({ ...item })),
  }
}

export type Outcomes = Record<ScenarioKey, Outcome>

export function buildOutcomes(
  spends: SpendItem[],
  maxCards: number,
  includeNew: boolean,
): Outcomes {
  return SCENARIOS.reduce((acc, option) => {
    acc[option.key] = buildScenario(option.key, option.multiplier, spends, maxCards, includeNew)
    return acc
  }, {} as Outcomes)
}

/** 근거 화면의 지출 반영 표 — 한 번에 쓰면 총액, 나눠 쓰면 월 금액으로 보여준다 */
export function spendEvidenceRows(outcome: Outcome) {
  return outcome.spends.map((item) => {
    const months = item.spendingMonths || 1
    const scenarioAmount = item.amount * 10_000 * outcome.multiplier
    return {
      label: item.label,
      months,
      periodLabel: months === 1 ? '한 번에' : `${months}개월`,
      scenarioAmount,
      monthlyAmount: Math.round(scenarioAmount / months),
    }
  })
}
