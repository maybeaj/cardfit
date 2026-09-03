import type { CardProduct, CardStatus, SwitchingCost } from './types'

/** 전환비용과 카드별 상태 — 조합을 바꿀 때 드는 값과 카드마다 붙는 `신규·유지·정리` */
export function switchingCostFor(
  cardIds: string[],
  ownedIds: string[],
  cards: Map<string, CardProduct>,
): SwitchingCost {
  const inCombo = new Set(cardIds)
  let annual_fee = 0
  let issuance_wait_cost = 0
  let requalification_loss = 0

  for (const id of cardIds) {
    const card = cards.get(id)
    if (!card || card.owned) continue
    // 연회비는 12개월 창 안에서 안분하지 않는다 (T40)
    annual_fee += card.annual_fee
    issuance_wait_cost += card.transition.issuance_wait_cost
  }
  for (const id of ownedIds) {
    if (inCombo.has(id)) continue
    requalification_loss += cards.get(id)?.transition.requalification_loss ?? 0
  }
  return {
    annual_fee,
    requalification_loss,
    issuance_wait_cost,
    total: annual_fee + requalification_loss + issuance_wait_cost,
  }
}

export function statusesFor(cardIds: string[], ownedIds: string[], cards: Map<string, CardProduct>) {
  const inCombo = new Set(cardIds)
  const statuses: Record<string, CardStatus> = {}
  for (const id of cardIds) {
    statuses[id] = cards.get(id)?.owned ? '유지' : '신규'
  }
  for (const id of ownedIds) {
    if (!inCombo.has(id)) statuses[id] = '정리'
  }
  return statuses
}
