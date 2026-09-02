/**
 * 마이데이터 CSV 3종을 DB에 적재한다 (TEC-04 · C-TEC-003).
 *
 * 다른 Fixture(`change_case` · `maintain_case`)와 달리 과거 소비를 합성하지 않고
 * `transactions.csv`의 **거래 1,268건을 그대로** 넣는다. 승인번호가 있어서 재실행해도
 * 같은 행이 만들어지고, 카드별 결제 내역이 남아 `현재 카드와 혜택 확인` 화면(UI-001)의
 * 카드별 지출·혜택을 실데이터로 계산할 수 있다.
 *
 * `card_performance.csv`의 전월실적은 근거 6항목의 `실적구간` 판정 근거로 함께 적재한다.
 */
import { CardType, PrismaClient, SpendDirection } from '@prisma/client'
import { loadMydata, MYDATA_FIXTURE_ID } from './mydata-loader'
import { toCardTypeEnum } from '../src/fixtures/mydata/csv'

/** DB의 CardProduct.id — Fixture 안에서만 유일한 card_id를 전역 유일 키로 만든다. */
function cardKey(cardId: string): string {
  return `${MYDATA_FIXTURE_ID}:${cardId}`
}

function utcDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`)
}

/** `YYYY-MM-DD HH:mm:ss` → Date. CSV는 KST 기준 로컬 시각이라 그대로 UTC로 읽어 고정한다. */
function utcDateTime(value: string): Date {
  return new Date(`${value.replace(' ', 'T')}Z`)
}

export async function seedMydata(prisma: PrismaClient): Promise<{
  cards: number
  performances: number
  transactions: number
  totalSpend: number
}> {
  const { profile, cardRows, performanceRows, transactionRows, summary } = loadMydata()

  // 카드 타입은 CSV가 정본이다. 후보 카드는 CSV에 없으므로 신용으로 선언한다.
  const cardTypeById = new Map<string, CardType>(
    cardRows.map((row) => [row.cardId, toCardTypeEnum(row.cardType) as CardType]),
  )
  const issuedAtById = new Map(cardRows.map((row) => [row.cardId, utcDate(row.issuedDate)]))

  await prisma.fixture.create({
    data: {
      id: MYDATA_FIXTURE_ID,
      label: '마이데이터 CSV',
      asOfDate: utcDate(profile.as_of_date),
      users: { create: { label: '예시 데이터' } },
      constraint: {
        create: {
          maxCards: profile.constraint.max_cards,
          allowNewCard: profile.constraint.allow_new_card,
          maxNewCards: profile.constraint.max_new_cards,
        },
      },
      suggestions: {
        create: profile.suggested_plan.map((item) => ({
          id: `${MYDATA_FIXTURE_ID}:${item.plan_id}`,
          category: item.category,
          amount: item.amount,
          direction:
            item.direction === 'increase' ? SpendDirection.INCREASE : SpendDirection.DECREASE,
          monthOffset: item.month_offset,
        })),
      },
    },
  })

  for (const card of profile.cards) {
    const rule = profile.rules.find((item) => item.card_id === card.card_id)
    if (!rule) {
      throw new Error(`[seed:mydata] ${card.card_id}의 혜택 규칙이 없습니다.`)
    }

    await prisma.cardProduct.create({
      data: {
        id: cardKey(card.card_id),
        fixtureId: MYDATA_FIXTURE_ID,
        issuer: card.issuer,
        name: card.name,
        annualFee: card.annual_fee,
        officialUrl: card.official_url,
        owned: card.owned,
        cardType: cardTypeById.get(card.card_id) ?? CardType.CREDIT,
        qualifyingMonthSpend: card.qualifying_month_spend,
        issuedAt: issuedAtById.get(card.card_id) ?? null,
        requalificationLoss: card.transition.requalification_loss,
        issuanceWaitCost: card.transition.issuance_wait_cost,
        transitionSourceLabel: card.transition.source.label,
        transitionSourceDate: utcDate(card.transition.source.as_of_date),
        rule: {
          create: {
            ruleVersion: rule.rule_version,
            asOfDate: utcDate(rule.as_of_date),
            effectiveFrom: utcDate(rule.effective_from),
            effectiveTo: utcDate(rule.effective_to),
            categories: rule.categories,
            excluded: rule.excluded,
            tiers: {
              create: rule.tiers.map((tier) => ({
                minMonthlySpend: tier.min_monthly_spend,
                rate: tier.rate,
                monthlyCap: tier.monthly_cap,
              })),
            },
            // 출처를 댈 수 없는 항목은 행을 만들지 않는다 — 0으로 채우지 않는다 (T42)
            unmodeled: {
              create: rule.unmodeled
                .filter((item) => item.source?.label && item.bound > 0)
                .map((item) => ({
                  label: item.label,
                  bound: item.bound,
                  sourceLabel: item.source.label,
                  sourceDate: utcDate(item.source.as_of_date),
                })),
            },
          },
        },
      },
    })
  }

  // 카드별 월 전월실적 — 실적구간 판정 근거 (AC-002)
  await prisma.cardMonthlyPerformance.createMany({
    data: performanceRows.map((row) => ({
      id: `${MYDATA_FIXTURE_ID}:${row.cardId}:${row.yearMonth}`,
      cardId: cardKey(row.cardId),
      yearMonth: row.yearMonth,
      prevMonthSpending: row.prevMonthSpending,
      billedAmount: row.billedAmount,
      pointsBalance: row.pointsBalance,
    })),
  })

  // 거래 원본. 승인번호가 있어 재실행 시 같은 행이 된다 (TEC-04 완료 조건 — 재실행 재현성)
  await prisma.pastSpend.createMany({
    data: transactionRows.map((row) => ({
      id: `${MYDATA_FIXTURE_ID}:${row.approvalNo}`,
      fixtureId: MYDATA_FIXTURE_ID,
      merchant: row.merchantName,
      // transactions.csv에는 업종코드 칼럼이 없다. 없는 값을 만들지 않고 비워 둔다
      industry: null,
      category: row.category,
      amount: row.amount,
      paidAt: utcDateTime(row.approvedAt),
      cardId: cardKey(row.cardId),
      approvalNo: row.approvalNo,
      installmentMonths: row.installmentMonths,
    })),
  })

  return {
    cards: profile.cards.length,
    performances: performanceRows.length,
    transactions: transactionRows.length,
    totalSpend: summary.totalSpend,
  }
}
