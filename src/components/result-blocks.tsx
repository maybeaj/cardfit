import { CONCLUSION_COPY, DATA_NOTICE, STATUS_COPY } from '@/content/copy'
import { manwon, won } from '@/domain/format'
import type { Calculation, CardProduct, PlanCandidate } from '@/domain/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Panel, SampleBadge, StatusChip } from './shell'

/** UI-005 결론 배너 — 좁게. 다크 영역은 이 배너 하나뿐이다 (T2 · T13). */
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
    <Panel tone="banner">
      <p className="m-0 text-[19px] leading-[1.4] font-extrabold tracking-tight">{body}</p>
      <p className="mt-2 mb-0 text-[11.5px] leading-relaxed text-[#9FB4DD]">{caption}</p>
      {decision === '유지' && hold_reason === '제약과다' ? (
        <p className="mt-3 mb-0 rounded-lg bg-white/10 px-3 py-2 text-[12px] font-semibold">
          {CONCLUSION_COPY.relaxHint}
        </p>
      ) : null}
    </Panel>
  )
}

/** 카드별 역할 — 신규·유지·정리 중 정확히 하나 (AC-005). 카드 순위 목록을 만들지 않는다. */
export function CombinationList({
  calculation,
  cards,
}: {
  calculation: Calculation
  cards: CardProduct[]
}) {
  const statuses = calculation.decision === '변경' ? calculation.chosen.statuses : calculation.current.statuses
  const entries = Object.entries(statuses).sort(([a], [b]) => a.localeCompare(b))

  return (
    <Panel>
      <h2 className="m-0 text-[15px] font-extrabold text-ink">카드별 역할</h2>
      <ul className="mt-3 mb-0 list-none space-y-2 p-0">
        {entries.map(([cardId, status]) => {
          const card = cards.find((item) => item.card_id === cardId)
          if (!card) return null
          return (
            <li
              key={cardId}
              className="flex items-start justify-between gap-2 rounded-xl bg-bg px-3 py-2.5"
            >
              <div>
                <p className="m-0 text-[11.5px] text-muted">{card.issuer}</p>
                <p className="mt-0.5 mb-0 text-[14.5px] font-bold text-ink">{card.name}</p>
                <p className="mt-1 mb-0 text-[11.5px] text-muted">{STATUS_COPY[status].note}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusChip status={status} />
                <SampleBadge label={DATA_NOTICE.sampleBadge} />
              </div>
            </li>
          )
        })}
      </ul>
      <p className="mt-3 mb-0 text-[11.5px] text-muted">{CONCLUSION_COPY.boundedOptimum}</p>
    </Panel>
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
    <Panel>
      <h2 className="m-0 text-[15px] font-extrabold text-ink">이렇게 나눠 쓰세요</h2>
      <p className="mt-1 mb-0 text-[11.5px] text-muted">
        앞으로 12개월 합계 기준 · 총 {manwon(total)}
      </p>
      <Table className="mt-3">
        <TableHeader>
          <TableRow className="border-line">
            <TableHead className="h-auto pb-2 text-[11.5px] font-semibold text-muted">카드</TableHead>
            <TableHead className="h-auto pb-2 text-right text-[11.5px] font-semibold text-muted">
              결제 금액
            </TableHead>
            <TableHead className="h-auto pb-2 text-right text-[11.5px] font-semibold text-muted">
              혜택
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...byCard.entries()]
            .sort((a, b) => b[1].amount - a[1].amount)
            .map(([cardId, entry]) => {
              const card = cards.find((item) => item.card_id === cardId)
              return (
                <TableRow key={cardId} className="border-line align-top">
                  <TableCell className="py-2.5 whitespace-normal">
                    <span className="block text-[13.5px] font-bold text-ink">
                      {card?.name ?? cardId}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {entry.categories.join(' · ')}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 text-right text-[13.5px] font-bold text-ink tabular-nums">
                    {manwon(entry.amount)}
                  </TableCell>
                  <TableCell className="py-2.5 text-right text-[13.5px] font-bold text-positive tabular-nums">
                    {won(entry.benefit)}
                  </TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </Panel>
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
    <Panel>
      <h2 className="m-0 text-[15px] font-extrabold text-ink">{CONCLUSION_COPY.reviewedTitle}</h2>
      <ul className="mt-3 mb-0 list-none space-y-2 p-0">
        {reviewed.map((candidate) => (
          <li key={candidate.candidate_id} className="rounded-xl bg-bg px-3 py-2.5">
            <p className="m-0 text-[13.5px] font-bold text-ink">
              {candidate.card_ids
                .map((id) => cards.find((card) => card.card_id === id)?.name ?? id)
                .join(' + ')}
            </p>
            <dl className="mt-2 mb-0 grid grid-cols-3 gap-1">
              <div>
                <dt className="m-0 text-[10.5px] text-muted">추가 혜택</dt>
                <dd className="m-0 text-[12.5px] font-bold text-ink tabular-nums">
                  {won(candidate.gross_benefit)}
                </dd>
              </div>
              <div>
                <dt className="m-0 text-[10.5px] text-muted">전환비용</dt>
                <dd className="m-0 text-[12.5px] font-bold text-ink tabular-nums">
                  −{won(candidate.switching_cost.total)}
                </dd>
              </div>
              <div>
                <dt className="m-0 text-[10.5px] text-muted">순손익</dt>
                <dd
                  className={`m-0 text-[12.5px] font-bold tabular-nums ${
                    candidate.net_benefit >= 0 ? 'text-positive' : 'text-warning'
                  }`}
                >
                  {won(candidate.net_benefit)}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
