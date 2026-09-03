'use client'

import { ALLOCATION_COPY, PLAN_NOTICE } from '@/content/cardfit-copy'
import { won } from '@/domain/cardfit/format'
import type { CardProduct, FutureSpendPlan, PlanCandidate } from '@/domain/cardfit/types'
import { CARD_ART } from '@/fixtures/mydata/rules'

/**
 * UI-006 결제 배분 — 기준본 s5의 `#allocation`.
 *
 * **결과 화면의 본문이다** (`T2`). 사용자가 결정할 것은 "어느 카드를 쓰냐"가 아니라
 * "어디에 어느 카드로 결제하냐"이고, 그 답이 여기 있다.
 *
 * 행마다 **담당 사유**를 적는다 — `주 혜택 업종`인지 `월 한도 분산`인지. 적지 않으면
 * 사용자가 배분을 검증할 수 없고 결과를 믿을 근거가 사라진다.
 *
 * 배분 합계를 함께 보인다. 확인한 계획 총액과 오차 0이어야 하고(`NFR-001`), 어긋나면
 * 화면이 그 사실을 스스로 드러낸다.
 */
export function PaymentAllocation({
  candidate,
  cards,
  plan,
}: {
  candidate: PlanCandidate
  cards: CardProduct[]
  /** 카테고리별 지출 기간을 되읽기 위해 받는다 */
  plan: FutureSpendPlan[]
}) {
  const total = candidate.allocations.reduce((sum, row) => sum + row.amount, 0)
  const planTotal = plan.reduce((sum, item) => sum + item.amount, 0)

  /** 같은 카테고리에 여러 항목이 있으면 가장 긴 기간을 적는다 — 짧게 적으면 과장이 된다 */
  const spanOf = (category: string) => {
    const months = plan
      .filter((item) => item.category === category)
      .map((item) => item.spending_months)
    if (months.length === 0) return null
    const span = Math.max(...months)
    return span === 1 ? PLAN_NOTICE.once : PLAN_NOTICE.months(span)
  }

  return (
    <div className="allocation">
      {candidate.allocations.map((row) => {
        const card = cards.find((item) => item.card_id === row.card_id)
        const span = spanOf(row.category)
        return (
          <div key={`${row.category}:${row.card_id}`} className="allocation-row">
            <div className="allocation-what">
              <b>{row.category}</b>
              {span ? <small>{span}</small> : null}
            </div>
            <strong className="allocation-amount tabular-nums">{won(row.amount)}</strong>
            <div className="allocation-card">
              {/* 빈 `src`는 현재 페이지를 다시 요청한다. 아트가 없으면 색 블록으로 둔다 */}
              {card && CARD_ART[card.card_id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={CARD_ART[card.card_id]} alt="" />
              ) : (
                <span className="art tone-1" aria-hidden />
              )}
              <span>
                <b>{card?.name ?? row.card_id}</b>
                <small>{row.reason}</small>
              </span>
            </div>
          </div>
        )
      })}

      <div className="allocation-total">
        <b>{ALLOCATION_COPY.totalLabel}</b>
        <span>
          <strong className="tabular-nums">{won(total)}</strong>
          <small>
            {total === planTotal ? ALLOCATION_COPY.totalMatch : ALLOCATION_COPY.totalMismatch}
          </small>
        </span>
      </div>
    </div>
  )
}
