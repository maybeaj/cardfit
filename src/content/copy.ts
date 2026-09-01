/**
 * 화면 카피 외부화 파일.
 * 경계 문구·면책·금지어 사전을 코드에 하드코딩하지 않는다 (AC-003 · T26 · T27 · T31).
 * 금지어 스캔은 이 파일을 기준으로 동작한다.
 */

/** 계산하지 않은 금액까지 포함한 것으로 오해되거나 과거 손실을 확정하는 표현 (T26) */
export const BANNED_TERMS = ['총혜택', '최대혜택', '놓쳤어요', '손해보고 있어요'] as const

export const DATA_NOTICE = {
  mockOnly: '예시 데이터로 동작합니다',
  connectCta: '예시 데이터 연결하기',
  connectDone: '예시 데이터 불러오기 완료',
  connectScope: '불러올 항목은 보유카드와 최근 소비입니다',
  sampleBadge: '예시 수치',
  sampleFootnote: '※ 수치는 예시이며 실제 약관과 다를 수 있습니다',
} as const

export const CURRENT_STATE_NOTICE = {
  basis: '최근 12개월 소비 기준',
  futureNotIncluded: '앞으로의 지출은 아직 반영되지 않았어요',
} as const

export const PLAN_NOTICE = {
  prefilled: '최근 소비 패턴으로 미리 채웠습니다. 달라질 항목만 수정해 주세요',
  emptyBlocked: '확인할 앞으로의 지출이 0건이라 계산하지 않습니다',
  refill: '과거 패턴으로 다시 채우기',
  confirmCta: '이 계획대로 계산하기',
} as const

/**
 * 결론 배너 — 손실의 방향이 결론마다 반대다. 기준선 없는 차액을 화면에 띄우지 않는다 (T26).
 */
export const CONCLUSION_COPY = {
  change: {
    body: (amount: string) => `지금 조합 그대로면 연 ${amount}을 덜 받습니다`,
    caption: (cardCount: number) =>
      `현재 조합 ${cardCount}장을 그대로 쓸 때와 비교 · 확인한 앞으로 12개월 계획 기준`,
  },
  hold: {
    /** 최선 대안의 순혜택이 마이너스일 때 — 바꾸면 실제로 손해다 */
    body: (amount: string) => `지금은 바꾸지 않아도 돼요 · 바꾸면 연 ${amount} 손해예요`,
    /**
     * 최선 대안이 플러스지만 임계에 못 미칠 때.
     * 이 경우 `손해`라고 쓰면 사실과 달라 G3를 깬다 — 구현에서 발견해 SRS로 되돌린 분기다.
     */
    bodyBelowThreshold: (amount: string) =>
      `지금은 바꾸지 않아도 돼요 · 바꿔도 연 ${amount} 차이라 기준에 못 미쳐요`,
    caption: () => '현재 조합과 비교 · 확인한 앞으로 12개월 계획 기준',
  },
  /** T39 — 상한 안에서의 최선임을 밝히고 "최적 조합"으로 단정하지 않는다 */
  boundedOptimum: '사용 카드 2장 · 신규 1장 이내에서의 최선',
  /** T38 — `제약과다`일 때만 노출한다 */
  relaxHint: '제약을 풀면 더 나은 조합이 있어요',
  reviewedTitle: '검토했던 대안',
} as const

export const EVIDENCE_COPY = {
  fields: ['실적구간', '혜택한도', '연회비', '제외조건', '기준일', '미반영 항목'] as const,
  unmodeledTitle: '계산에 포함되지 않은 항목',
  unmodeledRule: '아래 금액은 약관에 명시된 상한이며 위의 결론 차액에 더하지 않았습니다',
  /** 실적 산정 방식의 단순화를 고지한다 */
  qualifyingModel:
    '실적구간(전월 사용액에 따라 달라지는 적립·할인율 단계)은 그 달에 이 카드로 배분된 금액으로 판정했습니다',
  annualFeeWholeWindow: '연회비는 안분하지 않고 12개월 창에 통째로 반영했습니다',
  staleAsOf: '적용 기준일이 오래되어 약관이 변경되었을 수 있습니다',
  disclaimer: '계산 결과는 참고용이며 실제 혜택은 카드사 약관·심사에 따릅니다',
  applyCta: '이 조합 적용하기',
} as const

/** AC-003 · T27 — 실행 경계. 대행하지 않고 고지만 한다 */
export const BOUNDARY_COPY = {
  headline: 'CardFit의 실행 경계',
  direct: '신청·해지는 카드사에서 직접 진행하셔야 합니다',
  outlinkNote: '새 카드 신청은 카드사 공식 페이지로 이동만 제공하고, 신청을 대신 진행하지 않습니다',
  newCardRisk: '카드사 심사로 거절될 수 있습니다',
  removeRisk: '연회비 환급·포인트 소멸이 있을 수 있으니 카드사에 확인해 주세요',
  keepNote: '그대로 계속 사용하세요',
  frozen: '확정한 조합은 확정 시점의 규칙 버전·기준일·금액으로 얼려 보관합니다',
  expired: '약관이 변경되었을 수 있습니다 · 다시 계산하기',
} as const

export const STATUS_COPY = {
  신규: { label: '신규', note: '현재 없지만 앞으로의 조합에 추가' },
  유지: { label: '유지', note: '현재 보유 중이며 앞으로도 사용' },
  정리: { label: '정리', note: '현재 보유 중이지만 앞으로의 조합에서 제외' },
} as const

export const CALC_NOTICE = {
  engine: '금액과 설명 모두 카드 혜택 규칙과 고정 문구로 처리합니다. 생성형 AI를 쓰지 않습니다',
  steps: [
    '확인한 12개월 계획 펼치기',
    '카드별 실적·한도·제외조건 적용',
    '조합 후보 만들기 (사용 2장 · 신규 1장 이내)',
    '순혜택 임계 판정',
  ],
} as const

/** 금지어가 카피에 섞였는지 검사한다 — QA-01-04 */
export function findBannedTerms(text: string): string[] {
  return BANNED_TERMS.filter((term) => text.includes(term))
}
