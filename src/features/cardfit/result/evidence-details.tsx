'use client'

import { EVIDENCE_COPY, PLAN_NOTICE, STATUS_COPY } from '@/content/cardfit-copy'
import { manwon, percent, won } from '@/domain/cardfit/format'
import type {
  BenefitRule,
  Calculation,
  CardEvidence,
  PlanCandidate,
  Profile,
} from '@/domain/cardfit/types'
import { CARD_ART } from '@/fixtures/mydata/rules'

/**
 * UI-007 전체 근거 — 기준본 s6.
 *
 * 요약 시트(`calculation-basis-sheet.tsx`)와 다른 화면이다. 여기서는 카드마다 실적구간
 * 표와 업종별 조건, 제외조건을 약관과 대조할 수 있는 형태로 편다.
 *
 * **전문 용어를 쉬운 말로 바꾸지 않는다** (`T44`). 바꾸면 사용자가 카드사 약관과
 * 대조할 수 없어 이 화면의 존재 이유가 사라진다. 대신 첫 등장 1회에 한 줄 풀이를 붙인다.
 */

/** 근거 6항목 개요 — 무엇을 확인했는지 먼저 밝히고 카드별 상세로 내려간다 */
const OVERVIEW: Record<(typeof EVIDENCE_COPY.fields)[number], string> = {
  실적구간: '카드별로 전월에 얼마를 써야 혜택이 시작되는지 확인해요.',
  혜택한도: '할인율이 적용되어도 카드별 월 최대 할인액까지만 계산해요.',
  연회비: '신규 카드의 연회비와 기존 카드의 연회비를 비용에 반영해요.',
  제외조건: '상품권·선불충전·취소금액 등 실적과 할인에서 빠지는 거래를 확인해요.',
  기준일: '적용한 약관의 기준일과 규칙 버전을 밝혀요.',
  '미반영 항목': '계산하지 않은 항목의 약관상 상한만 밝히고 결론 차액에 더하지 않아요.',
}

function ruleOf(profile: Profile, row: CardEvidence): BenefitRule | undefined {
  return profile.rules.find(
    (rule) => rule.card_id === row.card_id && rule.rule_version === row.rule_version,
  )
}

/** 실적구간 표 — 구간·적립률·월 한도. 적용된 줄을 표시한다 */
function PerformanceTable({
  rule,
  appliedTier,
}: {
  rule: BenefitRule | undefined
  appliedTier: CardEvidence['applied_tier']
}) {
  const tiers = rule?.tiers ?? []
  if (tiers.length === 0) return null

  return (
    <table className="performance-table">
      <tbody>
        <tr>
          <th>전월 실적</th>
          <th>적립·할인율</th>
          <th>월 한도</th>
        </tr>
        {tiers.map((tier) => {
          const applied =
            appliedTier?.min_monthly_spend === tier.min_monthly_spend &&
            appliedTier?.rate === tier.rate
          return (
            <tr key={`${tier.min_monthly_spend}-${tier.rate}`} className={applied ? 'applied' : ''}>
              <td>{manwon(tier.min_monthly_spend)} 이상</td>
              <td>{percent(tier.rate)}</td>
              <td>월 {won(tier.monthly_cap)}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function CardEvidenceRow({
  row,
  profile,
  candidate,
  index,
  open,
}: {
  row: CardEvidence
  profile: Profile
  candidate: PlanCandidate
  index: number
  open: boolean
}) {
  const card = profile.cards.find((item) => item.card_id === row.card_id)
  const rule = ruleOf(profile, row)
  const art = card ? CARD_ART[card.card_id] : undefined
  const status = candidate.statuses[row.card_id]
  const benefit = candidate.allocations
    .filter((allocation) => allocation.card_id === row.card_id)
    .reduce((sum, allocation) => sum + allocation.benefit, 0)

  return (
    <details className="card-evidence" open={open}>
      <summary>
        {art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art} alt={row.name} />
        ) : (
          <span className={`art tone-${(index % 3) + 1}`} aria-hidden />
        )}
        <span>
          <b>{row.name}</b>
          <small>
            {status ?? ''} · 예상 연간 혜택 {won(benefit)}
          </small>
        </span>
        <span className="open-mark" aria-hidden>
          ⌃
        </span>
      </summary>

      <div className="card-evidence-body">
        <div className="performance-box">
          <span>실적구간</span>
          <strong>
            {row.applied_tier
              ? `전월 ${manwon(row.applied_tier.min_monthly_spend)} 이상부터 ${percent(
                  row.applied_tier.rate,
                )} 적용`
              : '적용 구간 없음'}
          </strong>
        </div>

        <PerformanceTable rule={rule} appliedTier={row.applied_tier} />

        {rule && rule.categories.length > 0 ? (
          <div className="benefit-rule-list">
            {rule.categories.map((category) => (
              <div key={category} className="benefit-rule">
                <span className="rule-icon" aria-hidden>
                  ●
                </span>
                <span>
                  <b>{category}</b>
                  <small>
                    {row.applied_tier ? percent(row.applied_tier.rate) : '적용 구간 없음'}
                  </small>
                </span>
                <strong>{row.monthly_cap ? `월 ${won(row.monthly_cap)}까지` : '한도 확인'}</strong>
              </div>
            ))}
          </div>
        ) : null}

        <div className="benefit-rule-list">
          <div className="benefit-rule">
            <span className="rule-icon" aria-hidden>
              ₩
            </span>
            <span>
              <b>연회비</b>
              <small>{EVIDENCE_COPY.annualFeeWholeWindow}</small>
            </span>
            <strong>{won(row.annual_fee)}</strong>
          </div>
          <div className="benefit-rule">
            <span className="rule-icon" aria-hidden>
              ◷
            </span>
            <span>
              <b>기준일</b>
              <small>{row.rule_version}</small>
            </span>
            <strong>{row.as_of_date}</strong>
          </div>
        </div>

        {row.excluded.length > 0 ? (
          <p className="evidence-caution">꼭 확인하세요: {row.excluded.join(' · ')}</p>
        ) : null}

        {/* 미반영 항목은 약관에 명시된 상한만 적고 결론 차액에 더하지 않는다 (`T7` · `T42`) */}
        {row.unmodeled.length > 0 ? (
          <p className="evidence-caution">
            <b>{EVIDENCE_COPY.unmodeledTitle}</b> · {EVIDENCE_COPY.unmodeledRule}
            <br />
            {row.unmodeled
              .map((item) => `${item.label} 최대 ±${won(item.bound)} (${item.source.as_of_date})`)
              .join(' · ')}
          </p>
        ) : null}

        {card ? (
          <a
            className="official-link"
            href={card.official_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            카드사 공식 혜택 확인 ›
          </a>
        ) : null}
      </div>
    </details>
  )
}

export function EvidenceDetails({
  calculation,
  profile,
  candidate,
}: {
  calculation: Calculation
  profile: Profile
  candidate: PlanCandidate
}) {
  const rows = calculation.evidence.filter((row) => candidate.card_ids.includes(row.card_id))

  return (
    <>
      {/* 어떤 지출을 어떻게 펼쳐 반영했는지 먼저 밝힌다 — 금액의 출발점이다 */}
      <div className="spend-evidence">
        <h3>확인한 지출을 이렇게 반영했어요</h3>
        {calculation.plan_snapshot.map((item) => {
          const span = item.spending_months
          return (
            <div key={item.plan_id} className="spend-evidence-row">
              <b>
                {item.category} · {span === 1 ? PLAN_NOTICE.once : PLAN_NOTICE.months(span)}
              </b>
              <span>
                {span === 1 ? won(item.amount) : `월 ${won(Math.floor(item.amount / span))}씩`}
              </span>
            </div>
          )
        })}
      </div>

      <div className="evidence-six-grid">
        {EVIDENCE_COPY.fields.map((field, index) => (
          <div key={field} className="evidence-six-item">
            <b>
              {String(index + 1).padStart(2, '0')} · {field}
            </b>
            <span>{OVERVIEW[field]}</span>
          </div>
        ))}
      </div>

      <div className="card-evidence-list">
        {rows.map((row, index) => (
          <CardEvidenceRow
            key={row.card_id}
            row={row}
            profile={profile}
            candidate={candidate}
            index={index}
            /* 첫 카드만 펴 둔다 — 전부 접으면 무엇이 있는지 모르고, 전부 펴면 화면이 길다 */
            open={index === 0}
          />
        ))}
      </div>
    </>
  )
}

export { STATUS_COPY }
