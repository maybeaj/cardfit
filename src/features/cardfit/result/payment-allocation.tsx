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
 * **확인한 계획 항목만 담는다.** 12개월 전체 배분을 띄우면 입력한 적 없는 카테고리가
 * 줄줄이 나와 사용자가 자기 입력을 못 찾는다 — 실제로 과거 소비 13개 카테고리가 함께
 * 나오고 있었다. 전체 배분은 카드별 연간 혜택을 구하는 데 쓰고 화면에는 내지 않는다.
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
  /** 합계가 확인한 계획과 맞는지 대조하려고 받는다 */
  plan: FutureSpendPlan[]
}) {
  const rows = candidate.plan_allocations
  const total = rows.reduce((sum, row) => sum + row.amount, 0)
  const planTotal = plan.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="allocation">
      {rows.map((row) => {
        const card = cards.find((item) => item.card_id === row.card_id)
        const span =
          row.spending_months === 1 ? PLAN_NOTICE.once : PLAN_NOTICE.months(row.spending_months)
        return (
          <div key={row.plan_id} className="allocation-row">
            <div className="allocation-what">
              <b>{row.category}</b>
              <small>{span}</small>
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
