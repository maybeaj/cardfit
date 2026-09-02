'use client'

import { CURRENT_STATE_NOTICE, DATA_NOTICE } from '@/content/copy'
import { diagnose } from '@/domain/diagnose'
import { manwon, won } from '@/domain/format'
import { CtaBar, Notice, Panel, PrimaryLink, ScreenHeader } from '@/components/shell'
import { useDemo } from '@/state/store'

/**
 * UI-001 현재 혜택 요약 — 두 라벨을 함께 노출한 경우에만 현재 상태의 연 혜택을 허용한다 (S03 · AC-012).
 * 유지·정리·신규 판정과 CardFit 최종 조합은 노출하지 않는다.
 */
export default function SummaryScreen() {
  const { profile } = useDemo()
  const d = diagnose(profile)

  return (
    <>
      <ScreenHeader
        step="현재 상태"
        title="지금 조합으로 받고 있는 혜택이에요"
        lead={CURRENT_STATE_NOTICE.basis}
        backHref="/app/connect"
      />
      <div className="scroll-area flex flex-col gap-3">
        <Panel>
          <p className="m-0 text-[13px] text-subtle">{CURRENT_STATE_NOTICE.basis} 예상 연 혜택</p>
          <p className="mt-1 mb-0 text-[32px] font-extrabold tracking-tight text-ink tabular-nums">
            {won(d.currentAnnualBenefit)}
          </p>
          <p className="mt-3 mb-0 text-[13px] text-subtle">
            한도를 다 쓰지 못한 금액 <strong className="text-ink">{won(d.unusedCapAnnual)}</strong>
          </p>
        </Panel>

        <Notice tone="warning">{CURRENT_STATE_NOTICE.futureNotIncluded}</Notice>

        <Panel tone="bg">
          <dl className="m-0 grid grid-cols-3 gap-2">
            {[
              { label: '보유 카드', value: `${d.cardCount}장` },
              { label: '월 소비', value: manwon(d.monthlySpend) },
              { label: '실적 최저 구간', value: `${d.underQualifiedCards}장` },
            ].map((item) => (
              <div key={item.label}>
                <dt className="m-0 text-[11.5px] text-subtle">{item.label}</dt>
                <dd className="m-0 mt-1 text-[16px] font-extrabold text-ink tabular-nums">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>

        <p className="m-0 text-[11.5px] leading-relaxed text-subtle">
          {DATA_NOTICE.sampleFootnote}
        </p>
      </div>
      <CtaBar>
        <PrimaryLink href="/app/diagnosis">내 카드 분석 보기</PrimaryLink>
      </CtaBar>
    </>
  )
}
