'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DATA_NOTICE, EVIDENCE_COPY } from '@/content/copy'
import { percent, won } from '@/domain/format'
import {
  Actions,
  GhostLink,
  Note,
  Notice,
  PrimaryButton,
  Screen,
  ScreenHeader,
} from '@/components/shell'
import { logEvent } from '@/state/events'
import { useDemo } from '@/state/store'

/**
 * UI-007 근거 — 기준본 s6. 결론 화면에서만 진입한다. 6항목 + 미반영 항목.
 * 전문 용어를 바꾸지 않고 괄호 한 줄 풀이만 붙인다 (`T44`).
 */
export default function EvidenceScreen() {
  const router = useRouter()
  const { calculation, error, confirmCombination, pending } = useDemo()

  useEffect(() => {
    if (error) {
      router.replace('/app/result')
      return
    }
    if (!calculation) router.replace('/app/plan')
  }, [calculation, error, router])

  useEffect(() => {
    if (calculation) logEvent('근거열람', { cards: calculation.evidence.length })
  }, [calculation])

  if (!calculation) return null

  const shown = calculation.decision === '변경' ? calculation.chosen : calculation.current

  const apply = () => {
    confirmCombination()
    logEvent('조합확정', { candidate_id: shown.candidate_id, decision: calculation.decision })
    router.push('/app/confirm')
  }

  return (
    <Screen>
      <ScreenHeader
        step="07 · 근거 검증"
        title={EVIDENCE_COPY.title}
        lead={EVIDENCE_COPY.lead}
        backHref="/app/result"
      />

      {calculation.stale_as_of_warning ? <Notice>{EVIDENCE_COPY.staleAsOf}</Notice> : null}

      {calculation.evidence.map((row) => (
        <div key={row.card_id} className="mt-3">
          <h3>
            {row.issuer} {row.name}
          </h3>
          <div className="grid">
            <div className="evidence ok">
              <div>
                <b>실적구간</b>
                <small>전월 사용액 단계에 따라 적립·할인율이 달라집니다</small>
              </div>
              <em>
                {row.applied_tier
                  ? `${won(row.applied_tier.min_monthly_spend)}↑ · ${percent(row.applied_tier.rate)}`
                  : '—'}
              </em>
            </div>
            <div className="evidence ok">
              <div>
                <b>혜택한도</b>
                <small>월 최대 적립·할인 금액</small>
              </div>
              <em>월 {won(row.monthly_cap ?? 0)}</em>
            </div>
            <div className="evidence ok">
              <div>
                <b>연회비</b>
                <small>연 단위로 차감합니다</small>
              </div>
              <em>−{won(row.annual_fee)}</em>
            </div>
            <div className="evidence ok">
              <div>
                <b>제외조건</b>
                <small>{row.excluded.join(' · ')}</small>
              </div>
              <em>{EVIDENCE_COPY.checked}</em>
            </div>
            <div className="evidence ok">
              <div>
                <b>기준일</b>
                <small>
                  {row.as_of_date} · rule_version {row.rule_version}
                </small>
              </div>
              <em>{EVIDENCE_COPY.checked}</em>
            </div>
            <div className="evidence ok">
              <div>
                <b>미반영 항목</b>
                <small>
                  {row.unmodeled
                    .map((item) => `${item.label} 최대 ±${won(item.bound)}`)
                    .join(' · ')}
                </small>
              </div>
              <em>{EVIDENCE_COPY.checked}</em>
            </div>
          </div>

          <div className="mt-2 rounded-xl bg-[var(--color-bg)] p-2.5">
            <b className="text-[10px]">{EVIDENCE_COPY.unmodeledTitle}</b>
            <ul className="mt-1.5 mb-0 list-none p-0">
              {row.unmodeled.map((item) => (
                <li key={item.label} className="text-[9px] leading-[1.5] text-[var(--color-subtle)]">
                  · {item.label} — 최대 ±{won(item.bound)} · 출처 {item.source.label} (
                  {item.source.as_of_date})
                </li>
              ))}
            </ul>
            <p className="mt-1.5 mb-0 text-[9px] leading-[1.45] text-[var(--color-subtle)]">
              {EVIDENCE_COPY.unmodeledRule}
            </p>
          </div>

          {row.annual_fee_whole_window_notice ? (
            <p className="mt-1.5 mb-0 text-[10px] text-[var(--color-warning)]">
              {EVIDENCE_COPY.annualFeeWholeWindow}
            </p>
          ) : null}
        </div>
      ))}

      {calculation.excluded_cards.length > 0 ? (
        <div className="mt-3 rounded-xl bg-[var(--color-bg)] p-2.5">
          <b className="text-[10px]">{EVIDENCE_COPY.excludedTitle}</b>
          <ul className="mt-1.5 mb-0 list-none p-0">
            {calculation.excluded_cards.map((item) => (
              <li key={item.card_id} className="text-[9px] text-[var(--color-subtle)]">
                · {item.card_id} — {item.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Notice>{EVIDENCE_COPY.notice}</Notice>
      <Note>{EVIDENCE_COPY.qualifyingModel}</Note>
      <p className="footer">
        {EVIDENCE_COPY.disclaimer} · {DATA_NOTICE.sampleFootnote}
      </p>

      <Actions>
        <PrimaryButton onClick={apply} disabled={pending}>
          {EVIDENCE_COPY.applyCta}
        </PrimaryButton>
        <GhostLink href="/app/result">{EVIDENCE_COPY.backToResult}</GhostLink>
      </Actions>
    </Screen>
  )
}
