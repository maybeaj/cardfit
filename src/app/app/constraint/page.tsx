'use client'

import { useRouter } from 'next/navigation'
import { CONSTRAINT_COPY } from '@/content/copy'
import { krw } from '@/domain/format'
import { NET_BENEFIT_FLOOR, NET_BENEFIT_RATIO } from '@/domain/scenario'
import { Actions, Note, PrimaryButton, Screen } from '@/components/shell'
import { useFlow } from '@/state/store'

/**
 * UI-003 변경 조건 — 기준본 s4.
 *
 * 계산 결과를 좌우하는 핵심 입력이라 팝업이 아니라 별도 화면으로 두고 뒤로가기를 보장한다.
 * `이 계획대로 계산하기`를 누르면 화면의 전체 값이 앞으로 12개월 계획으로 확정된다 (`T37` · AC-010).
 */
const MIN_CARDS = 1
const MAX_CARDS = 3

export default function ConstraintScreen() {
  const router = useRouter()
  const { maxCards, includeNew, changeMaxCards, setIncludeNew, calculate } = useFlow()

  const confirm = () => {
    calculate()
    router.push('/app/result')
  }

  return (
    <Screen screenId="s4" back="/app/plan">
      <span className="badge">05 · 계산 조건</span>
      <h2>{CONSTRAINT_COPY.title}</h2>
      <p className="sub">{CONSTRAINT_COPY.lead}</p>

      <div className="rule">
        <div>
          <b>{CONSTRAINT_COPY.maxCardsLabel}</b>
          <small className="sub">
            {CONSTRAINT_COPY.maxCardsHint[0]}
            <br />
            {CONSTRAINT_COPY.maxCardsHint[1]}
          </small>
        </div>
        <div className="stepper">
          <button
            type="button"
            onClick={() => changeMaxCards(-1)}
            disabled={maxCards <= MIN_CARDS}
            aria-label="최대 카드 수 줄이기"
          >
            −
          </button>
          <b aria-live="polite">{maxCards}</b>
          <button
            type="button"
            onClick={() => changeMaxCards(1)}
            disabled={maxCards >= MAX_CARDS}
            aria-label="최대 카드 수 늘리기"
          >
            ＋
          </button>
        </div>
      </div>

      <div className="rule" style={{ marginTop: 12 }}>
        <div>
          <b>{CONSTRAINT_COPY.newCardLabel}</b>
          <small className="sub">
            {CONSTRAINT_COPY.newCardHint[0]}
            <br />
            {CONSTRAINT_COPY.newCardHint[1]}
          </small>
        </div>
        <div className="choice-group" role="group" aria-label={CONSTRAINT_COPY.newCardLabel}>
          {[
            { value: true, label: CONSTRAINT_COPY.yes },
            { value: false, label: CONSTRAINT_COPY.no },
          ].map((option) => (
            <button
              key={String(option.value)}
              type="button"
              className={includeNew === option.value ? 'choice active' : 'choice'}
              aria-pressed={includeNew === option.value}
              onClick={() => setIncludeNew(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 이중 조건이다 — 하나라도 미달이면 `현재 조합 유지`를 반환한다 (D-002 · AC-004) */}
      <Note>{CONSTRAINT_COPY.gate(krw(NET_BENEFIT_FLOOR), Math.round(NET_BENEFIT_RATIO * 100))}</Note>

      <Actions>
        <PrimaryButton onClick={confirm}>{CONSTRAINT_COPY.cta}</PrimaryButton>
      </Actions>
    </Screen>
  )
}
