'use client'

import { useState } from 'react'
import { CURRENT_STATE_NOTICE, DATA_NOTICE } from '@/content/copy'
import { diagnose } from '@/domain/diagnose'
import { HORIZON_MONTHS } from '@/domain/plan'
import { percent, won } from '@/domain/format'
import { CtaBar, Notice, Panel, PrimaryLink, SampleBadge, ScreenHeader } from '@/components/shell'
import { useDemo } from '@/state/store'

/**
 * UI-001 현재 카드와 혜택 확인 — 기준본 s2.
 *
 * 지표 2개(지출액·받은 혜택)와 보유 카드 아코디언 하나로 끝낸다.
 * 관찰된 사실만 노출한다 — 절감액·추천 카드·과거 기준 손실을 띄우지 않는다 (`T5` · `T11`).
 * `최근 12개월 소비 기준`과 미래지출 안내를 함께 노출한 경우에만 연 혜택을 허용한다 (`S03` · `AC-012`).
 */
export default function CurrentCardsScreen() {
  const { profile } = useDemo()
  const d = diagnose(profile)
  const [spendHidden, setSpendHidden] = useState(false)
  const [openCard, setOpenCard] = useState<string | null>(null)

  return (
    <>
      <ScreenHeader
        step="현재 상태"
        title={CURRENT_STATE_NOTICE.title}
        lead={CURRENT_STATE_NOTICE.lead}
        backHref="/app"
      />
      <div className="scroll-area flex flex-col gap-3">
        <div className="grid gap-2">
          <Panel>
            <span className="block text-[10px] text-subtle">{CURRENT_STATE_NOTICE.spendLabel}</span>
            <div className="mt-1 flex items-center justify-between gap-2.5">
              <strong className="text-[17px] font-extrabold text-ink tabular-nums">
                {spendHidden ? CURRENT_STATE_NOTICE.masked : won(d.annualSpend)}
              </strong>
              <button
                type="button"
                aria-pressed={spendHidden}
                onClick={() => setSpendHidden((prev) => !prev)}
                className="inline-flex flex-none items-center gap-1.5 rounded-full border border-line bg-bg px-2.5 py-1.5 text-[9px] font-extrabold text-subtle"
              >
                <span aria-hidden className="text-[11px] leading-none">
                  {spendHidden ? '◌' : '◉'}
                </span>
                {spendHidden ? CURRENT_STATE_NOTICE.show : CURRENT_STATE_NOTICE.hide}
              </button>
            </div>
          </Panel>

          {/* 받은 혜택은 관찰값이라 강조한다. 절감 가능액이 아니다 */}
          <Panel tone="pass" className="relative overflow-hidden">
            <span className="block text-[10px] font-extrabold text-positive/80">
              {CURRENT_STATE_NOTICE.benefitLabel}
            </span>
            <span
              aria-hidden
              className="absolute top-3 right-3 grid h-[30px] w-[30px] place-items-center rounded-[10px] bg-surface text-[16px] text-positive shadow-sm"
            >
              ✦
            </span>
            <strong className="mt-1 block text-[21px] font-extrabold text-positive tabular-nums">
              {won(d.currentAnnualBenefit)}
            </strong>
            <small className="mt-1 block text-[10px] leading-[1.4] text-subtle">
              {CURRENT_STATE_NOTICE.benefitCaption}
            </small>
          </Panel>
        </div>

        <div className="mt-2 px-0.5">
          <h2 className="m-0 mb-0.5 text-[14px] font-extrabold text-ink">
            {CURRENT_STATE_NOTICE.cardsHeading}
          </h2>
          <p className="m-0 text-[10px] leading-[1.45] text-subtle">
            {CURRENT_STATE_NOTICE.cardsLead}
          </p>
        </div>

        <div className="grid gap-2">
          {d.perCard.map((card) => {
            const open = openCard === card.card_id
            return (
              <div key={card.card_id}>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenCard(open ? null : card.card_id)}
                  className="flex min-h-[68px] w-full items-center gap-2.5 rounded-[12px] border border-line bg-surface px-[11px] py-2.5 text-left"
                >
                  <span aria-hidden className="h-[27px] w-10 flex-none rounded-[7px] bg-primary/80" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <b className="text-[11px] text-ink">{card.name}</b>
                      <SampleBadge label={DATA_NOTICE.sampleBadge} />
                    </span>
                    <small className="mt-0.5 block text-[10px] text-subtle">
                      {card.issuer} · 최근 12개월 혜택 {won(card.monthlyBenefit * HORIZON_MONTHS)}
                    </small>
                  </span>
                  <span
                    aria-hidden
                    className="grid h-6 w-6 flex-none place-items-center rounded-full bg-bg text-[12px] font-black text-subtle"
                  >
                    {open ? '⌃' : '⌄'}
                  </span>
                </button>

                {open ? (
                  <div className="mx-1 -mt-0.5 rounded-b-[12px] border border-t-0 border-line bg-bg/60 p-[11px]">
                    <b className="mb-2 block text-[10px] text-ink">{card.name} 주요 혜택</b>
                    <dl className="m-0 grid grid-cols-3 gap-2">
                      <div>
                        <dt className="m-0 text-[9px] text-subtle">적용 적립·할인율</dt>
                        <dd className="m-0 mt-0.5 text-[12px] font-bold text-ink tabular-nums">
                          {card.tier ? percent(card.tier.rate) : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="m-0 text-[9px] text-subtle">월 한도</dt>
                        <dd className="m-0 mt-0.5 text-[12px] font-bold text-ink tabular-nums">
                          {card.tier ? won(card.tier.monthly_cap) : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="m-0 text-[9px] text-subtle">연회비</dt>
                        <dd className="m-0 mt-0.5 text-[12px] font-bold text-ink tabular-nums">
                          {won(card.annual_fee)}
                        </dd>
                      </div>
                    </dl>
                    <ul className="mt-2.5 mb-0 grid list-none grid-cols-2 gap-1.5 p-0">
                      {card.categories.map((category) => (
                        <li
                          key={category}
                          className="rounded-[9px] bg-surface px-2 py-1.5 text-[9px] leading-[1.35] text-subtle"
                        >
                          {category}
                        </li>
                      ))}
                    </ul>
                    {card.tierIsLowest ? (
                      <p className="mt-2.5 mb-0 rounded-lg bg-amber px-3 py-2 text-[10px] text-warning">
                        {CURRENT_STATE_NOTICE.lowestTier}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        <Notice tone="warning">{CURRENT_STATE_NOTICE.benefitNotice}</Notice>
        <Notice>{CURRENT_STATE_NOTICE.futureNotIncluded}</Notice>
        <p className="m-0 text-[11.5px] leading-relaxed text-subtle">
          {DATA_NOTICE.sampleFootnote}
        </p>
      </div>
      <CtaBar>
        <PrimaryLink href="/app/plan">{CURRENT_STATE_NOTICE.cta}</PrimaryLink>
      </CtaBar>
    </>
  )
}
