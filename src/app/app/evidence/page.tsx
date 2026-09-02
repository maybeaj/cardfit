'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DATA_NOTICE, EVIDENCE_COPY } from '@/content/copy'
import { percent, won } from '@/domain/format'
import {
  CtaBar,
  KeyValue,
  Notice,
  Panel,
  PrimaryButton,
  ScreenHeader,
  SecondaryLink,
} from '@/components/shell'
import { logEvent } from '@/state/events'
import { useDemo } from '@/state/store'

/**
 * UI-007 근거 — 결론 화면에서만 진입한다. 6항목 + 미반영 항목.
 * 전문 용어를 바꾸지 않고 괄호 한 줄 풀이만 붙인다 (T44).
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
    <>
      <ScreenHeader
        step="근거 검증"
        title={EVIDENCE_COPY.title}
        lead={EVIDENCE_COPY.lead}
        backHref="/app/result"
      />
      <div className="scroll-area flex flex-col gap-3">
        <p className="m-0 text-[11.5px] leading-relaxed text-subtle">
          적용 기준일 {calculation.as_of_date} · {DATA_NOTICE.sampleFootnote}
        </p>

        {calculation.stale_as_of_warning ? (
          <Notice tone="warning">{EVIDENCE_COPY.staleAsOf}</Notice>
        ) : null}

        {calculation.evidence.map((row) => (
          <Panel key={row.card_id}>
            <p className="m-0 text-[12px] text-subtle">{row.issuer}</p>
            <p className="mt-0.5 mb-3 text-[16px] font-extrabold text-ink">{row.name}</p>
            <dl className="m-0 divide-y divide-line">
              <KeyValue
                label="실적구간 (전월 사용액 단계)"
                value={
                  row.applied_tier
                    ? `${won(row.applied_tier.min_monthly_spend)}↑ · ${percent(row.applied_tier.rate)}`
                    : '—'
                }
              />
              <KeyValue label="혜택한도 (월 최대 적립·할인)" value={`월 ${won(row.monthly_cap ?? 0)}`} />
              <KeyValue label="연회비" value={`−${won(row.annual_fee)}`} />
              <KeyValue label="제외조건" value={row.excluded.join(' · ')} />
              <KeyValue label="기준일" value={`${row.as_of_date} · ${row.rule_version}`} />
            </dl>

            <div className="mt-3 rounded-xl bg-bg p-3">
              <p className="m-0 text-[12.5px] font-bold text-ink">{EVIDENCE_COPY.unmodeledTitle}</p>
              <ul className="mt-2 mb-0 list-none space-y-1.5 p-0">
                {row.unmodeled.map((item) => (
                  <li key={item.label} className="text-[12px] text-subtle">
                    · {item.label} — 최대 ±{won(item.bound)}
                    <span className="block pl-3 text-[11px]">
                      출처 {item.source.label} ({item.source.as_of_date})
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 mb-0 text-[11px] leading-relaxed text-subtle">
                {EVIDENCE_COPY.unmodeledRule}
              </p>
            </div>

            {row.annual_fee_whole_window_notice ? (
              <p className="mt-2 mb-0 text-[11px] text-warning">
                {EVIDENCE_COPY.annualFeeWholeWindow}
              </p>
            ) : null}
          </Panel>
        ))}

        {calculation.excluded_cards.length > 0 ? (
          <Panel tone="bg">
            <p className="m-0 text-[12.5px] font-bold text-ink">{EVIDENCE_COPY.excludedTitle}</p>
            <ul className="mt-2 mb-0 list-none space-y-1 p-0">
              {calculation.excluded_cards.map((item) => (
                <li key={item.card_id} className="text-[12px] text-subtle">
                  · {item.card_id} — {item.reason}
                </li>
              ))}
            </ul>
          </Panel>
        ) : null}

        <Notice tone="warning">{EVIDENCE_COPY.notice}</Notice>
        <Notice>{EVIDENCE_COPY.qualifyingModel}</Notice>
        <Notice>{EVIDENCE_COPY.disclaimer}</Notice>
      </div>
      <CtaBar>
        <div className="flex flex-col gap-2">
          <PrimaryButton onClick={apply} disabled={pending}>
            {EVIDENCE_COPY.applyCta}
          </PrimaryButton>
          <SecondaryLink href="/app/result">{EVIDENCE_COPY.backToResult}</SecondaryLink>
        </div>
      </CtaBar>
    </>
  )
}
