'use client'

import { CONCLUSION_COPY } from '@/content/copy'
import { won } from '@/domain/format'
import type { CardProduct, PlanCandidate } from '@/domain/types'

/** T21 — 게이팅 미통과 후보를 손익과 함께 노출한다. 추가 계산 없이 값을 반대 방향으로 보여준다. */
export function ReviewedAlternatives({
  reviewed,
  cards,
}: {
  reviewed: PlanCandidate[]
  cards: CardProduct[]
}) {
  if (reviewed.length === 0) return null
  return (
    <>
      <h3>{CONCLUSION_COPY.reviewedTitle}</h3>
      <div className="grid">
        {reviewed.map((candidate) => (
          <div key={candidate.candidate_id} className="metric">
            <b className="text-[11px]">
              {candidate.card_ids
                .map((id) => cards.find((card) => card.card_id === id)?.name ?? id)
                .join(' + ')}
            </b>
            <dl className="mt-2 mb-0 grid grid-cols-3 gap-1">
              <div>
                <dt className="m-0 text-[9px] text-[var(--color-subtle)]">추가 혜택</dt>
                <dd className="m-0 text-[11px] font-bold text-[var(--color-ink)] tabular-nums">
                  {won(candidate.gross_benefit)}
                </dd>
              </div>
              <div>
                <dt className="m-0 text-[9px] text-[var(--color-subtle)]">전환비용</dt>
                <dd className="m-0 text-[11px] font-bold text-[var(--color-ink)] tabular-nums">
                  −{won(candidate.switching_cost.total)}
                </dd>
              </div>
              <div>
                <dt className="m-0 text-[9px] text-[var(--color-subtle)]">순손익</dt>
                <dd
                  className={`m-0 text-[11px] font-bold tabular-nums ${
                    candidate.net_benefit >= 0
                      ? 'text-[var(--color-positive)]'
                      : 'text-[var(--color-warning)]'
                  }`}
                >
                  {won(candidate.net_benefit)}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </>
  )
}
