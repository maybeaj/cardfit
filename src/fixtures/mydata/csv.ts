/**
 * 마이데이터 CSV 3종 파서 — `cards.csv` · `card_performance.csv` · `transactions.csv`.
 *
 * 파일을 읽지 않고 문자열만 받는다. fs에 의존하지 않아야 단위 테스트에서
 * 작은 문자열로 경계값을 검증할 수 있다 (`TECH_SPEC` 4절 — 도메인은 브라우저·OS API를 참조하지 않는다).
 *
 * 파서는 금액을 만들지 않는다. 문자열을 정수 원 단위로 옮기기만 하며,
 * 숫자가 아닌 값을 만나면 0으로 넘기지 않고 던진다 — 조용히 0이 되면
 * 과거 소비 합계가 줄어들어 결론 차액이 틀어진다 (`T26`).
 */
import { toAppCategory, type AppCategory } from './categories'

export interface MydataCardRow {
  userId: string
  cardId: string
  issuer: string
  cardName: string
  /** `신용` / `체크` */
  cardType: string
  annualFee: number
  issuedDate: string
}

export interface MydataPerformanceRow {
  userId: string
  cardId: string
  cardName: string
  /** `YYYY-MM` */
  yearMonth: string
  prevMonthSpending: number
  billedAmount: number
  pointsBalance: number
}

export interface MydataTransactionRow {
  userId: string
  cardId: string
  cardName: string
  cardType: string
  /** `YYYY-MM-DD HH:mm:ss` */
  approvedAt: string
  merchantName: string
  /** CSV 원본 업종 */
  merchantCategory: string
  /** 앱 카테고리로 옮긴 값 */
  category: AppCategory
  amount: number
  installmentMonths: number
  approvalNo: string
}

/** 헤더 1줄 + 데이터 n줄. 따옴표로 감싼 필드는 이 CSV들에 없어 단순 분할로 충분하다. */
function parseRows(text: string, expectedColumns: number, file: string): string[][] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 2) {
    throw new Error(`[csv] ${file}: 데이터 행이 없습니다.`)
  }

  return lines.slice(1).map((line, index) => {
    const cells = line.split(',')
    if (cells.length !== expectedColumns) {
      throw new Error(
        `[csv] ${file}: ${index + 2}행의 칼럼 수가 ${cells.length}개입니다 (기대 ${expectedColumns}개).`,
      )
    }
    return cells.map((cell) => cell.trim())
  })
}

function toInt(raw: string, file: string, field: string): number {
  if (!/^-?\d+$/.test(raw)) {
    throw new Error(`[csv] ${file}: ${field} 값 "${raw}"이 정수가 아닙니다.`)
  }
  return Number.parseInt(raw, 10)
}

export function parseCards(text: string): MydataCardRow[] {
  return parseRows(text, 7, 'cards.csv').map((cells) => ({
    userId: cells[0] as string,
    cardId: cells[1] as string,
    issuer: cells[2] as string,
    cardName: cells[3] as string,
    cardType: cells[4] as string,
    annualFee: toInt(cells[5] as string, 'cards.csv', 'annual_fee'),
    issuedDate: cells[6] as string,
  }))
}

export function parsePerformance(text: string): MydataPerformanceRow[] {
  return parseRows(text, 7, 'card_performance.csv').map((cells) => ({
    userId: cells[0] as string,
    cardId: cells[1] as string,
    cardName: cells[2] as string,
    yearMonth: cells[3] as string,
    prevMonthSpending: toInt(cells[4] as string, 'card_performance.csv', 'prev_month_spending'),
    billedAmount: toInt(cells[5] as string, 'card_performance.csv', 'billed_amount'),
    pointsBalance: toInt(cells[6] as string, 'card_performance.csv', 'points_balance'),
  }))
}

export function parseTransactions(text: string): MydataTransactionRow[] {
  return parseRows(text, 10, 'transactions.csv').map((cells) => {
    const merchantCategory = cells[6] as string
    return {
      userId: cells[0] as string,
      cardId: cells[1] as string,
      cardName: cells[2] as string,
      cardType: cells[3] as string,
      approvedAt: cells[4] as string,
      merchantName: cells[5] as string,
      merchantCategory,
      category: toAppCategory(merchantCategory),
      amount: toInt(cells[7] as string, 'transactions.csv', 'amount'),
      installmentMonths: toInt(cells[8] as string, 'transactions.csv', 'installment_months'),
      approvalNo: cells[9] as string,
    }
  })
}

/* ── 집계 ─────────────────────────────────────────────────── */

/** `YYYY-MM-DD HH:mm:ss` → `YYYY-MM` */
export function toYearMonth(approvedAt: string): string {
  return approvedAt.slice(0, 7)
}

/** 거래에 등장한 `YYYY-MM`을 오름차순으로 돌려준다. */
export function monthsCovered(rows: MydataTransactionRow[]): string[] {
  return [...new Set(rows.map((row) => toYearMonth(row.approvedAt)))].sort()
}

/**
 * 카테고리별 **월평균** 지출. 계산 엔진이 소비하는 `PastSpend` 형태다.
 *
 * 분모는 거래가 존재하는 개월 수다. 12로 고정하지 않는 이유 —
 * CSV가 12개월이 아닐 때 월평균이 조용히 작아져 실적구간 판정이 낮은 구간으로
 * 잘못 떨어진다. 분모를 데이터에서 읽으면 그 오류가 생기지 않는다.
 *
 * 내림 처리로 생기는 오차는 버린다. 원 단위 미만이라 배분 합계 오차 1원 이하 제약을 지킨다.
 */
export function monthlyAverageByCategory(
  rows: MydataTransactionRow[],
): { category: string; monthly_amount: number }[] {
  const months = monthsCovered(rows).length
  if (months === 0) return []

  const totals = new Map<string, number>()
  for (const row of rows) {
    totals.set(row.category, (totals.get(row.category) ?? 0) + row.amount)
  }

  return [...totals.entries()]
    .map(([category, total]) => ({
      category,
      monthly_amount: Math.floor(total / months),
    }))
    .sort((a, b) => b.monthly_amount - a.monthly_amount || a.category.localeCompare(b.category))
}

/** 카드별 12개월 지출 합계. `현재 카드와 혜택 확인` 화면(UI-001)의 카드 행에 쓴다. */
export function totalByCard(rows: MydataTransactionRow[]): Map<string, number> {
  const totals = new Map<string, number>()
  for (const row of rows) {
    totals.set(row.cardId, (totals.get(row.cardId) ?? 0) + row.amount)
  }
  return totals
}

/** 전체 12개월 지출 합계. `최근 12개월 지출액` 지표(UI-001)다. */
export function totalSpend(rows: MydataTransactionRow[]): number {
  return rows.reduce((sum, row) => sum + row.amount, 0)
}

/**
 * 실적 기준월 사용액 — 가장 최근 달의 `prev_month_spending`.
 *
 * 실적구간은 "전월실적"으로 판정하므로 CSV가 이미 계산해 둔 이 값을 그대로 쓴다.
 * 거래 합계로 다시 계산하지 않는 이유 — 카드사는 실적 산정에서 제외하는 업종이 있어
 * 거래 합계와 전월실적이 원래 다르다. 다시 계산하면 카드사 기준과 어긋난다.
 */
export function qualifyingMonthSpendByCard(rows: MydataPerformanceRow[]): Map<string, number> {
  const latest = new Map<string, MydataPerformanceRow>()
  for (const row of rows) {
    const current = latest.get(row.cardId)
    if (!current || row.yearMonth > current.yearMonth) {
      latest.set(row.cardId, row)
    }
  }
  return new Map([...latest].map(([cardId, row]) => [cardId, row.prevMonthSpending]))
}

/** CSV의 `신용`/`체크`를 Prisma enum 값으로. 모르는 값은 던진다 — 조용히 신용으로 넘기지 않는다. */
export function toCardTypeEnum(cardType: string): 'CREDIT' | 'CHECK' {
  if (cardType === '신용') return 'CREDIT'
  if (cardType === '체크') return 'CHECK'
  throw new Error(`[csv] 알 수 없는 card_type "${cardType}" — 신용 또는 체크여야 합니다.`)
}
