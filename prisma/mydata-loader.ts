/**
 * `data/mydata/*.csv` → `Profile` + DB 적재용 원본 행.
 *
 * 파일을 읽는 코드는 여기에만 둔다. `src/fixtures/mydata/*`는 fs에 의존하지 않아
 * 단위 테스트와 클라이언트 번들 양쪽에서 안전하다 (`TECH_SPEC` 4절).
 *
 * 이 로더는 금액을 만들지 않는다. CSV 값을 옮기고 집계하기만 한다 —
 * 금액은 규칙 엔진이 계산하고, Seed는 입력만 준비한다.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Profile } from '../src/domain/types'
import {
  monthlyAverageByCategory,
  monthsCovered,
  parseCards,
  parsePerformance,
  parseTransactions,
  qualifyingMonthSpendByCard,
  totalByCard,
  totalSpend,
  type MydataCardRow,
  type MydataPerformanceRow,
  type MydataTransactionRow,
} from '../src/fixtures/mydata/csv'
import {
  CANDIDATE_CARDS,
  HELD_CARD_TRANSITIONS,
  MYDATA_AS_OF,
  MYDATA_RULES,
} from '../src/fixtures/mydata/rules'

const CSV_DIR = join(process.cwd(), 'data', 'mydata')

export const MYDATA_FIXTURE_ID = 'mydata_csv'

export interface MydataBundle {
  profile: Profile
  cardRows: MydataCardRow[]
  performanceRows: MydataPerformanceRow[]
  transactionRows: MydataTransactionRow[]
  /** 화면 지표 검증용 집계 — 시드 로그와 테스트가 함께 읽는다 */
  summary: {
    months: string[]
    totalSpend: number
    totalByCard: Map<string, number>
  }
}

function read(file: string): string {
  try {
    return readFileSync(join(CSV_DIR, file), 'utf8')
  } catch {
    throw new Error(
      `[mydata] ${join('data', 'mydata', file)}를 읽을 수 없습니다. 마이데이터 CSV 3종이 저장소에 있어야 시드가 동작합니다.`,
    )
  }
}

/**
 * 과거 패턴에서 미래지출 제안값을 만든다 (FR-006).
 *
 * 12개월에 몇 번만 나타나는 **덩어리 지출**을 고른다 — 매달 반복되는 생활비는
 * 이미 과거 패턴 기저에 들어가 있어서 다시 제안하면 이중 계산이 된다 (`T15`).
 * 제안값은 초안이며 사용자가 `이 계획대로 계산하기`를 눌러야 계획이 된다 (`T19` · `T37`).
 */
function buildSuggestions(rows: MydataTransactionRow[]): Profile['suggested_plan'] {
  const LUMPY_MAX_COUNT = 6

  const grouped = new Map<string, { total: number; count: number }>()
  for (const row of rows) {
    const current = grouped.get(row.category) ?? { total: 0, count: 0 }
    grouped.set(row.category, { total: current.total + row.amount, count: current.count + 1 })
  }

  // 건수가 적고 금액이 큰 순서 — 여행·가전처럼 예정해서 쓰는 지출이 위로 온다
  const lumpy = [...grouped.entries()]
    .filter(([, value]) => value.count <= LUMPY_MAX_COUNT)
    .sort((a, b) => b[1].total - a[1].total || a[0].localeCompare(b[0], 'ko'))

  /*
   * 제안 기간은 결정론적으로 배치한다 — 무작위면 같은 입력에 다른 결과가 나온다 (NFR-001).
   * 큰 금액일수록 짧게 잡는다. `lumpy`는 드물게 크게 쓰는 업종이라 여러 달에 나눠 쓰는
   * 성격이 아니고, 한 달에 몰릴 때 월 혜택한도에 걸리는지가 이 화면이 보여줄 값이다.
   */
  const spans = [1, 3, 6] as const

  return lumpy.slice(0, 3).map(([category, value], index) => ({
    plan_id: `mydata-p${index + 1}`,
    category,
    // 만원 단위로 내려 제안한다. 과거 실적을 그대로 미래로 단정하지 않는다는 뜻이다
    amount: Math.floor(value.total / 10_000) * 10_000,
    spending_months: spans[index] ?? 3,
    source: 'suggested' as const,
  }))
}

export function loadMydata(): MydataBundle {
  const cardRows = parseCards(read('cards.csv'))
  const performanceRows = parsePerformance(read('card_performance.csv'))
  const transactionRows = parseTransactions(read('transactions.csv'))

  const qualifying = qualifyingMonthSpendByCard(performanceRows)

  const heldCards: Profile['cards'] = cardRows.map((row) => {
    const transition = HELD_CARD_TRANSITIONS[row.cardId]
    if (!transition) {
      throw new Error(
        `[mydata] ${row.cardId}(${row.cardName})의 전환비용이 선언되지 않았습니다. src/fixtures/mydata/rules.ts에 추가하세요.`,
      )
    }
    return {
      card_id: row.cardId,
      issuer: row.issuer,
      name: row.cardName,
      annual_fee: row.annualFee,
      official_url: officialUrlFor(row.issuer),
      owned: true,
      qualifying_month_spend: qualifying.get(row.cardId) ?? 0,
      transition,
    }
  })

  const cards = [...heldCards, ...CANDIDATE_CARDS]

  // 규칙 없는 카드는 근거 6항목을 못 채워 후보에서 전부 빠진다 — 시드 단계에서 잡는다
  const ruleIds = new Set(MYDATA_RULES.map((rule) => rule.card_id))
  const missing = cards.filter((card) => !ruleIds.has(card.card_id))
  if (missing.length > 0) {
    throw new Error(
      `[mydata] 혜택 규칙이 없는 카드: ${missing.map((card) => card.card_id).join(', ')}`,
    )
  }

  const profile: Profile = {
    fixture_id: MYDATA_FIXTURE_ID,
    as_of_date: MYDATA_AS_OF,
    cards,
    rules: MYDATA_RULES,
    past_spend: monthlyAverageByCategory(transactionRows),
    suggested_plan: buildSuggestions(transactionRows),
    constraint: { max_cards: 2, allow_new_card: true, max_new_cards: 1 },
  }

  return {
    profile,
    cardRows,
    performanceRows,
    transactionRows,
    summary: {
      months: monthsCovered(transactionRows),
      totalSpend: totalSpend(transactionRows),
      totalByCard: totalByCard(transactionRows),
    },
  }
}

/** 카드사 공식 페이지. 신규 발급 아웃링크에만 쓰지만 보유 카드도 같은 표에서 관리한다 (`T25`). */
function officialUrlFor(issuer: string): string {
  const urls: Record<string, string> = {
    신한카드: 'https://www.shinhancard.com',
    삼성카드: 'https://www.samsungcard.com',
    카카오뱅크: 'https://www.kakaobank.com',
    현대카드: 'https://www.hyundaicard.com',
    우리카드: 'https://pc.wooricard.com',
    롯데카드: 'https://www.lottecard.co.kr',
    KB국민카드: 'https://card.kbcard.com',
    하나카드: 'https://www.hanacard.co.kr',
  }
  const url = urls[issuer]
  if (!url) throw new Error(`[mydata] ${issuer}의 공식 페이지 주소가 없습니다.`)
  return url
}
