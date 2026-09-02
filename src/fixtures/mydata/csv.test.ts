import { describe, expect, it } from 'vitest'
import {
  monthlyAverageByCategory,
  monthsCovered,
  parseCards,
  parsePerformance,
  parseTransactions,
  qualifyingMonthSpendByCard,
  toCardTypeEnum,
  totalByCard,
  totalSpend,
} from './csv'
import { toAppCategory } from './categories'

const CARDS_CSV = `user_id,card_id,issuer,card_name,card_type,annual_fee,issued_date
u_001,card_01,신한카드,신한카드 Deep Dream,신용,10000,2023-04-12
u_001,card_03,카카오뱅크,카카오뱅크 체크카드,체크,0,2022-11-20`

const PERFORMANCE_CSV = `user_id,card_id,card_name,year_month,prev_month_spending,billed_amount,points_balance
u_001,card_01,신한카드 Deep Dream,2026-07,603390,915390,79455
u_001,card_01,신한카드 Deep Dream,2026-08,915390,931190,85973
u_001,card_03,카카오뱅크 체크카드,2026-08,425300,410000,8508`

const TRANSACTIONS_CSV = `user_id,card_id,card_name,card_type,approved_at,merchant_name,merchant_category,amount,installment_months,approval_no
u_001,card_01,신한카드 Deep Dream,신용,2025-09-01 14:35:00,CGV 강남,문화/여가,24500,0,00100449
u_001,card_03,카카오뱅크 체크카드,체크,2025-09-01 09:56:00,티머니 대중교통,대중교통,1600,0,00100202
u_001,card_01,신한카드 Deep Dream,신용,2025-10-02 11:16:00,배달의민족,배달음식,18000,0,00100191
u_001,card_01,신한카드 Deep Dream,신용,2025-10-05 19:00:00,스시로,외식,42000,6,00100777`

describe('parseCards', () => {
  it('카드사·카드명·연회비·발급일을 정수와 문자열로 옮긴다', () => {
    const rows = parseCards(CARDS_CSV)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ cardId: 'card_01', annualFee: 10_000, cardType: '신용' })
    expect(rows[1]).toMatchObject({ cardId: 'card_03', annualFee: 0, cardType: '체크' })
  })

  it('칼럼 수가 다르면 몇 번째 행인지 알려주고 던진다', () => {
    const broken = `${CARDS_CSV}\nu_001,card_09,신한카드`
    expect(() => parseCards(broken)).toThrow(/4행의 칼럼 수가 3개/)
  })

  it('금액이 정수가 아니면 0으로 넘기지 않고 던진다', () => {
    const broken = `user_id,card_id,issuer,card_name,card_type,annual_fee,issued_date
u_001,card_01,신한카드,Deep Dream,신용,만원,2023-04-12`
    expect(() => parseCards(broken)).toThrow(/annual_fee 값 "만원"/)
  })

  it('데이터 행이 없으면 빈 배열이 아니라 오류다', () => {
    expect(() => parseCards('user_id,card_id,issuer,card_name,card_type,annual_fee,issued_date')).toThrow(
      /데이터 행이 없습니다/,
    )
  })
})

describe('parseTransactions', () => {
  it('CSV 업종을 앱 카테고리로 함께 옮긴다', () => {
    const rows = parseTransactions(TRANSACTIONS_CSV)
    expect(rows).toHaveLength(4)
    expect(rows[0]).toMatchObject({ merchantCategory: '문화/여가', category: '기타', amount: 24_500 })
    expect(rows[1]).toMatchObject({ merchantCategory: '대중교통', category: '교통' })
    expect(rows[2]?.category).toBe('음식/배달')
    expect(rows[3]).toMatchObject({ category: '음식/배달', installmentMonths: 6 })
  })

  it('승인번호를 문자열로 보존한다 — 앞자리 0이 사라지면 재시드 시 중복이 생긴다', () => {
    const rows = parseTransactions(TRANSACTIONS_CSV)
    expect(rows[0]?.approvalNo).toBe('00100449')
  })
})

describe('toAppCategory', () => {
  it('외식과 배달음식을 한 카테고리로 묶는다', () => {
    expect(toAppCategory('외식')).toBe('음식/배달')
    expect(toAppCategory('배달음식')).toBe('음식/배달')
  })

  it('편의점과 마트는 따로 둔다 — 약관에서 한도가 따로 붙는다', () => {
    expect(toAppCategory('편의점')).toBe('편의점')
    expect(toAppCategory('대형마트')).toBe('마트')
  })

  it('구독 3종을 하나로 묶는다', () => {
    expect(toAppCategory('구독/OTT')).toBe('구독')
    expect(toAppCategory('구독/커머스')).toBe('구독')
    expect(toAppCategory('구독/음악')).toBe('구독')
  })

  it('표에 없는 업종은 버리지 않고 기타로 보낸다 — 총액이 줄면 결론 차액이 틀어진다', () => {
    expect(toAppCategory('처음 보는 업종')).toBe('기타')
  })
})

describe('monthlyAverageByCategory', () => {
  it('분모를 데이터에 등장한 개월 수로 잡는다', () => {
    const rows = parseTransactions(TRANSACTIONS_CSV)
    expect(monthsCovered(rows)).toEqual(['2025-09', '2025-10'])

    const averages = monthlyAverageByCategory(rows)
    const food = averages.find((row) => row.category === '음식/배달')
    // (18,000 + 42,000) / 2개월 = 30,000
    expect(food?.monthly_amount).toBe(30_000)

    const etc = averages.find((row) => row.category === '기타')
    // 24,500 / 2개월 = 12,250
    expect(etc?.monthly_amount).toBe(12_250)
  })

  it('금액이 큰 카테고리를 앞에 둔다 — 순서가 흔들리면 결과가 달라진다', () => {
    const averages = monthlyAverageByCategory(parseTransactions(TRANSACTIONS_CSV))
    expect(averages.map((row) => row.category)).toEqual(['음식/배달', '기타', '교통'])
  })

  it('거래가 없으면 빈 배열이다', () => {
    expect(monthlyAverageByCategory([])).toEqual([])
  })
})

describe('집계', () => {
  it('전체 합계와 카드별 합계가 맞는다', () => {
    const rows = parseTransactions(TRANSACTIONS_CSV)
    expect(totalSpend(rows)).toBe(24_500 + 1_600 + 18_000 + 42_000)
    expect(totalByCard(rows).get('card_01')).toBe(24_500 + 18_000 + 42_000)
    expect(totalByCard(rows).get('card_03')).toBe(1_600)
  })

  it('실적 기준월 사용액은 가장 최근 달의 전월실적이다', () => {
    const qualifying = qualifyingMonthSpendByCard(parsePerformance(PERFORMANCE_CSV))
    // card_01의 2026-08 전월실적. 2026-07 값(603,390)이 아니다
    expect(qualifying.get('card_01')).toBe(915_390)
    expect(qualifying.get('card_03')).toBe(425_300)
  })
})

describe('toCardTypeEnum', () => {
  it('신용과 체크를 enum으로 옮긴다', () => {
    expect(toCardTypeEnum('신용')).toBe('CREDIT')
    expect(toCardTypeEnum('체크')).toBe('CHECK')
  })

  it('모르는 값을 신용으로 넘기지 않는다', () => {
    expect(() => toCardTypeEnum('선불')).toThrow(/알 수 없는 card_type "선불"/)
  })
})
