import { ChevronDown, ExternalLink } from 'lucide-react'
import { DATA_NOTICE, EVIDENCE_COPY, STATUS_COPY } from '@/content/cardfit-copy'
import { manwon, percent, won } from '@/domain/cardfit/format'
import type {
  BenefitRule,
  Calculation,
  CardEvidence,
  CardProduct,
  CardStatus,
  PlanCandidate,
  Profile,
} from '@/domain/cardfit/types'
import { CARD_ART } from '@/fixtures/mydata/rules'
import { SampleBadge } from '@/components/shell'

type EvidenceDetailsProps = {
  calculation: Calculation
  profile: Profile
  candidate?: PlanCandidate
}

const OVERVIEW_COPY: Record<(typeof EVIDENCE_COPY.fields)[number], string> = {
  실적구간: '카드별 전월 사용액 단계와 적용률을 확인합니다.',
  혜택한도: '할인율이 적용되어도 월 한도까지만 계산합니다.',
  연회비: '12개월 창에서 비용으로 반영한 연 단위 금액입니다.',
  제외조건: '상품권·공과금 등 계산에서 빠질 수 있는 거래를 확인합니다.',
  기준일: '약관 기준일과 rule_version을 함께 표시합니다.',
  '미반영 항목': '출처 있는 상한만 고지하고 결론 차액에는 더하지 않습니다.',
}

const STATUS_TONE: Record<CardStatus, string> = {
  신규: 'border-[#9cbcff] bg-[#f8fbff] text-[#245cc7]',
  유지: 'border-[var(--color-mint-line)] bg-[#fbfffd] text-[var(--color-positive)]',
  정리: 'border-[#e0d5cf] bg-[#fffdfc] text-[#8a5841]',
}

function resolveCandidate(calculation: Calculation, candidate?: PlanCandidate) {
  return candidate ?? (calculation.decision === '변경' ? calculation.chosen : calculation.current)
}

function sumAllocated(candidate: PlanCandidate, cardId: string) {
  return candidate.allocations
    .filter((row) => row.card_id === cardId)
    .reduce(
      (total, row) => ({
        amount: total.amount + row.amount,
        benefit: total.benefit + row.benefit,
      }),
      { amount: 0, benefit: 0 },
    )
}

function evidenceValue(row: CardEvidence, field: (typeof EVIDENCE_COPY.fields)[number]) {
  switch (field) {
    case '실적구간':
      return row.applied_tier
        ? `${won(row.applied_tier.min_monthly_spend)} 이상 · ${percent(row.applied_tier.rate)}`
        : '적용 구간 없음'
    case '혜택한도':
      return row.monthly_cap === null ? '한도 없음' : `월 ${won(row.monthly_cap)}`
    case '연회비':
      return won(row.annual_fee)
    case '제외조건':
      return row.excluded.length > 0 ? `${row.excluded.length}개 확인` : '없음'
    case '기준일':
      return `${row.as_of_date} · ${row.rule_version}`
    case '미반영 항목':
      return row.unmodeled.length > 0 ? `${row.unmodeled.length}개 고지` : '없음'
  }
}

function uniqueList(items: string[]) {
  return [...new Set(items.filter(Boolean))]
}

function findCard(profile: Profile, evidence: CardEvidence) {
  return profile.cards.find((card) => card.card_id === evidence.card_id)
}

function findRule(profile: Profile, evidence: CardEvidence) {
  return profile.rules.find(
    (rule) => rule.card_id === evidence.card_id && rule.rule_version === evidence.rule_version,
  )
}

function CardArt({ card, index }: { card: CardProduct | undefined; index: number }) {
  const src = card ? CARD_ART[card.card_id] : undefined
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="block h-[33px] w-[52px] rounded-md object-cover shadow-[0_3px_7px_#15223818]"
        src={src}
        alt=""
        width={52}
        height={33}
      />
    )
  }

  return (
    <span
      className={`block h-[33px] w-[52px] rounded-md shadow-[0_3px_7px_#15223818] tone-${
        (index % 3) + 1
      }`}
      aria-hidden
    />
  )
}

function TierTable({
  rule,
  appliedTier,
}: {
  rule: BenefitRule | undefined
  appliedTier: CardEvidence['applied_tier']
}) {
  const tiers = rule?.tiers ?? []
  if (tiers.length === 0) {
    return <p className="evidence-caution">표시할 실적 구간 데이터가 없습니다.</p>
  }

  return (
    <table className="my-2.5 w-full border-collapse text-[8px]">
      <thead>
        <tr>
          <th className="border border-[#e1e8f0] bg-[#f7f9fc] px-1 py-1.5 text-center text-[#526176]">
            전월 실적
          </th>
          <th className="border border-[#e1e8f0] bg-[#f7f9fc] px-1 py-1.5 text-center text-[#526176]">
            적용률
          </th>
          <th className="border border-[#e1e8f0] bg-[#f7f9fc] px-1 py-1.5 text-center text-[#526176]">
            월 한도
          </th>
          <th className="border border-[#e1e8f0] bg-[#f7f9fc] px-1 py-1.5 text-center text-[#526176]">
            상태
          </th>
        </tr>
      </thead>
      <tbody>
        {tiers.map((tier) => {
          const isApplied =
            appliedTier?.min_monthly_spend === tier.min_monthly_spend &&
            appliedTier?.rate === tier.rate
          return (
            <tr key={`${tier.min_monthly_spend}-${tier.rate}-${tier.monthly_cap}`}>
              <td className="border border-[#e1e8f0] px-1 py-1.5 text-center">
                {manwon(tier.min_monthly_spend)} 이상
              </td>
              <td className="border border-[#e1e8f0] px-1 py-1.5 text-center">
                {percent(tier.rate)}
              </td>
              <td className="border border-[#e1e8f0] px-1 py-1.5 text-center">
                월 {won(tier.monthly_cap)}
              </td>
              <td className="border border-[#e1e8f0] px-1 py-1.5 text-center font-bold">
                {isApplied ? '적용' : '대기'}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function BenefitRules({
  rule,
  evidence,
}: {
  rule: BenefitRule | undefined
  evidence: CardEvidence
}) {
  const categories = uniqueList(rule?.categories ?? [])
  if (categories.length === 0) {
    return <p className="evidence-caution">표시할 카테고리 규칙이 없습니다.</p>
  }

  return (
    <div className="grid gap-[7px]">
      {categories.map((category) => (
        <div
          key={category}
          className="grid grid-cols-[29px_minmax(0,1fr)_auto] items-center gap-2 rounded-[10px] bg-[#f8fafc] p-2"
        >
          <span className="grid h-[29px] w-[29px] place-items-center rounded-[9px] bg-white text-[13px]">
            %
          </span>
          <span>
            <b className="block text-[9px]">{category}</b>
            <small className="mt-px block text-[8px] leading-[1.35] text-[var(--color-subtle)]">
              rule_version {evidence.rule_version}의 적용 카테고리
            </small>
          </span>
          <strong className="whitespace-nowrap text-[9px] text-[var(--color-positive)]">
            {evidence.applied_tier ? percent(evidence.applied_tier.rate) : '확인'}
          </strong>
        </div>
      ))}
    </div>
  )
}

function CardEvidenceDetails({
  row,
  card,
  rule,
  candidate,
  index,
}: {
  row: CardEvidence
  card: CardProduct | undefined
  rule: BenefitRule | undefined
  candidate: PlanCandidate
  index: number
}) {
  const status = candidate.statuses[row.card_id]
  const allocated = sumAllocated(candidate, row.card_id)
  const title = card ? `${card.issuer} ${card.name}` : `${row.issuer} ${row.name}`
  const exclusions = uniqueList([...(rule?.excluded ?? []), ...row.excluded])
  const officialUrl = card?.official_url

  return (
    <details
      className="group overflow-hidden rounded-[15px] border border-[#dce5ee] bg-white"
      open={index === 0}
    >
      <summary className="grid cursor-pointer list-none grid-cols-[52px_minmax(0,1fr)_24px] items-center gap-[9px] p-[11px] [&::-webkit-details-marker]:hidden">
        <CardArt card={card} index={index} />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <b className="truncate text-[11px]">{title}</b>
            <SampleBadge label={DATA_NOTICE.sampleBadge} />
          </span>
          <small className="mt-0.5 block text-[9px] text-[var(--color-subtle)]">
            {status ? `${status} · ` : ''}
            {allocated.benefit > 0
              ? `예상 연간 혜택 ${won(allocated.benefit)}`
              : '예상 연간 혜택 산출 없음'}
          </small>
        </span>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#eef3f8] text-[#617086] transition-transform group-open:rotate-180">
          <ChevronDown size={14} aria-hidden />
        </span>
      </summary>

      <div className="border-t border-[#edf1f5] px-[11px] pb-3">
        {status ? (
          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className={`rounded-full border px-2 py-1 text-[9px] font-black ${STATUS_TONE[status]}`}>
              {STATUS_COPY[status].label}
            </span>
            <span className="text-right text-[9px] text-[var(--color-subtle)]">
              {STATUS_COPY[status].note}
            </span>
          </div>
        ) : null}

        <div className="my-2.5 rounded-[11px] bg-[#eef5ff] p-2.5">
          <span className="block text-[9px] text-[#526176]">적용 실적 요약</span>
          <strong className="mt-0.5 block text-[12px] text-[#245cc7]">
            {row.applied_tier
              ? `${won(row.applied_tier.min_monthly_spend)} 이상 구간 · ${percent(
                  row.applied_tier.rate,
                )}`
              : '적용된 실적 구간 없음'}
          </strong>
          <span className="mt-1 block text-[9px] text-[#526176]">
            기준월 사용액 {won(card?.qualifying_month_spend ?? 0)} · 앞으로 12개월 배분{' '}
            {manwon(allocated.amount)}
          </span>
        </div>

        <TierTable rule={rule} appliedTier={row.applied_tier} />
        <BenefitRules rule={rule} evidence={row} />

        <p className="mt-[9px] mb-0 text-[8px] leading-[1.45] text-[#6c7787]">
          꼭 확인하세요: {exclusions.length > 0 ? exclusions.join(' · ') : '제외조건 없음'}
        </p>
        {row.unmodeled.length > 0 ? (
          <p className="mt-1 mb-0 text-[8px] leading-[1.45] text-[#6c7787]">
            미반영 항목:{' '}
            {row.unmodeled
              .map((item) => `${item.label} 최대 ±${won(item.bound)} (${item.source.as_of_date})`)
              .join(' · ')}
          </p>
        ) : null}
        {row.annual_fee_whole_window_notice ? (
          <p className="mt-1 mb-0 text-[8px] leading-[1.45] text-[var(--color-warning)]">
            {EVIDENCE_COPY.annualFeeWholeWindow}
          </p>
        ) : null}
        {officialUrl ? (
          <a
            className="mt-[9px] inline-flex items-center gap-1 text-[8px] font-extrabold text-[var(--color-blue)] no-underline"
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            카드사 공식 혜택 확인
            <ExternalLink size={10} aria-hidden />
          </a>
        ) : null}
      </div>
    </details>
  )
}

export function EvidenceDetails({ calculation, profile, candidate }: EvidenceDetailsProps) {
  const shown = resolveCandidate(calculation, candidate)
  const shownEvidence = calculation.evidence.filter((row) => shown.card_ids.includes(row.card_id))
  const rows = shownEvidence.length > 0 ? shownEvidence : calculation.evidence

  return (
    <>
      <div className="evidence-six-grid">
        {EVIDENCE_COPY.fields.map((field) => {
          const sample = rows[0]
          return (
            <div key={field} className="evidence-six-item">
              <b className="block text-[9px] text-[#245cc7]">{field}</b>
              <span className="mt-[3px] block text-[8px] leading-[1.4] text-[#526176]">
                {OVERVIEW_COPY[field]}
              </span>
              {sample ? (
                <em className="mt-1 block text-[8px] not-italic text-[var(--color-subtle)]">
                  예: {evidenceValue(sample, field)}
                </em>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="mt-[13px] grid gap-[11px]">
        {rows.map((row, index) => (
          <CardEvidenceDetails
            key={row.card_id}
            row={row}
            card={findCard(profile, row)}
            rule={findRule(profile, row)}
            candidate={shown}
            index={index}
          />
        ))}
      </div>

      <p className="footer">
        <b>{EVIDENCE_COPY.unmodeledTitle}</b> · {EVIDENCE_COPY.unmodeledRule}
      </p>
    </>
  )
}
