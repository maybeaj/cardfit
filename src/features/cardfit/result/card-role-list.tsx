'use client'

import { CONCLUSION_COPY, STATUS_COPY } from '@/content/copy'
import { won } from '@/domain/format'
import type { Calculation, CardProduct } from '@/domain/types'
import { CARD_ART } from '@/fixtures/mydata/rules'

/** 카드별 상태 — 신규·유지·정리 중 정확히 하나 (AC-005). 카드 순위 목록을 만들지 않는다. */
export function CardRoleList({
  calculation,
  cards,
}: {
  calculation: Calculation
  cards: CardProduct[]
}) {
  const statuses =
    calculation.decision === '변경' ? calculation.chosen.statuses : calculation.current.statuses
  const shown = calculation.decision === '변경' ? calculation.chosen : calculation.current
  const entries = Object.entries(statuses).sort(([a], [b]) => a.localeCompare(b))

  return (
    <>
      <h3>{CONCLUSION_COPY.cardStatusHeading}</h3>
      <div className="grid">
        {entries.map(([cardId, status], index) => {
          const card = cards.find((item) => item.card_id === cardId)
          if (!card) return null
          const art = CARD_ART[cardId]
          const annualBenefit = shown.allocations
            .filter((allocation) => allocation.card_id === cardId)
            .reduce((sum, allocation) => sum + allocation.benefit, 0)
          const stateClass = status === '신규' ? 'new' : status === '유지' ? 'keep' : 'organize'
          return (
            <div key={cardId} className={`result-card status-${stateClass}`}>
              {art ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="card-art" src={art} alt="" width={64} height={40} />
              ) : (
                <span className={`art tone-${(index % 3) + 1}`} aria-hidden />
              )}
              <div className="result-card-copy">
                <b>{card.name}</b>
                <small>예상 연간 혜택 · {STATUS_COPY[status].note}</small>
                <strong className="tabular-nums">{won(annualBenefit)}</strong>
                {status === '신규' ? (
                  <a
                    className="issuer-link"
                    href={card.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    카드사 페이지 ›
                  </a>
                ) : null}
              </div>
              <span className={`state-pill ${stateClass}`}>{status}</span>
            </div>
          )
        })}
      </div>
      <p className="footer">{CONCLUSION_COPY.boundedOptimum}</p>
    </>
  )
}
