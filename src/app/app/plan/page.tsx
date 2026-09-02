'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PLAN_NOTICE } from '@/content/copy'
import { krw } from '@/domain/format'
import { CATEGORIES, DURATION_OPTIONS } from '@/fixtures/prototype'
import { Actions, ErrorNote, GhostButton, PrimaryButton, Screen } from '@/components/shell'
import { logEvent } from '@/state/events'
import { useFlow } from '@/state/store'

/**
 * UI-002 미래지출 입력 — 기준본 s3.
 *
 * 빈 폼으로 열지 않는다 (`T3` · FR-006) — 과거 패턴 기반 제안값이 이미 채워져 있다.
 * 증감 토글과 감소 입력은 제공하지 않고 입력 금액을 모두 추가 지출로 계산한다 (`T10`).
 * 이벤트 필수 선택 단계를 두지 않는다 (AC-007).
 */
export default function PlanScreen() {
  const router = useRouter()
  const {
    spends,
    planEmpty,
    planTotal,
    lastRemoved,
    setCategory,
    setAmount,
    setSpendingMonths,
    addSpend,
    removeSpend,
    undoRemove,
    dismissRemoved,
  } = useFlow()

  // 되돌리기 안내는 잠깐만 떠 있는다. 계속 남으면 다음 행동을 가린다
  useEffect(() => {
    if (!lastRemoved) return
    const timer = window.setTimeout(dismissRemoved, 6000)
    return () => window.clearTimeout(timer)
  }, [lastRemoved, dismissRemoved])

  /** 화면에 남아 있는 전체 값이 확인된 계획이 된다 (`T37` · AC-010) */
  const complete = (skipped: boolean) => {
    if (planEmpty) return
    logEvent('입력완료', { itemCount: spends.length, amount: planTotal, skipped })
    router.push('/app/constraint')
  }

  return (
    <Screen screenId="s3" back="/app/summary">
      <span className="badge">04 · 미래 지출 확인</span>
      <h2>{PLAN_NOTICE.title}</h2>
      <p className="sub">{PLAN_NOTICE.lead}</p>

      <div id="spends">
        {spends.map((item, index) => (
          <article key={item.id} className="spend">
            <div className="spend-header">
              <span className="spend-index" aria-hidden>
                {index + 1}
              </span>
              <select
                className="spend-category"
                aria-label={`${item.label} 카테고리`}
                value={item.label}
                onChange={(event) => setCategory(index, event.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="delete-spend"
                onClick={() => removeSpend(index)}
                aria-label={`${item.label} 항목 삭제`}
              >
                {PLAN_NOTICE.remove}
              </button>
            </div>

            <div className="spend-body">
              <div className="spend-controls">
                {/*
                  라벨은 첫 항목에만 보인다. 항목마다 반복하면 같은 문장이 화면을 채워
                  정작 입력값이 안 보인다. 스크린리더에는 `aria-label`로 계속 전달한다.
                */}
                <label
                  className={index === 0 ? 'amount-label' : 'amount-label sr-only'}
                  htmlFor={`spendAmount${index}`}
                >
                  {PLAN_NOTICE.amountLabel}
                </label>
                <div className="amount-field">
                  <input
                    id={`spendAmount${index}`}
                    aria-label={`${item.label} ${PLAN_NOTICE.amountLabel} (${PLAN_NOTICE.amountUnit})`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={item.amount}
                    onChange={(event) => setAmount(index, Number(event.target.value))}
                  />
                  <small>{PLAN_NOTICE.amountUnit}</small>
                </div>
                {/* 만원 단위를 원으로 되읽어 준다 — 840을 8,400,000으로 잘못 넣는 것을 막는다 */}
                <span className="amount-echo" aria-hidden>
                  {item.amount > 0 ? krw(item.amount * 10_000) : PLAN_NOTICE.amountZero}
                </span>
              </div>

              {/* 기간 선택이 결과를 바꾼다 — 한 번에 쓰면 첫 달에 월 한도가 걸린다 */}
              <div className="spend-duration">
                <span className="spend-duration-label">
                  {index === 0 ? PLAN_NOTICE.durationQuestion : PLAN_NOTICE.durationShort}
                </span>
                <div className="duration-options" role="group" aria-label={`${item.label} 지출 기간`}>
                  {DURATION_OPTIONS.map((months) => (
                    <button
                      key={months}
                      type="button"
                      className={item.spendingMonths === months ? 'active' : ''}
                      aria-pressed={item.spendingMonths === months}
                      onClick={() => setSpendingMonths(index, months)}
                    >
                      {months === 1 ? PLAN_NOTICE.once : PLAN_NOTICE.months(months)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <button type="button" className="secondary add-spend-button" onClick={addSpend}>
        {PLAN_NOTICE.addItem}
      </button>

      {/* 확인할 미래 계획이 0건이면 결과를 반환하지 않는다 (G2 · AC-001) */}
      {planEmpty ? <ErrorNote>{PLAN_NOTICE.emptyMessage}</ErrorNote> : null}

      {/* 삭제는 확인 없이 되지만 되돌릴 수 있다 — 다시 입력하게 만들지 않는다 */}
      {lastRemoved ? (
        <div className="undo-bar" role="status">
          <span>{PLAN_NOTICE.removed(lastRemoved.item.label)}</span>
          <button type="button" onClick={undoRemove}>
            {PLAN_NOTICE.undo}
          </button>
        </div>
      ) : null}

      <Actions sticky>
        <GhostButton disabled={planEmpty} onClick={() => complete(true)}>
          {PLAN_NOTICE.skip}
        </GhostButton>
        <PrimaryButton disabled={planEmpty} onClick={() => complete(false)}>
          {PLAN_NOTICE.next}
        </PrimaryButton>
      </Actions>
    </Screen>
  )
}
