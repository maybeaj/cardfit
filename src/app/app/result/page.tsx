'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { BOUNDARY_COPY, CONCLUSION_COPY, RESULT_COPY } from '@/content/copy'
import { krw, manwon } from '@/domain/format'
import { SCENARIOS, allocate } from '@/domain/scenario'
import { STATE_CLASS, issuerUrl } from '@/fixtures/prototype'
import { ResultEvidenceSheet } from '@/components/result-evidence-sheet'
import { Actions, GhostLink, PrimaryButton, Screen } from '@/components/shell'
import { logEvent } from '@/state/events'
import { useFlow } from '@/state/store'

/**
 * UI-005 · UI-006 · UI-008 결과 — 기준본 s5. 세 요구사항이 이 화면 하나 안에 있다.
 *
 * **본문은 결제 배분표다** (`T2` · FR-004). 카드 순위 목록을 만들지 않는다 —
 * 사용자가 입력한 지출이 어느 카드로 결제되는지가 이 제품의 산출물이다.
 * 시나리오 탭을 바꾸면 금액·조합·상태·배분이 함께 교체된다 (AC-014).
 */
export default function ResultScreen() {
  const router = useRouter()
  const { outcome, outcomes, scenario, liked, selectScenario, like, ensureOutcomes } = useFlow()
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

  const allocation = useMemo(() => (outcome ? allocate(outcome) : null), [outcome])

  if (!outcome || !allocation) return null

  const openSheet = () => {
    logEvent('근거열람', { scenario: outcome.key, view: 'summary' })
    setSheetOpen(true)
  }

  const newCards = allocation.byCard.filter((card) => card.state === '신규')

  /* 좋아요를 누르면 다음 행동이 CTA 아래에 펼쳐진다 — 접힘선 밖에서 열리면 못 본다 */
  const likeAndReveal = () => {
    like()
    window.requestAnimationFrame(() =>
      document.querySelector('.next-actions')?.scrollIntoView({ behavior: 'smooth', block: 'end' }),
    )
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
                {/* 탭이 얼마를 뜻하는지 밝힌다 — `적게`가 얼마인지 모르면 고를 수 없다 */}
                <small>{manwon(outcomes?.[option.key].total ?? 0)}</small>
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

      {/*
        FR-004 결제수단 배분 — 화면의 본문이다.
        금액을 새로 만들지 않고 확인한 계획을 나누기만 하므로 합은 항상 계획 총액과 같다.
      */}
      <div className="result-section-heading cards-heading">
        <h3>{RESULT_COPY.cardsHeading}</h3>
        <span>{RESULT_COPY.cardsSub}</span>
      </div>

      {/* 카드마다 신규·유지·정리 중 하나만 붙는다. `정리`에는 실행 버튼을 두지 않는다 (AC-003) */}
      <div className="result-card-list">
        {allocation.byCard.map((card) => {
          const state = STATE_CLASS[card.state]
          const organized = card.state === '정리'
          return (
            <div key={card.name} className={`result-card status-${state}`}>
              <Image src={card.art} alt={card.name} width={64} height={40} unoptimized />
              <div className="result-card-copy">
                <b>{card.name}</b>
                <small>
                  {organized
                    ? RESULT_COPY.cardNoAmount
                    : `${RESULT_COPY.cardAmountLabel} ${krw(card.amount)}`}
                </small>
                <strong className={organized ? 'is-past' : undefined}>
                  {organized ? RESULT_COPY.cardPastBenefitLabel : RESULT_COPY.cardBenefitLabel}{' '}
                  {krw(card.benefit)}
                </strong>
                {card.state === '신규' ? (
                  <a
                    className="issuer-link"
                    href={issuerUrl(card.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => logEvent('아웃링크클릭', { card: card.name, from: 'result' })}
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

      <div className="result-section-heading allocation-heading">
        <h3>{RESULT_COPY.allocationHeading}</h3>
        <span>{RESULT_COPY.allocationSub}</span>
      </div>

      <div className="allocation">
        {allocation.rows.map((row) => (
          <div key={row.planId} className="allocation-row">
            <div className="allocation-what">
              <b>{row.category}</b>
              <small>{row.periodLabel}</small>
            </div>
            <strong className="allocation-amount">{krw(row.amount)}</strong>
            <div className="allocation-card">
              <Image src={row.cardArt} alt="" width={36} height={23} unoptimized />
              <span>
                <b>{row.cardName}</b>
                <small title={RESULT_COPY.reasonHint[row.reason]}>{row.reason}</small>
              </span>
            </div>
          </div>
        ))}
        <div className="allocation-total">
          <b>{RESULT_COPY.allocationTotal}</b>
          <span>
            <strong>{krw(allocation.total)}</strong>
            <small>{RESULT_COPY.allocationTotalNote}</small>
          </span>
        </div>
      </div>
      {/* T39 — 상한 안에서의 최선임을 밝히고 `최적 조합`으로 단정하지 않는다 */}
      <p className="footer">{CONCLUSION_COPY.boundedOptimum}</p>

      <Actions>
        {/* 북극성(조합 선호율)의 분자다 — 별도 확정 화면을 두지 않는다 (FR-008) */}
        <PrimaryButton
          className={liked ? 'liked' : undefined}
          aria-pressed={liked}
          onClick={likeAndReveal}
        >
          {liked ? RESULT_COPY.liked : RESULT_COPY.like}
        </PrimaryButton>
        <GhostLink href="/app/plan">{RESULT_COPY.editPlan}</GhostLink>
      </Actions>

      {/*
        좋아요 다음에 무엇을 하면 되는지 — 여기가 여정의 끝이라 실행 경계도 여기서 고지한다
        (AC-003 · `T27`). 대행하지 않고 신규 1장만 카드사 공식 페이지로 이동시킨다.
      */}
      {liked ? (
        <div className="next-actions" aria-live="polite">
          <h3>{RESULT_COPY.nextHeading}</h3>
          {allocation.byCard.map((card) => (
            <div key={card.name} className="next-action">
              <span className={`state-pill ${STATE_CLASS[card.state]}`}>{card.state}</span>
              <div>
                <b>{card.name}</b>
                <small>
                  {card.state === '신규'
                    ? RESULT_COPY.nextNew
                    : card.state === '정리'
                      ? RESULT_COPY.nextOrganize
                      : RESULT_COPY.nextKeep}
                </small>
              </div>
              {card.state === '신규' ? (
                <a
                  className="next-link"
                  href={issuerUrl(card.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => logEvent('아웃링크클릭', { card: card.name })}
                >
                  {RESULT_COPY.issuerLink}
                </a>
              ) : null}
            </div>
          ))}
          <p className="tiny-note">
            {BOUNDARY_COPY.direct} · 아웃링크 {newCards.length}개 · 해지 실행 버튼 0개
          </p>
        </div>
      ) : null}

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
