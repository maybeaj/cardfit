'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BOUNDARY_COPY, EVIDENCE_COPY, STATUS_COPY } from '@/content/copy'
import { won } from '@/domain/format'
import type { CardStatus } from '@/domain/types'
import {
  Actions,
  GhostLink,
  Notice,
  PrimaryLink,
  Screen,
  ScreenHeader,
} from '@/components/shell'
import { logEvent } from '@/state/events'
import { useDemo } from '@/state/store'

/**
 * UI-008 확정 + 경계 — 기준본 s7. 근거 화면에서만 진입한다 (`T25`).
 * 신규 발급 1장만 아웃링크, 정리 항목에는 버튼을 두지 않고 안내 문구만 둔다 (`AC-003` · `AC-008`).
 */
export default function ConfirmScreen() {
  const router = useRouter()
  const { calculation, confirmed, profile } = useDemo()

  useEffect(() => {
    if (!calculation) router.replace('/app/result')
  }, [calculation, router])

  if (!calculation) return null

  const statuses =
    calculation.decision === '변경' ? calculation.chosen.statuses : calculation.current.statuses
  const entries = Object.entries(statuses).sort(([a], [b]) => a.localeCompare(b)) as [
    string,
    CardStatus,
  ][]
  const newCards = entries.filter(([, status]) => status === '신규')
  const shownCandidate = calculation.decision === '변경' ? calculation.chosen : calculation.current

  return (
    <Screen>
      <ScreenHeader
        title={BOUNDARY_COPY.title}
        lead={BOUNDARY_COPY.lead}
        backHref="/app/evidence"
      />

      {/* 확정 요약 — 결론과 같은 의미색을 쓴다 (기준본 s7의 `.result`) */}
      <div className={calculation.decision === '변경' ? 'result' : 'result hold'}>
        <b>{calculation.decision === '변경' ? '추천 조합' : '현재 카드 조합 유지'}</b>
        <p>
          {shownCandidate.card_ids
            .map((id: string) => profile.cards.find((card) => card.card_id === id)?.name ?? id)
            .join(' + ')}
        </p>
        <small>
          확정 기준: 순혜택 {won(confirmed?.net_benefit ?? shownCandidate.net_benefit)} ·{' '}
          {confirmed?.as_of_date ?? calculation.as_of_date} ·{' '}
          {Object.values(calculation.rule_versions)[0] ?? ''}
          {confirmed
            ? ` · 확정 ${new Date(confirmed.confirmed_at).toLocaleString('ko-KR')}`
            : null}
        </small>
      </div>

      <h3>{BOUNDARY_COPY.actionsHeading}</h3>
      <div>
        {entries.map(([cardId, status]) => {
          const card = profile.cards.find((item) => item.card_id === cardId)
          if (!card) return null
          return (
            <div key={cardId} className="action">
              <div>
                <b>
                  {card.name} {status}
                </b>
                <small>
                  {status === '신규' ? BOUNDARY_COPY.newCardRisk : null}
                  {status === '정리' ? BOUNDARY_COPY.removeRisk : null}
                  {status === '유지' ? STATUS_COPY[status].note : null}
                </small>
              </div>
              {status === '신규' ? (
                <a
                  href={card.official_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="secondary"
                  onClick={() => logEvent('아웃링크클릭', { card_id: cardId })}
                >
                  {BOUNDARY_COPY.outlinkCta}
                </a>
              ) : (
                <span className="tag">
                  {status === '정리' ? BOUNDARY_COPY.noActionTag : BOUNDARY_COPY.keepTag}
                </span>
              )}
            </div>
          )
        })}
      </div>
      <p className="footer">아웃링크 {newCards.length}개 · 해지 실행 버튼 0개</p>

      <Notice>
        <b>{BOUNDARY_COPY.headline}</b>
        <br />
        {BOUNDARY_COPY.direct} {BOUNDARY_COPY.outlinkNote}
      </Notice>

      <p className="footer">
        {EVIDENCE_COPY.disclaimer}
        <br />
        {BOUNDARY_COPY.footer}
      </p>

      <Actions>
        <PrimaryLink href="/">{BOUNDARY_COPY.confirmCta}</PrimaryLink>
        <GhostLink href="/app/result">{BOUNDARY_COPY.reviewAgainCta}</GhostLink>
      </Actions>
    </Screen>
  )
}
