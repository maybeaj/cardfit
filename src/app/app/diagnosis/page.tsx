'use client'

import { CURRENT_STATE_NOTICE, DATA_NOTICE } from '@/content/copy'
import { diagnose } from '@/domain/diagnose'
import { percent, won } from '@/domain/format'
import { CtaBar, Notice, Panel, PrimaryLink, SampleBadge, ScreenHeader } from '@/components/shell'
import { useDemo } from '@/state/store'

/**
 * UI-001 현재 카드 진단 — 관찰된 사실만 노출한다.
 * 절감액·추천 카드·과거 기준 손실을 띄우지 않는다 (T5 · T11).
 */
export default function DiagnosisScreen() {
  const { profile } = useDemo()
  const d = diagnose(profile)

  return (
    <>
      <ScreenHeader
        step="현재 카드 진단"
        title={`카드 ${d.cardCount}장이 어떻게 쓰이고 있는지 봤어요`}
        lead={CURRENT_STATE_NOTICE.basis}
        backHref="/app/summary"
      />
      <div className="scroll-area flex flex-col gap-3">
        {d.perCard.map((card) => (
          <Panel key={card.card_id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="m-0 text-[12px] text-subtle">{card.issuer}</p>
                <p className="mt-0.5 mb-0 text-[16px] font-extrabold text-ink">{card.name}</p>
              </div>
              <SampleBadge label={DATA_NOTICE.sampleBadge} />
            </div>
            <dl className="mt-3 mb-0 grid grid-cols-3 gap-2 border-t border-line pt-3">
              <div>
                <dt className="m-0 text-[11px] text-subtle">적용 적립·할인율</dt>
                <dd className="m-0 mt-0.5 text-[14px] font-bold text-ink tabular-nums">
                  {card.tier ? percent(card.tier.rate) : '—'}
                </dd>
              </div>
              <div>
                <dt className="m-0 text-[11px] text-subtle">월 한도</dt>
                <dd className="m-0 mt-0.5 text-[14px] font-bold text-ink tabular-nums">
                  {card.tier ? won(card.tier.monthly_cap) : '—'}
                </dd>
              </div>
              <div>
                <dt className="m-0 text-[11px] text-subtle">연회비</dt>
                <dd className="m-0 mt-0.5 text-[14px] font-bold text-ink tabular-nums">
                  {won(card.annual_fee)}
                </dd>
              </div>
            </dl>
            {card.tierIsLowest ? (
              <p className="mt-3 mb-0 rounded-lg bg-amber px-3 py-2 text-[12px] text-warning">
                실적 구간이 최저 단계에 머물러 있습니다
              </p>
            ) : null}
            <p className="mt-2 mb-0 text-[12px] text-subtle">
              혜택 대상 {card.categories.join(' · ')}
            </p>
          </Panel>
        ))}
        <Notice tone="warning">{CURRENT_STATE_NOTICE.futureNotIncluded}</Notice>
        <p className="m-0 text-[11.5px] leading-relaxed text-subtle">{DATA_NOTICE.sampleFootnote}</p>
      </div>
      <CtaBar>
        <PrimaryLink href="/app/plan">앞으로 쓸 돈 반영하기</PrimaryLink>
      </CtaBar>
    </>
  )
}
