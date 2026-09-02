'use client'

import { useRouter } from 'next/navigation'
import { PLAN_NOTICE } from '@/content/copy'
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
    setCategory,
    setAmount,
    setSpendingMonths,
    addSpend,
    removeSpend,
  } = useFlow()

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
                <label className="amount-label" htmlFor={`spendAmount${index}`}>
                  {PLAN_NOTICE.amountLabel}
                </label>
                <div className="amount-field">
                  <input
                    id={`spendAmount${index}`}
                    aria-label={`${item.label} 금액`}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={item.amount}
                    onChange={(event) => setAmount(index, Number(event.target.value))}
                  />
                  <small>{PLAN_NOTICE.amountUnit}</small>
                </div>
              </div>

              {/* 기간 선택이 결과를 바꾼다 — 한 번에 쓰면 첫 달에 월 한도가 걸린다 */}
              <div className="spend-duration">
                <span className="spend-duration-label">{PLAN_NOTICE.durationQuestion}</span>
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

      <Actions>
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
