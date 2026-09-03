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

/** UI-011 온보딩 — 기준본 s0. 이용 과정 3단계로 무엇을 하는 서비스인지 먼저 알린다. */
export const ONBOARDING_COPY = {
  kicker: '카드 선택이 어려운 순간',
  title: ['앞으로 쓸 돈을 입력하고', '내게 맞는 카드 조합을 찾아보세요.'],
  lead: '앞으로의 지출 계획을 입력해 내게 맞는 신용카드 조합을 찾아보세요.',
  steps: [
    {
      icon: '📊',
      title: '받아온 혜택을 확인해요',
      body: '최근 12개월 소비와 카드 혜택을 한눈에 살펴봅니다.',
    },
    {
      icon: '🗓️',
      title: '앞으로의 지출을 반영해요',
      body: '여행, 예식처럼 예정된 큰 지출을 카드 계산에 더합니다.',
    },
    {
      icon: '✨',
      title: '바꿀 가치가 있을 때만 추천해요',
      body: '현재 조합과 비교한 실질 혜택과 근거를 함께 보여드립니다.',
    },
  ],
  noteTitle: '카드 조합 추천은 1분이면 충분해요.',
  noteBody: '복잡한 카드 조건을 직접 계산하지 않아도 됩니다.',
  cta: '카드조합 추천받기',
} as const

/**
 * UI-012 마이데이터 이용 동의 — 기준본의 바텀시트.
 *
 * 실제 서비스와 같은 이름을 쓰되(`P04-R2`), 화면 안에 프로토타입임을 함께 고지한다.
 * 실제 본인인증·전송요구는 구현하지 않는다 — 체크박스는 동의 구조를 검증하는 UI다.
 */
export const CONSENT_COPY = {
  eyebrow: 'CARDFIT · MYDATA',
  title: '마이데이터 이용 동의하기',
  lead: '카드 조합을 계산하기 위해 필요한 정보만 이용합니다.',
  purpose: {
    label: '이용 목적',
    body: '현재 카드와 최근 소비를 확인하고, 앞으로의 지출 계획에 맞는 카드 조합을 계산합니다.',
  },
  scope: {
    label: '이용 범위',
    body: '보유 카드 정보 · 최근 12개월 결제 내역 · 카드 혜택 조건',
  },
  allLabel: '전체 동의',
  allBody: '아래 필수 항목을 한 번에 선택합니다.',
  items: [
    {
      id: 'collect',
      title: '[필수] 개인정보 수집·이용',
      body: '카드·결제 관련 개인신용정보를 목적 범위에서 이용합니다.',
    },
    {
      id: 'transfer',
      title: '[필수] 개인신용정보 전송요구',
      body: '정보 제공기관에서 CardFit으로 필요한 정보를 전송하도록 요구합니다.',
    },
    {
      id: 'thirdparty',
      title: '[필수] 제3자 제공·처리위탁',
      body: '계산에 필요한 제공받는 자와 처리 범위를 확인합니다.',
    },
  ],
  termLabel: '동의 기간',
  termBody: '1년 · 언제든지 철회할 수 있어요',
  legalNote:
    '이번 화면은 프로토타입용 예시입니다. 실제 서비스에서는 사업자 자격, 전송기관, 정확한 정보 항목·보유기간·약관 전문을 준법/법무 검토 후 확정해야 합니다.',
  detailLink: '전문 보기',
  submit: '마이데이터 이용 동의하기',
  close: '닫기',
} as const

export const CURRENT_STATE_NOTICE = {
  basis: '최근 12개월 소비 기준',
  futureNotIncluded: '앞으로의 지출은 아직 반영되지 않았어요',
  /** UI-001 현재 카드와 혜택 확인 — 기준본 s2 */
  title: '지금 가지고 있는 카드부터 살펴볼게요.',
  lead: '최근 12개월 동안의 카드 사용 흐름을 한눈에 확인해보세요.',
  spendLabel: '최근 12개월 지출액',
  benefitLabel: '최근 12개월 받은 혜택',
  benefitCaption: '결제내역과 카드 혜택 기준을 대조한 계산값',
  cardsHeading: '보유 카드',
  cardsLead: '카드를 누르면 주요 혜택을 자세히 확인할 수 있어요.',
  benefitNotice:
    '받은 혜택은 결제내역과 카드 혜택 기준을 대조한 예시 계산값입니다. 카드사가 확정한 실적·청구 할인액과 다를 수 있어요.',
  cta: '앞으로 쓸 돈 반영하기',
  hide: '숨기기',
  show: '보기',
  masked: '••••••••',
  lowestTier: '실적 구간이 최저 단계에 머물러 있습니다',
} as const

export const PLAN_NOTICE = {
  prefilled: '최근 소비 패턴으로 미리 채웠습니다. 달라질 항목만 수정해 주세요',
  emptyBlocked: '확인할 앞으로의 지출이 0건이라 계산하지 않습니다',
  refill: '과거 패턴으로 다시 채우기',
  confirmCta: '이 계획대로 계산하기',
  /** UI-002 미래지출 입력 — 기준본 s3 */
  title: '예상되는 지출액을 입력해주세요.',
  lead: '앞으로 늘어날 지출만 확인해 주세요.',
  addItem: '＋ 지출 항목 추가',
  addCategoryTitle: '추가할 지출 카테고리',
  addCategoryCta: '이 항목 추가',
  addCategoryNote: '마일리지는 카드별 적립 기준이 달라 이번 프로토타입에서는 제외했습니다.',
  emptyMessage: '앞으로 쓸 돈을 입력하면 카드 조합을 확인할 수 있어요.',
  remove: '삭제',
  next: '다음',
  skip: '이 단계 건너뛰기',
} as const

/** UI-003 변경 조건 — 기준본 s4. 상한은 T11(사용 카드 3장·신규 1장)을 따른다. */
export const CONSTRAINT_COPY = {
  title: '어느 정도까지 바꿔도 괜찮나요?',
  lead: '불필요하게 카드를 늘리지 않도록 계산 조건을 확인합니다.',
  maxCardsLabel: '사용 카드 최대 수',
  maxCardsHint: '결과 조합에 포함할 보유 카드 수 · 최대 3장',
  newCardLabel: '신규 카드 포함',
  newCardHint: '더 유리할 때 신규 카드 최대 1장',
  yes: '예',
  no: '아니오',
  gate: (floor: string, ratio: number) =>
    `변경 제안 기준: Net Benefit이 연 ${floor} 이상이고 Gross Benefit의 ${ratio}% 이상일 때만 제안합니다.`,
  confirmNote:
    '여기서 누르면 화면의 전체 값을 앞으로 12개월 지출 계획으로 확인한 것으로 봅니다. 계산 엔진이 이 값을 임의로 늘리거나 줄이지 않습니다.',
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
  boundedOptimum: '사용 카드 3장 · 신규 1장 이내에서의 최선',
  /** T38 — `제약과다`일 때만 노출한다 */
  relaxHint: '제약을 풀면 더 나은 조합이 있어요',
  reviewedTitle: '검토했던 대안',
  /** UI-005 결과 — 기준본 s5 */
  title: '확인한 앞으로 12개월 계획 기준 결과',
  passStatus: '✓ 바꿀 가치가 충분해요',
  holdStatus: '✓ 지금은 바꾸지 않아도 돼요',
  cardStatusHeading: '카드별 상태',
  baselineTitle: '비교 기준선',
  evidenceCta: '계산 근거 보기',
  editPlanCta: '계획 수정하기',
  /**
   * 지출 탐색 — 참고용이며 공식 결론은 `예상대로` 기준이다.
   * 계산을 다시 돌리지 않고 확인한 계획의 배수로 폭만 보여준다.
   */
  scenario: {
    /**
     * 지출 탐색 — 확인한 계획이 예상보다 적거나 많을 때의 결과를 사용자가 직접 눌러 본다.
     * `예상대로`가 확인한 계획 그대로이고 기본값이다. 엔진이 계획을 임의로 바꾸는 것이 아니라
     * 사용자가 고른 가정으로 다시 계산하는 것이라 `T37`(확인한 값을 임의 증감하지 않는다)과 어긋나지 않는다.
     */
    label: '앞으로 12개월 지출이',
    options: [
      { key: 'low', label: '적게', multiplier: 0.72 },
      { key: 'expected', label: '예상대로', multiplier: 1 },
      { key: 'high', label: '많이', multiplier: 1.28 },
    ],
    /** 시나리오를 바꾸면 결론이 뒤집힐 수 있으므로 어떤 가정의 결과인지 밝힌다 */
    assumption: (label: string) => `${label} 지출한다고 가정한 결과예요`,
  },
  /** 결론 상자 — 조합이 받을 절대 혜택을 앞세우고, 현재 조합 대비 증가분을 뱃지로 붙인다 */
  benefit: {
    label: '이 조합으로 받을 수 있는 연간 혜택',
    unit: '연',
    delta: (amount: string) => `현재 카드 조합보다 ${amount} 더 받아요`,
    holdLabel: (scenarioLabel: string) => `${scenarioLabel} 지출하면`,
    holdValue: '현재 조합 유지',
    holdDelta: '바꾸는 비용보다 추가 혜택이 작아요',
    evidenceTrigger: '왜 이 금액인가요? · 근거 보기',
    holdEvidenceTrigger: '유지 이유와 계산 근거 보기',
    sheetTitle: (scenarioLabel: string) => `${scenarioLabel} 지출 시 받을 수 있는 연간 혜택`,
    close: '닫기',
  },
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
  applyCta: '다음 행동 보기',
  /** UI-007 근거 — 기준본 s6 */
  title: '이 결과가 나온 이유',
  lead: '결론 카드마다 다음 6개 근거를 확인합니다. 수치는 예시이며 실제 혜택은 카드사 약관·심사에 따릅니다.',
  notice:
    '미반영 항목은 결론 차액에 합산하지 않습니다. 기준일이 3개월을 초과하면 경고를 표시하되 결과를 자동 무효화하지 않습니다.',
  backToResult: '결과로 돌아가기',
  excludedTitle: '후보에서 제외한 카드',
  checked: '확인',
} as const

/** AC-003 · T27 — 실행 경계. 대행하지 않고 고지만 한다 */
export const BOUNDARY_COPY = {
  headline: 'CardFit의 실행 경계',
  direct: '신청·해지는 카드사에서 직접 진행하셔야 합니다',
  outlinkNote: '새 카드 신청은 카드사 공식 페이지로 이동만 제공하고, 신청을 대신 진행하지 않습니다',
  newCardRisk: '카드사 심사로 거절될 수 있습니다',
  removeRisk: '연회비 환급·포인트 소멸이 있을 수 있으니 카드사에 확인해 주세요',
  keepNote: '그대로 계속 사용하세요',
  frozen: '고른 조합은 고른 시점의 규칙 버전·기준일·금액으로 얼려 보관합니다',
  expired: '약관이 변경되었을 수 있습니다 · 다시 계산하기',
  /** UI-008 조합 선택 — 기준본 s7. `확정`은 신청 대행으로 읽혀 `좋아요`로 바꿨다 (T12) */
  title: '고른 조합과 다음 행동',
  lead: '고른 시점의 금액·기준일·규칙 버전을 기록합니다.',
  actionsHeading: '카드별 다음 행동',
  confirmCta: '이 조합으로 정했어요',
  reviewAgainCta: '다시 검토하기',
  outlinkCta: '공식 페이지로 이동',
  noActionTag: '실행 버튼 없음',
  keepTag: '계속 사용',
  footer:
    '고른 조합은 rule_version·기준일·금액과 함께 동결됩니다. 카드사 공식 링크에서 돌아오면 입력값과 고른 조합을 복원합니다.',
} as const

export const STATUS_COPY = {
  신규: { label: '신규', note: '현재 없지만 앞으로의 조합에 추가' },
  유지: { label: '유지', note: '현재 보유 중이며 앞으로도 사용' },
  정리: { label: '정리', note: '현재 보유 중이지만 앞으로의 조합에서 제외' },
} as const

/**
 * 계산 방식 고지 — 근거 화면에 둔다.
 *
 * `steps`는 계산 중 화면이 진행 단계를 보여주던 문구였는데, 규칙 엔진이 동기라
 * 기다릴 것이 없어 그 화면을 없앴다. 없는 지연을 연출하지 않는다.
 */
export const CALC_NOTICE = {
  engine: '금액과 설명 모두 카드 혜택 규칙과 고정 문구로 처리합니다. 생성형 AI를 쓰지 않습니다',
} as const

/** 금지어가 카피에 섞였는지 검사한다 — QA-01-04 */
export function findBannedTerms(text: string): string[] {
  return BANNED_TERMS.filter((term) => text.includes(term))
}
