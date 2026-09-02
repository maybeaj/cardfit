'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { RESULT_COPY } from '@/content/copy'
import { krw } from '@/domain/format'
import { SCENARIOS } from '@/domain/scenario'
import { STATE_CLASS, issuerUrl } from '@/fixtures/prototype'
import { ResultEvidenceSheet } from '@/components/result-evidence-sheet'
import { Actions, GhostLink, PrimaryButton, Screen } from '@/components/shell'
import { logEvent } from '@/state/events'
import { useFlow } from '@/state/store'

/**
 * UI-005 · UI-006 · UI-008 결과 — 기준본 s5. 세 요구사항이 이 화면 하나 안에 있다.
 *
 * 시나리오 탭과 혜택 결과가 하나의 연결된 영역(`.result-shell`)이다.
 * 탭을 바꾸면 Net Benefit·카드 조합·상태가 함께 교체되고 좋아요도 초기화된다 (AC-014).
 * 카드 순위 목록을 만들지 않는다 (`T2`).
 */
export default function ResultScreen() {
  const router = useRouter()
  const { outcome, scenario, liked, selectScenario, like, ensureOutcomes } = useFlow()
  const [sheetOpen, setSheetOpen] = useState(false)
  const ensured = useRef(false)

  // 새로고침·딥링크로 들어와도 화면을 비우지 않는다 — 같은 입력이면 같은 결과다 (NFR-001)
  useEffect(() => {
    if (ensured.current) return
    ensured.current = true
    ensureOutcomes()
  }, [ensureOutcomes])

  useEffect(() => {
    if (outcome) logEvent('결과열람', { scenario: outcome.key, pass: outcome.pass })
  }, [outcome])

  if (!outcome) return null

  const openSheet = () => {
    logEvent('근거열람', { scenario: outcome.key, view: 'summary' })
    setSheetOpen(true)
  }

  return (
    <Screen screenId="s5" back="/app/constraint">
      <span className="badge">06 · 계산 결과</span>

      <div className="result-shell">
        <div className="scenario-explorer">
          <span className="label">{RESULT_COPY.scenarioLabel}</span>
          <div className="scenario-tabs" role="group" aria-label={RESULT_COPY.scenarioLabel}>
            {SCENARIOS.map((option) => (
              <button
                key={option.key}
                type="button"
                className={scenario === option.key ? 'active' : ''}
                aria-pressed={scenario === option.key}
                onClick={() => selectScenario(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 결론 배너 — 다크가 아니라 의미색이다. 통과=민트, 유지=앰버 (`T13`) */}
        <div className={outcome.pass ? 'result' : 'result hold'}>
          {outcome.pass ? (
            <>
              <span className="benefit-label">{RESULT_COPY.benefitLabel}</span>
              <strong className="benefit-value">
                <small>{RESULT_COPY.benefitUnit}</small> {krw(outcome.displayBenefit)}
              </strong>
              <span className="benefit-delta">
                {RESULT_COPY.benefitDelta(krw(outcome.benefitIncrease))}
              </span>
            </>
          ) : (
            <>
              <span className="benefit-label">{RESULT_COPY.holdLabel(outcome.label)}</span>
              <strong className="benefit-value">{RESULT_COPY.holdValue}</strong>
              <span className="benefit-delta">{RESULT_COPY.holdDelta}</span>
            </>
          )}
          <button type="button" className="result-evidence-trigger" onClick={openSheet}>
            <span>
              {outcome.pass ? RESULT_COPY.evidenceTrigger : RESULT_COPY.holdEvidenceTrigger}
            </span>
            <span aria-hidden>›</span>
          </button>
        </div>
      </div>

      <div className="result-section-heading">
        <h3>{RESULT_COPY.cardsHeading}</h3>
        <span>{RESULT_COPY.cardsSub}</span>
      </div>

      {/* 카드마다 신규·유지·정리 중 하나만 붙는다. `정리`에는 실행 버튼을 두지 않는다 (AC-003) */}
      <div className="result-card-list">
        {outcome.cards.map((card) => {
          const state = STATE_CLASS[card.state]
          return (
            <div key={card.name} className={`result-card status-${state}`}>
              <Image src={card.art} alt={card.name} width={64} height={40} unoptimized />
              <div className="result-card-copy">
                <b>{card.name}</b>
                <small>{RESULT_COPY.cardBenefitLabel}</small>
                <strong>{krw(card.benefit)}</strong>
                {card.state === '신규' ? (
                  <a
                    className="issuer-link"
                    href={issuerUrl(card.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => logEvent('아웃링크클릭', { card: card.name })}
                  >
                    {RESULT_COPY.issuerLink}
                  </a>
                ) : null}
              </div>
              <span className={`state-pill ${state}`}>{card.state}</span>
            </div>
          )
        })}
      </div>

      <Actions>
        {/* 북극성(조합 선호율)의 분자다 — 별도 확정 화면을 두지 않는다 (FR-008) */}
        <PrimaryButton
          className={liked ? 'liked' : undefined}
          aria-pressed={liked}
          onClick={like}
        >
          {liked ? RESULT_COPY.liked : RESULT_COPY.like}
        </PrimaryButton>
        <GhostLink href="/app/plan">{RESULT_COPY.editPlan}</GhostLink>
      </Actions>

      <ResultEvidenceSheet
        outcome={outcome}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onOpenFull={() => {
          setSheetOpen(false)
          router.push('/app/evidence')
        }}
      />
    </Screen>
  )
}
