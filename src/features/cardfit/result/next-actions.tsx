'use client'

import { useEffect, useRef } from 'react'
import { BOUNDARY_COPY } from '@/content/cardfit-copy'
import type { CardProduct, CardStatus, PlanCandidate } from '@/domain/cardfit/types'
import { logEvent } from '@/state/client-events'

/**
 * UI-008 다음에 하면 되는 일 — 기준본 s5의 `#nextActions`.
 *
 * **결과 화면 안에서 펼쳐진다.** 별도 확정 화면으로 넘기지 않는 이유는 `확정`이라는
 * 단계가 신청·해지를 대행하는 것으로 읽히기 때문이다 (`T12`). 사용자는 조합을 고르고,
 * 실제 신청은 카드사에서 한다.
 *
 * 갈 곳이 없어진 `AC-003`의 경계 고지가 여기 있다 — 아웃링크 수와 해지 실행 버튼 수를
 * 함께 세어 보여준다. 세어서 보여주는 이유는 *"해지 버튼이 없다"*는 약속을 화면이
 * 스스로 증명하게 하려는 것이다.
 *
 * **정리 항목에는 버튼을 두지 않는다** (`AC-003`). 신규 발급만 카드사 공식 페이지로
 * 이동시킨다 — 이동은 대행이 아니다 (`T25`).
 */
export function NextActions({
  candidate,
  cards,
}: {
  candidate: PlanCandidate
  cards: CardProduct[]
}) {
  const ref = useRef<HTMLDivElement>(null)

  // 버튼 아래에서 펼쳐지므로 화면 밖에 생긴다. 열렸다는 걸 보여주고 시작한다
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [])

  const entries = candidate.card_ids
    .map((id) => ({ card: cards.find((item) => item.card_id === id), status: candidate.statuses[id] }))
    .filter((row): row is { card: CardProduct; status: CardStatus } => Boolean(row.card && row.status))

  const outlinks = entries.filter(({ status }) => status === '신규').length

  return (
    <div className="next-actions" ref={ref}>
      <h3>{BOUNDARY_COPY.actionsHeading}</h3>

      {entries.map(({ card, status }) => (
        <div key={card.card_id} className="next-action">
          <span className={`state-pill ${STATE_CLASS[status]}`}>{status}</span>
          <div>
            <b>{card.name}</b>
            <small>{BOUNDARY_COPY.nextAction[status]}</small>
          </div>
          {status === '신규' ? (
            <a
              className="next-link"
              href={card.official_url}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => logEvent('아웃링크클릭', { card_id: card.card_id })}
            >
              {BOUNDARY_COPY.outlinkCta}
            </a>
          ) : null}
        </div>
      ))}

      <p className="tiny-note">{BOUNDARY_COPY.boundary(outlinks)}</p>
    </div>
  )
}

const STATE_CLASS: Record<CardStatus, string> = {
  신규: 'new',
  유지: 'keep',
  정리: 'organize',
}
