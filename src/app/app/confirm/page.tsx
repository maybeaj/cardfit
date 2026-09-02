'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BOUNDARY_COPY, EVIDENCE_COPY, STATUS_COPY } from '@/content/copy'
import { won } from '@/domain/format'
import type { CardStatus } from '@/domain/types'
import {
  CtaBar,
  Notice,
  Panel,
  PrimaryLink,
  ScreenHeader,
  SecondaryLink,
  StatusChip,
} from '@/components/shell'
import { logEvent } from '@/state/events'
import { useDemo } from '@/state/store'

/**
 * UI-008 확정 + 경계 — 근거 화면에서만 진입한다 (T25).
 * 신규 발급 1장만 아웃링크, 정리 항목에는 버튼을 두지 않고 안내 문구만 둔다 (AC-003 · AC-008).
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
    <>
      <ScreenHeader
        step="확정 및 실행 경계"
        title={BOUNDARY_COPY.title}
        lead={BOUNDARY_COPY.lead}
        backHref="/app/evidence"
      />
      <div className="scroll-area flex flex-col gap-3">
        {/* 확정 요약 — 결론과 같은 의미색을 쓴다 (기준본 s7의 `.result`) */}
        <Panel tone={calculation.decision === '변경' ? 'pass' : 'hold'}>
          <p className="m-0 text-[15px] font-extrabold text-ink">
            {calculation.decision === '변경' ? '추천 조합' : '현재 카드 조합 유지'}
          </p>
          <p className="mt-1 mb-0 text-[14px] font-extrabold text-ink">
            {shownCandidate.card_ids
              .map((id: string) => profile.cards.find((card) => card.card_id === id)?.name ?? id)
              .join(' + ')}
          </p>
          <p className="mt-2 mb-0 text-[12px] text-subtle tabular-nums">
            순혜택 {won(confirmed?.net_benefit ?? shownCandidate.net_benefit)} · 기준일{' '}
            {confirmed?.as_of_date ?? calculation.as_of_date}
            {confirmed
              ? ` · 확정 ${new Date(confirmed.confirmed_at).toLocaleString('ko-KR')}`
              : null}
          </p>
          <p className="mt-2 mb-0 text-[11.5px] leading-relaxed text-subtle">{BOUNDARY_COPY.frozen}</p>
        </Panel>

        <Panel>
          <p className="m-0 text-[12.5px] font-bold text-subtle">{BOUNDARY_COPY.actionsHeading}</p>
          <ul className="mt-3 mb-0 list-none space-y-2 p-0">
            {entries.map(([cardId, status], index) => {
              const card = profile.cards.find((item) => item.card_id === cardId)
              if (!card) return null
              return (
                <li key={cardId} className="rounded-xl bg-bg px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="block text-[11px] text-subtle">
                        {index + 1} · {card.issuer}
                      </span>
                      <span className="block text-[14.5px] font-bold text-ink">{card.name}</span>
                    </div>
                    <StatusChip status={status} />
                  </div>
                  <p className="mt-2 mb-0 text-[12px] leading-relaxed text-subtle">
                    {status === '신규' ? BOUNDARY_COPY.newCardRisk : null}
                    {status === '정리' ? BOUNDARY_COPY.removeRisk : null}
                    {status === '유지' ? BOUNDARY_COPY.keepNote : null}
                  </p>
                  {status === '신규' ? (
                    <a
                      href={card.official_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      onClick={() => logEvent('아웃링크클릭', { card_id: cardId })}
                      className="mt-3 block rounded-[var(--radius-button)] bg-primary px-4 py-3 text-center text-[14px] font-bold text-white"
                    >
                      {BOUNDARY_COPY.outlinkCta} ↗
                    </a>
                  ) : (
                    <p className="mt-2 mb-0 text-[11.5px] font-semibold text-subtle">
                      {STATUS_COPY[status].note}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="mt-3 mb-0 text-[11.5px] text-subtle">
            아웃링크 {newCards.length}개 · 해지 실행 버튼 0개
          </p>
        </Panel>

        {/* 기준본 s7의 `.notice` — 실행 경계는 앰버로 알린다 */}
        <Panel tone="hold">
          <p className="m-0 text-[15px] font-extrabold text-warning">{BOUNDARY_COPY.headline}</p>
          <p className="mt-2 mb-0 text-[13px] leading-relaxed text-ink">{BOUNDARY_COPY.direct}</p>
          <p className="mt-2 mb-0 text-[12px] leading-relaxed text-subtle">
            {BOUNDARY_COPY.outlinkNote}
          </p>
        </Panel>

        <Notice>{EVIDENCE_COPY.disclaimer}</Notice>
        <p className="m-0 text-[10px] leading-[1.45] text-subtle">{BOUNDARY_COPY.footer}</p>
      </div>
      <CtaBar>
        <div className="flex flex-col gap-2">
          <PrimaryLink href="/">{BOUNDARY_COPY.confirmCta}</PrimaryLink>
          <SecondaryLink href="/app/result">{BOUNDARY_COPY.reviewAgainCta}</SecondaryLink>
        </div>
      </CtaBar>
    </>
  )
}
