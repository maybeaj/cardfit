'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CURRENT_STATE_NOTICE } from '@/content/copy'
import { krw } from '@/domain/format'
import { CURRENT_STATE, OWNED_CARDS } from '@/fixtures/prototype'
import { Actions, Metric, Notice, PrimaryLink, Screen } from '@/components/shell'

/**
 * UI-001 현재 카드와 혜택 확인 — 기준본 s2.
 *
 * 지표 2개(지출액·받은 혜택)와 보유 카드 아코디언 하나로 끝낸다.
 * 관찰된 사실만 노출한다 — 절감액·예상혜택·추천 카드·과거 기준 손실을 띄우지 않는다 (`T5` · `T11`).
 */
export default function CurrentCardsScreen() {
  const [spendHidden, setSpendHidden] = useState(false)
  const [openCard, setOpenCard] = useState<string | null>(null)

  return (
    <Screen screenId="s2" back="/app">
      <span className="badge">03 · 현재 상태</span>
      <h2>
        {CURRENT_STATE_NOTICE.title[0]}
        <br />
        {CURRENT_STATE_NOTICE.title[1]}
      </h2>
      <p className="sub">{CURRENT_STATE_NOTICE.lead}</p>

      <div className="grid current-summary">
        <Metric label={CURRENT_STATE_NOTICE.spendLabel} className="metric-with-action">
          <div className="metric-value-row">
            <strong className="metric-value">
              {spendHidden ? CURRENT_STATE_NOTICE.masked : krw(CURRENT_STATE.annualSpend)}
            </strong>
            <button
              type="button"
              className={spendHidden ? 'visibility-toggle is-hidden' : 'visibility-toggle'}
              aria-pressed={spendHidden}
              onClick={() => setSpendHidden((prev) => !prev)}
            >
              <span className="eye-icon" aria-hidden>
                {spendHidden ? '◌' : '◉'}
              </span>
              <span className="visibility-label">
                {spendHidden ? CURRENT_STATE_NOTICE.show : CURRENT_STATE_NOTICE.hide}
              </span>
            </button>
          </div>
        </Metric>

        {/* 받은 혜택은 관찰값이라 강조한다. 절감 가능액이 아니다 */}
        <Metric label={CURRENT_STATE_NOTICE.benefitLabel} className="benefit-highlight">
          <span className="benefit-symbol" aria-hidden>
            ✦
          </span>
          <strong>{krw(CURRENT_STATE.annualBenefit)}</strong>
          <small className="metric-caption">{CURRENT_STATE_NOTICE.benefitCaption}</small>
        </Metric>
      </div>

      <div className="section-heading">
        <h3>{CURRENT_STATE_NOTICE.cardsHeading}</h3>
        <p>{CURRENT_STATE_NOTICE.cardsLead}</p>
      </div>

      <div className="grid card-list">
        {OWNED_CARDS.map((card) => {
          const open = openCard === card.name
          return (
            <div key={card.name}>
              <button
                type="button"
                className="cardrow card-toggle"
                aria-expanded={open}
                onClick={() => setOpenCard(open ? null : card.name)}
              >
                <Image
                  className="card-art"
                  src={card.art}
                  alt={card.name}
                  width={48}
                  height={30}
                  unoptimized
                />
                <div className="card-copy">
                  <div className="card-title-row">
                    <b>{card.name}</b>
                    <span className="category-tag">{card.tag}</span>
                  </div>
                  <small>{card.summary}</small>
                </div>
                <span className="card-chevron" aria-hidden>
                  {open ? '⌃' : '⌄'}
                </span>
              </button>

              {open ? (
                <div className="card-detail">
                  <b>{CURRENT_STATE_NOTICE.cardBenefitTitle(card.name)}</b>
                  <ul>
                    {card.benefits.map((benefit) => (
                      <li key={benefit.label}>
                        <span className="benefit-list-icon" aria-hidden>
                          {benefit.icon}
                        </span>
                        {benefit.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>

      <Notice>{CURRENT_STATE_NOTICE.benefitNotice}</Notice>

      <Actions>
        <PrimaryLink href="/app/plan">{CURRENT_STATE_NOTICE.cta}</PrimaryLink>
      </Actions>
    </Screen>
  )
}
