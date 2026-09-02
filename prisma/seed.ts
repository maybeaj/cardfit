/**
 * TEC-04 — 과거 12개월 지출·카드·혜택 규칙 Mock Seed.
 *
 * Seed 원본은 `src/fixtures/*.ts`다 (TECH_SPEC 4절). 여기서 숫자를 새로 만들지 않는다 —
 * 정답셋(`change_case` 순혜택 186,000원)이 한 곳에서만 정의되도록 그 파일을 읽어 적재한다.
 *
 * 과거 소비는 SRS 6-1절대로 **거래 단위**(가맹점·업종코드·금액·결제일)로 적재하고,
 * Repository가 카테고리별 월평균으로 되돌린다. 분할은 합이 정확히 보존되도록 계산한다 —
 * 집계가 손실되면 계산 결과가 달라져 NFR-001이 깨진다.
 *
 * 재실행해도 같은 결과가 나온다 (TEC-04 완료 조건).
 */
import { PrismaClient, SpendDirection } from '@prisma/client'
import { changeCase } from '../src/fixtures/change-case'
import { maintainCase } from '../src/fixtures/maintain-case'
import type { Profile } from '../src/domain/types'
import { seedMydata } from './seed-mydata'

const prisma = new PrismaClient()

const HORIZON_MONTHS = 12
const SPLIT_PER_MONTH = 4

/** 카테고리별 예시 가맹점과 업종코드. 실제 가맹점 데이터가 아니다. */
const MERCHANTS: Record<string, { merchant: string; industry: string }> = {
  식비: { merchant: '예시 식당', industry: '5812' },
  쇼핑: { merchant: '예시 백화점', industry: '5311' },
  생활: { merchant: '예시 마트', industry: '5411' },
  교통: { merchant: '예시 교통', industry: '4111' },
  '가전·가구': { merchant: '예시 가전매장', industry: '5722' },
  여행: { merchant: '예시 여행사', industry: '4722' },
  예식: { merchant: '예시 예식장', industry: '7299' },
}

function fallbackMerchant(category: string) {
  return { merchant: `예시 ${category}`, industry: '0000' }
}

/** 월 금액을 합이 정확히 보존되는 n건으로 쪼갠다. 나머지는 첫 건에 싣는다. */
function splitAmount(total: number, parts: number): number[] {
  const base = Math.floor(total / parts)
  const out = Array.from({ length: parts }, () => base)
  out[0] = (out[0] as number) + (total - base * parts)
  return out.filter((amount) => amount > 0)
}

function dayOfMonth(index: number): number {
  // 결제일을 결정론적으로 흩뿌린다
  return [5, 12, 19, 26][index % 4] as number
}

function toEnum(direction: 'increase' | 'decrease'): SpendDirection {
  return direction === 'increase' ? SpendDirection.INCREASE : SpendDirection.DECREASE
}

async function seedProfile(profile: Profile, label: string) {
  const asOf = new Date(`${profile.as_of_date}T00:00:00Z`)

  await prisma.fixture.create({
    data: {
      id: profile.fixture_id,
      label,
      asOfDate: asOf,
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
          id: `${profile.fixture_id}:${item.plan_id}`,
          category: item.category,
          amount: item.amount,
          direction: toEnum(item.direction),
          monthOffset: item.month_offset,
        })),
      },
    },
  })

  for (const card of profile.cards) {
    const rule = profile.rules.find((item) => item.card_id === card.card_id)
    if (!rule) continue
    await prisma.cardProduct.create({
      data: {
        id: `${profile.fixture_id}:${card.card_id}`,
        fixtureId: profile.fixture_id,
        issuer: card.issuer,
        name: card.name,
        annualFee: card.annual_fee,
        officialUrl: card.official_url,
        owned: card.owned,
        qualifyingMonthSpend: card.qualifying_month_spend,
        requalificationLoss: card.transition.requalification_loss,
        issuanceWaitCost: card.transition.issuance_wait_cost,
        transitionSourceLabel: card.transition.source.label,
        transitionSourceDate: new Date(`${card.transition.source.as_of_date}T00:00:00Z`),
        rule: {
          create: {
            ruleVersion: rule.rule_version,
            asOfDate: new Date(`${rule.as_of_date}T00:00:00Z`),
            effectiveFrom: new Date(`${rule.effective_from}T00:00:00Z`),
            effectiveTo: new Date(`${rule.effective_to}T00:00:00Z`),
            categories: rule.categories,
            excluded: rule.excluded,
            tiers: {
              create: rule.tiers.map((tier) => ({
                minMonthlySpend: tier.min_monthly_spend,
                rate: tier.rate,
                monthlyCap: tier.monthly_cap,
              })),
            },
            // 출처를 댈 수 없는 항목은 행을 만들지 않는다 (T42)
            unmodeled: {
              create: rule.unmodeled
                .filter((item) => item.source.label && item.bound > 0)
                .map((item) => ({
                  label: item.label,
                  bound: item.bound,
                  sourceLabel: item.source.label,
                  sourceDate: new Date(`${item.source.as_of_date}T00:00:00Z`),
                })),
            },
          },
        },
      },
    })
  }

  // 최근 12개월 거래. 각 달의 카테고리 합이 월평균과 정확히 같아 집계가 무손실이다.
  const rows: {
    fixtureId: string
    merchant: string
    industry: string
    category: string
    amount: number
    paidAt: Date
  }[] = []

  for (const spend of profile.past_spend) {
    const info = MERCHANTS[spend.category] ?? fallbackMerchant(spend.category)
    for (let back = 1; back <= HORIZON_MONTHS; back += 1) {
      const amounts = splitAmount(spend.monthly_amount, SPLIT_PER_MONTH)
      amounts.forEach((amount, index) => {
        const paidAt = new Date(asOf)
        paidAt.setUTCMonth(paidAt.getUTCMonth() - back)
        paidAt.setUTCDate(dayOfMonth(index))
        rows.push({
          fixtureId: profile.fixture_id,
          merchant: info.merchant,
          industry: info.industry,
          category: spend.category,
          amount,
          paidAt,
        })
      })
    }
  }

  await prisma.pastSpend.createMany({ data: rows })
  return rows.length
}

async function main() {
  // 재실행 재현성 — 기존 Fixture를 지우고 같은 값으로 다시 넣는다
  await prisma.confirmedPlan.deleteMany()
  await prisma.calculation.deleteMany()
  await prisma.fixture.deleteMany()

  const a = await seedProfile(changeCase, '변경 조합형')
  const b = await seedProfile(maintainCase, '현재 조합 유지형')
  console.info(`[seed] change_case 거래 ${a}건 · maintain_case 거래 ${b}건 적재 완료`)

  // 마이데이터 CSV — 앱 기본 흐름이 읽는 Fixture. 합성 거래가 아니라 CSV 원본을 넣는다.
  const csv = await seedMydata(prisma)
  console.info(
    `[seed] mydata_csv 카드 ${csv.cards}장 · 월실적 ${csv.performances}건 · 거래 ${csv.transactions}건 ` +
      `(12개월 합계 ${csv.totalSpend.toLocaleString('ko-KR')}원) 적재 완료`,
  )
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error('[seed] 실패 — 성공 결과를 만들지 않고 종료합니다.', error)
    await prisma.$disconnect()
    process.exit(1)
  })
