import { describe, expect, it } from 'vitest'
import { BASE_SPENDS, HOLD_CARDS, type SpendItem } from '@/fixtures/prototype'
import {
  NET_BENEFIT_FLOOR,
  NET_BENEFIT_RATIO,
  buildOutcomes,
  buildScenario,
  isPlanEmpty,
  projectedGross,
  signedTotal,
} from './scenario'

/**
 * 기준본(`docs/prototype/cardfit-prd-srs-v0.4.html`)의 계산을 그대로 재현하는지 고정한다.
 * 숫자를 손으로 적어 두는 이유 — 엔진에서 값을 다시 읽어오면 엔진이 바뀔 때 테스트도 같이 바뀌어
 * 기준본과의 차이를 잡지 못한다.
 */
const clone = (): SpendItem[] => BASE_SPENDS.map((item) => ({ ...item }))

describe('signedTotal', () => {
  it('만원 단위 입력을 원 단위 합계로 되돌린다', () => {
    // 840 + 320 + 480 = 1,640만원
    expect(signedTotal(clone())).toBe(16_400_000)
  })

  it('음수 입력은 0으로 본다 — 미래지출은 앞으로 늘어날 지출만 받는다 (T10)', () => {
    expect(signedTotal([{ id: 'x', label: '기타', amount: -100, spendingMonths: 1 }])).toBe(0)
  })
})

describe('isPlanEmpty', () => {
  it('금액이 전부 0이면 0건이다 (G2 · AC-001)', () => {
    expect(isPlanEmpty([{ id: 'x', label: '기타', amount: 0, spendingMonths: 1 }])).toBe(true)
    expect(isPlanEmpty([])).toBe(true)
    expect(isPlanEmpty(clone())).toBe(false)
  })
})

describe('projectedGross', () => {
  it('12개월 창에 계획을 펼치고 월 한도를 씌운다', () => {
    // 1개월차 7,600,000 × 0.1365 = 1,037,400 → 월 한도 1,000,000으로 잘린다
    // 2·3개월차 4,400,000 × 0.1365 = 600,600 씩
    expect(projectedGross(clone(), true, 1)).toBe(2_201_000)
  })

  it('지출 기간을 늘리면 월 한도에 덜 걸려 결과가 달라진다', () => {
    const spread = clone().map((item) => ({ ...item, spendingMonths: 12 }))
    expect(projectedGross(spread, true, 1)).toBe(2_239_000)
  })

  it('신규 카드를 허용하지 않으면 낮은 요율과 낮은 한도를 쓴다', () => {
    expect(projectedGross(clone(), false, 1)).toBe(996_000)
  })
})

describe('buildScenario', () => {
  it('예상대로 시나리오는 게이트를 통과하고 조합을 바꾼다', () => {
    const outcome = buildScenario('expected', 1, clone(), 2, true)

    expect(outcome.gross).toBe(2_201_000)
    expect(outcome.net).toBe(2_143_000)
    expect(outcome.pass).toBe(true)
    expect(outcome.holdReason).toBeNull()
    expect(outcome.displayBenefit).toBe(2_143_000)
    expect(outcome.benefitIncrease).toBe(1_657_000)
    // 카드마다 신규·유지·정리 중 하나씩만 붙는다 (AC-005)
    expect(outcome.cards.map((card) => card.state)).toEqual(['유지', '정리', '신규'])
    // 신규 발급은 최대 1장이다 (`T6`)
    expect(outcome.cards.filter((card) => card.state === '신규')).toHaveLength(1)
  })

  it('시나리오마다 조합과 상태가 독립적으로 바뀐다 (AC-014)', () => {
    const outcomes = buildOutcomes(clone(), 2, true)

    expect(outcomes.low.net).toBe(1_554_000)
    expect(outcomes.expected.net).toBe(2_143_000)
    expect(outcomes.high.net).toBe(2_480_000)
    expect(outcomes.low.cards.map((card) => card.state)).toEqual(['유지', '유지', '신규'])
    expect(outcomes.high.cards.map((card) => card.state)).toEqual(['정리', '유지', '신규'])
  })

  it('임계 미달이면 현재 조합 유지를 돌려준다 — Error가 아니라 정상 결과다 (AC-004)', () => {
    const tiny: SpendItem[] = [{ id: 'x', label: '기타', amount: 3, spendingMonths: 1 }]
    const outcome = buildScenario('expected', 1, tiny, 2, true)

    expect(outcome.pass).toBe(false)
    expect(outcome.holdReason).toBe('임계미달')
    expect(outcome.cards).toEqual(HOLD_CARDS)
    // 유지 결론에서도 배분을 비우지 않는다 (`T21`)
    expect(outcome.displayBenefit).toBe(724_000)
  })

  it('이중 조건이다 — 하나라도 미달이면 유지다 (D-002 · T16)', () => {
    // 순혜택이 5만원을 넘어도 Gross의 15%에 못 미치면 통과하지 않는다
    const outcome = buildScenario('expected', 1, clone(), 2, true)
    expect(outcome.net >= NET_BENEFIT_FLOOR).toBe(true)
    expect(outcome.net >= outcome.gross * NET_BENEFIT_RATIO).toBe(true)

    const borderline = buildScenario(
      'expected',
      1,
      [{ id: 'x', label: '기타', amount: 40, spendingMonths: 1 }],
      2,
      true,
    )
    expect(borderline.gross).toBe(55_000)
    expect(borderline.net).toBe(-3_000)
    expect(borderline.pass).toBe(false)
  })

  it('카드 수를 줄여도 게이트 자체는 순혜택으로만 판정한다', () => {
    /*
     * `제약과다`는 문구만 정의하고 Mock에서는 트리거되지 않는다 (`T38` — `T40`과 같은 방식).
     * 신규를 허용하면 전환비용이 58,000원 고정이라 `순혜택 ≥ 5만원`과
     * `순혜택 < Gross의 15%`가 동시에 성립할 수 없기 때문이다.
     * 규칙은 실연동 대비로 남겨두고, 여기서는 카드 수가 판정을 바꾸지 않는다는 사실을 고정한다.
     */
    const outcome = buildScenario('expected', 1, clone(), 1, true)
    expect(outcome.pass).toBe(true)
    expect(outcome.holdReason).toBeNull()
  })

  it('같은 입력이면 같은 결과가 나온다 (NFR-001)', () => {
    expect(buildOutcomes(clone(), 2, true)).toEqual(buildOutcomes(clone(), 2, true))
  })
})
