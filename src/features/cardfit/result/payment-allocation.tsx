'use client'

import { manwon, won } from '@/domain/format'
import type { CardProduct, PlanCandidate } from '@/domain/types'

/** UI-006 결제 배분표 — 결과 화면의 본문. 유지 결론에서도 비우지 않는다 (T21). */
export function PaymentAllocation({
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
