'use client'

import { CARD_ROLE_COPY } from '@/content/cardfit-copy'
import { won } from '@/domain/cardfit/format'
import type { Calculation, CardProduct, CardStatus } from '@/domain/cardfit/types'
import { CARD_ART } from '@/fixtures/mydata/rules'

/**
 * UI-005 카드별 역할 — 기준본 s5의 `#statuses`.
 *
 * 카드마다 `신규·유지·정리` 중 정확히 하나를 붙인다 (`AC-005`). 카드 순위 목록을
 * 만들지 않는다 — 결과 화면의 주인공은 배분표다 (`T2`).
 *
 * `정리` 카드는 금액의 뜻이 다르다. 앞으로 결제가 없으므로 `예상 연간 혜택`이 아니라
 * **지금까지 받던 혜택**이고, 두 값을 같은 말로 쓰면 정리하면 계속 받는 것처럼 읽힌다.
 */
const STATE_CLASS: Record<CardStatus, string> = { 신규: 'new', 유지: 'keep', 정리: 'organize' }

export function CardRoleList({
  calculation,
  cards,
}: {
  calculation: Calculation
  cards: CardProduct[]
}) {
  const shown = calculation.decision === '변경' ? calculation.chosen : calculation.current
  const entries = Object.entries(shown.statuses).sort(([a], [b]) => a.localeCompare(b)) as [
    string,
    CardStatus,
  ][]

  return (
    <div className="result-card-list">
      {entries.map(([cardId, status], index) => {
        const card = cards.find((item) => item.card_id === cardId)
        if (!card) return null
        const art = CARD_ART[cardId]
        /*
         * `이 카드로 결제`는 **확인한 계획 중** 이 카드가 맡은 몫이다. 12개월 전체
         * 배분을 쓰면 사용자가 입력한 적 없는 금액까지 더해져 배분표와 어긋난다.
         * 반면 연간 혜택은 전체 배분에서 나온다 — 과거 소비도 혜택을 만든다.
         */
        const paid = shown.plan_allocations
          .filter((row) => row.card_id === cardId)
          .reduce((sum, row) => sum + row.amount, 0)
        const benefit = shown.allocations
          .filter((row) => row.card_id === cardId)
          .reduce((sum, row) => sum + row.benefit, 0)
        const organized = status === '정리'
        const stateClass = STATE_CLASS[status]

        return (
          <div key={cardId} className={`result-card status-${stateClass}`}>
            {art ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={art} alt={card.name} width={64} height={40} />
            ) : (
              <span className={`art tone-${(index % 3) + 1}`} aria-hidden />
            )}
            <div className="result-card-copy">
              <b>{card.name}</b>
              <small>
                {organized ? CARD_ROLE_COPY.noFuturePayment : CARD_ROLE_COPY.paid(won(paid))}
              </small>
              <strong className={organized ? 'is-past' : ''}>
                {organized
                  ? CARD_ROLE_COPY.past(won(benefit))
                  : CARD_ROLE_COPY.expected(won(benefit))}
              </strong>
              {status === '신규' ? (
                <a
                  className="issuer-link"
                  href={card.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {CARD_ROLE_COPY.issuerLink}
                </a>
              ) : null}
            </div>
            <span className={`state-pill ${stateClass}`}>{status}</span>
          </div>
        )
      })}
    </div>
  )
}
