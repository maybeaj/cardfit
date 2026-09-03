'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CURRENT_STATE_NOTICE, DATA_NOTICE } from '@/content/copy'
import { diagnose } from '@/domain/diagnose'
import { HORIZON_MONTHS } from '@/domain/plan'
import { percent, won } from '@/domain/format'
import { CARD_ART } from '@/fixtures/mydata/rules'
import {
  Actions,
  Metric,
  Notice,
  PrimaryLink,
  Screen,
  ScreenHeader,
} from '@/components/shell'
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
    <Screen>
      <ScreenHeader
        title={
          <>
            지금 가지고 있는 카드부터
            <br />
            살펴볼게요.
          </>
        }
        lead={CURRENT_STATE_NOTICE.lead}
      backHref="/app"
      />

      <div className="grid current-summary">
        <Metric label={CURRENT_STATE_NOTICE.spendLabel}>
          <div className="metric-value-row">
            <strong className="tabular-nums">
              {spendHidden ? CURRENT_STATE_NOTICE.masked : won(d.annualSpend)}
            </strong>
            <button
              type="button"
              className="visibility-toggle"
              aria-pressed={spendHidden}
              onClick={() => setSpendHidden((prev) => !prev)}
            >
              <span className="eye-icon" aria-hidden>
                {spendHidden ? '◌' : '◉'}
              </span>
              {spendHidden ? CURRENT_STATE_NOTICE.show : CURRENT_STATE_NOTICE.hide}
            </button>
          </div>
        </Metric>

        {/* 받은 혜택은 관찰값이라 강조한다. 절감 가능액이 아니다 */}
        <Metric label={CURRENT_STATE_NOTICE.benefitLabel} className="benefit-highlight">
          <span className="benefit-symbol" aria-hidden>
            ✦
          </span>
          <strong className="tabular-nums">{won(d.currentAnnualBenefit)}</strong>
          <small className="metric-caption">{CURRENT_STATE_NOTICE.benefitCaption}</small>
        </Metric>
      </div>

      <div className="section-heading">
        <h3>{CURRENT_STATE_NOTICE.cardsHeading}</h3>
        <p>{CURRENT_STATE_NOTICE.cardsLead}</p>
      </div>

      <div className="grid card-list">
        {d.perCard.map((card, index) => {
          const open = openCard === card.card_id
          const art = CARD_ART[card.card_id]
          return (
            <div key={card.card_id}>
              <button
                type="button"
                className="cardrow card-toggle"
                aria-expanded={open}
                onClick={() => setOpenCard(open ? null : card.card_id)}
              >
                {art ? (
                  <Image className="card-art" src={art} alt="" width={48} height={30} />
                ) : (
                  <span className={`art tone-${(index % 3) + 1}`} aria-hidden />
                )}
                <div className="card-copy">
                  <div className="card-title-row">
                    <b>{card.name}</b>
                    <span className="category-tag">{DATA_NOTICE.sampleBadge}</span>
                  </div>
                  <small>
                    {card.issuer} · 최근 12개월 혜택 {won(card.monthlyBenefit * HORIZON_MONTHS)}
                  </small>
                </div>
                <span className="card-chevron" aria-hidden>
                  {open ? '⌃' : '⌄'}
                </span>
              </button>

              {open ? (
                <div className="card-detail">
                  <b>{card.name} 주요 혜택</b>
                  <ul>
                    <li>
                      <span className="benefit-list-icon" aria-hidden>
                        📈
                      </span>
                      적용 적립·할인율 {card.tier ? percent(card.tier.rate) : '—'}
                    </li>
                    <li>
                      <span className="benefit-list-icon" aria-hidden>
                        🎯
                      </span>
                      월 한도 {card.tier ? won(card.tier.monthly_cap) : '—'}
                    </li>
                    <li>
                      <span className="benefit-list-icon" aria-hidden>
                        💳
                      </span>
                      연회비 {won(card.annual_fee)}
                    </li>
                    <li>
                      <span className="benefit-list-icon" aria-hidden>
                        🛍️
                      </span>
                      혜택 대상 {card.categories.length}종
                    </li>
                  </ul>
                  <p className="mt-2 mb-0 text-[9px] leading-[1.4] text-[var(--color-subtle)]">
                    {card.categories.join(' · ')}
                  </p>
                  {card.tierIsLowest ? (
                    <p className="mt-2 mb-0 rounded-lg bg-[var(--color-amber)] px-2.5 py-2 text-[9px] text-[var(--color-warning)]">
                      {CURRENT_STATE_NOTICE.lowestTier}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <Notice>{CURRENT_STATE_NOTICE.benefitNotice}</Notice>
      <p className="footer">
        {CURRENT_STATE_NOTICE.futureNotIncluded} · {DATA_NOTICE.sampleFootnote}
      </p>

      <Actions>
        <PrimaryLink href="/app/plan">{CURRENT_STATE_NOTICE.cta}</PrimaryLink>
      </Actions>
    </Screen>
  )
}
