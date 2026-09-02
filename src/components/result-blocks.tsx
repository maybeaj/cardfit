import { CONCLUSION_COPY, STATUS_COPY } from '@/content/copy'
import { manwon, won } from '@/domain/format'
import type { Calculation, CardProduct, PlanCandidate } from '@/domain/types'
import { CARD_ART } from '@/fixtures/mydata/rules'

/**
 * UI-005 결론 배너 — 좁게. 본문은 배분표가 차지한다 (`T2`).
 * 색은 기준본의 `.result`(민트) / `.result.hold`(앰버)를 따른다 (`D-011`).
 */
export function ConclusionBanner({ calculation }: { calculation: Calculation }) {
  const { decision, chosen, reviewed, current_card_count, hold_reason } = calculation
  const best = reviewed[0]

  let body: string
  if (decision === '변경') {
    body = CONCLUSION_COPY.change.body(won(chosen.net_benefit))
  } else if (best && best.net_benefit < 0) {
    body = CONCLUSION_COPY.hold.body(won(Math.abs(best.net_benefit)))
  } else {
    body = CONCLUSION_COPY.hold.bodyBelowThreshold(won(best?.net_benefit ?? 0))
  }

  const caption =
    decision === '변경'
      ? CONCLUSION_COPY.change.caption(current_card_count)
      : CONCLUSION_COPY.hold.caption()

  return (
    <div className={decision === '변경' ? 'result' : 'result hold'}>
      <div className="status">
        {decision === '변경' ? CONCLUSION_COPY.passStatus : CONCLUSION_COPY.holdStatus}
      </div>
      <div className="big">{body}</div>
      <small>{caption}</small>
      {decision === '유지' && hold_reason === '제약과다' ? (
        <p className="mt-2.5 mb-0 rounded-lg bg-white/70 px-2.5 py-2 text-[11px] font-semibold">
          {CONCLUSION_COPY.relaxHint}
        </p>
      ) : null}
    </div>
  )
}

/** 카드별 상태 — 신규·유지·정리 중 정확히 하나 (AC-005). 카드 순위 목록을 만들지 않는다. */
export function CombinationList({
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

/** UI-006 결제 배분표 — 결과 화면의 본문. 유지 결론에서도 비우지 않는다 (T21). */
export function AllocationTable({
  candidate,
  cards,
}: {
  candidate: PlanCandidate
  cards: CardProduct[]
}) {
  const total = candidate.allocations.reduce((sum, row) => sum + row.amount, 0)
  const byCard = new Map<string, { amount: number; benefit: number; categories: string[] }>()
  for (const row of candidate.allocations) {
    const entry = byCard.get(row.card_id) ?? { amount: 0, benefit: 0, categories: [] }
    entry.amount += row.amount
    entry.benefit += row.benefit
    entry.categories.push(row.category)
    byCard.set(row.card_id, entry)
  }

  return (
    <>
      <h3>이렇게 나눠 쓰세요</h3>
      <p className="sub">앞으로 12개월 합계 기준 · 총 {manwon(total)}</p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-[var(--color-line)] text-left">
              <th className="pb-2 font-semibold text-[var(--color-subtle)]">카드</th>
              <th className="pb-2 text-right font-semibold text-[var(--color-subtle)]">결제 금액</th>
              <th className="pb-2 text-right font-semibold text-[var(--color-subtle)]">혜택</th>
            </tr>
          </thead>
          <tbody>
            {[...byCard.entries()]
              .sort((a, b) => b[1].amount - a[1].amount)
              .map(([cardId, entry]) => {
                const card = cards.find((item) => item.card_id === cardId)
                return (
                  <tr key={cardId} className="border-b border-[var(--color-line)] align-top">
                    <td className="py-2">
                      <span className="block font-bold text-[var(--color-ink)]">
                        {card?.name ?? cardId}
                      </span>
                      <span className="block text-[9px] text-[var(--color-subtle)]">
                        {entry.categories.join(' · ')}
                      </span>
                    </td>
                    <td className="py-2 text-right font-bold text-[var(--color-ink)] tabular-nums">
                      {manwon(entry.amount)}
                    </td>
                    <td className="py-2 text-right font-bold text-[var(--color-positive)] tabular-nums">
                      {won(entry.benefit)}
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </>
  )
}

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
