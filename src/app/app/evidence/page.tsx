'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { EVIDENCE_COPY } from '@/content/copy'
import { krw } from '@/domain/format'
import { spendEvidenceRows } from '@/domain/scenario'
import { CARD_RULES, EVIDENCE_SIX } from '@/fixtures/prototype'
import { Actions, GhostLink, Notice, Screen } from '@/components/shell'
import { logEvent } from '@/state/events'
import { useFlow } from '@/state/store'

/**
 * UI-007 상세 근거 — 기준본 s6. 결론 화면에서만 진입한다.
 *
 * 근거 6항목(실적구간·혜택한도·연회비·제외조건·기준일·미반영 항목)을 모두 채운다 (AC-002).
 * 전문 용어를 쉬운 말로 바꾸지 않는다 — 사용자가 카드사 약관과 대조할 수 있어야 한다 (`T44`).
 */
export default function EvidenceScreen() {
  const { outcome, ensureOutcomes } = useFlow()
  const ensured = useRef(false)

  useEffect(() => {
    if (ensured.current) return
    ensured.current = true
    ensureOutcomes()
  }, [ensureOutcomes])

  useEffect(() => {
    if (outcome) logEvent('근거열람', { scenario: outcome.key, view: 'full' })
  }, [outcome])

  if (!outcome) return null

  const rows = spendEvidenceRows(outcome)

  return (
    <Screen screenId="s6" back="/app/result">
      <span className="badge">07 · 상세 근거</span>
      <h2>
        {EVIDENCE_COPY.title[0]}
        <br />
        {EVIDENCE_COPY.title[1]}
      </h2>
      <p className="sub">{EVIDENCE_COPY.lead}</p>

      {/* 사용자가 확인한 계획을 계산이 어떻게 펼쳤는지 먼저 보여준다 */}
      <div className="spend-evidence">
        <h3>{EVIDENCE_COPY.spendHeading(outcome.label)}</h3>
        {rows.map((row) => (
          <div key={`${row.label}-${row.months}`} className="spend-evidence-row">
            <b>
              {row.label} · {row.periodLabel}
            </b>
            <span>
              {row.months === 1
                ? krw(row.scenarioAmount)
                : EVIDENCE_COPY.monthlyAmount(krw(row.monthlyAmount))}
            </span>
          </div>
        ))}
      </div>

      <div className="evidence-six-grid">
        {EVIDENCE_SIX.map((item) => (
          <div key={item.no} className="evidence-six-item">
            <b>
              {item.no} · {item.title}
            </b>
            <span>{item.body}</span>
          </div>
        ))}
      </div>

      <div className="card-evidence-list">
        {outcome.cards.map((card, index) => {
          const rule = CARD_RULES[card.name]
          if (!rule) return null
          return (
            <details key={card.name} className="card-evidence" open={index === 0}>
              <summary>
                <Image src={card.art} alt={card.name} width={52} height={33} unoptimized />
                <span>
                  <b>{card.name}</b>
                  <small>{EVIDENCE_COPY.cardSummary(card.state, krw(card.benefit))}</small>
                </span>
                <span className="open-mark" aria-hidden>
                  ⌃
                </span>
              </summary>

              <div className="card-evidence-body">
                <div className="performance-box">
                  <span>{EVIDENCE_COPY.performanceLabel}</span>
                  <strong>{rule.performance}</strong>
                </div>

                <table className="performance-table">
                  <tbody>
                    {rule.bands.map((row, rowIndex) => (
                      <tr key={row.join('|')}>
                        {row.map((cell, cellIndex) =>
                          rowIndex === 0 ? (
                            <th key={`${cell}-${cellIndex}`}>{cell}</th>
                          ) : (
                            <td key={`${cell}-${cellIndex}`}>{cell}</td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="benefit-rule-list">
                  {rule.items.map((item) => (
                    <div key={item.title} className="benefit-rule">
                      <span className="rule-icon" aria-hidden>
                        {item.icon}
                      </span>
                      <span>
                        <b>{item.title}</b>
                        <small>{item.detail}</small>
                      </span>
                      <strong>{item.limit}</strong>
                    </div>
                  ))}
                </div>

                <p className="evidence-caution">
                  {EVIDENCE_COPY.cautionPrefix}
                  {rule.caution}
                </p>
                <a
                  className="official-link"
                  href={rule.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => logEvent('아웃링크클릭', { card: card.name, from: 'evidence' })}
                >
                  {EVIDENCE_COPY.officialLink}
                </a>
              </div>
            </details>
          )
        })}
      </div>

      <Notice>{EVIDENCE_COPY.notice}</Notice>

      {/* 근거 화면은 길다 — 결과로 돌아가는 길이 스크롤 끝에만 있으면 안 된다 */}
      <Actions sticky>
        <GhostLink href="/app/result">{EVIDENCE_COPY.backToResult}</GhostLink>
      </Actions>
    </Screen>
  )
}
