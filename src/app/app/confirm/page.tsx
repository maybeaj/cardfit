'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BOUNDARY_COPY, EVIDENCE_COPY, STATUS_COPY } from '@/content/copy'
import { won } from '@/domain/format'
import type { CardStatus } from '@/domain/types'
import { CtaBar, Notice, Panel, SecondaryLink, StatusChip, ScreenHeader } from '@/components/shell'
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
        step="조합 확정"
        title={
          calculation.decision === '변경' ? '이 조합을 적용하려면' : '현재 조합을 그대로 확정했어요'
        }
        lead={confirmed ? `확정 시각 ${new Date(confirmed.confirmed_at).toLocaleString('ko-KR')}` : '확정 중…'}
        backHref="/app/evidence"
      />
      <div className="scroll-area flex flex-col gap-3">
        <Panel>
          <p className="m-0 text-[12.5px] font-bold text-muted">확정한 조합</p>
          <p className="mt-1 mb-0 text-[15px] font-extrabold text-ink">
            {shownCandidate.card_ids
              .map((id: string) => profile.cards.find((card) => card.card_id === id)?.name ?? id)
              .join(' + ')}
          </p>
          <p className="mt-2 mb-0 text-[12px] text-muted tabular-nums">
            순혜택 {won(confirmed?.net_benefit ?? shownCandidate.net_benefit)} · 기준일{' '}
            {confirmed?.as_of_date ?? calculation.as_of_date}
          </p>
          <p className="mt-2 mb-0 text-[11.5px] leading-relaxed text-muted">{BOUNDARY_COPY.frozen}</p>
        </Panel>

        <Panel>
          <p className="m-0 text-[12.5px] font-bold text-muted">카드별 다음 행동</p>
          <ul className="mt-3 mb-0 list-none space-y-2 p-0">
            {entries.map(([cardId, status], index) => {
              const card = profile.cards.find((item) => item.card_id === cardId)
              if (!card) return null
              return (
                <li key={cardId} className="rounded-xl bg-bg px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="block text-[11px] text-muted">
                        {index + 1} · {card.issuer}
                      </span>
                      <span className="block text-[14.5px] font-bold text-ink">{card.name}</span>
                    </div>
                    <StatusChip status={status} />
                  </div>
                  <p className="mt-2 mb-0 text-[12px] leading-relaxed text-muted">
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
                      {card.issuer} 공식 신청 페이지로 이동 ↗
                    </a>
                  ) : (
                    <p className="mt-2 mb-0 text-[11.5px] font-semibold text-muted">
                      {STATUS_COPY[status].note}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="mt-3 mb-0 text-[11.5px] text-muted">
            아웃링크 {newCards.length}개 · 해지 실행 버튼 0개
          </p>
        </Panel>

        <Panel tone="banner">
          <p className="m-0 text-[15px] font-extrabold">{BOUNDARY_COPY.headline}</p>
          <p className="mt-2 mb-0 text-[13px] leading-relaxed text-[#C9D6F2]">
            {BOUNDARY_COPY.direct}
          </p>
          <p className="mt-2 mb-0 text-[12px] leading-relaxed text-[#9FB4DD]">
            {BOUNDARY_COPY.outlinkNote}
          </p>
        </Panel>

        <Notice>{EVIDENCE_COPY.disclaimer}</Notice>
        <Link href="/app/plan" className="text-center text-[13px] font-semibold text-primary">
          계획을 수정하고 다시 계산하기
        </Link>
      </div>
      <CtaBar>
        <SecondaryLink href="/">랜딩으로 돌아가기</SecondaryLink>
      </CtaBar>
    </>
  )
}
