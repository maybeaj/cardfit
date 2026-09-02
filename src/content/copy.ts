/**
 * 화면 카피 외부화 파일.
 * 경계 문구·면책·금지어 사전을 코드에 하드코딩하지 않는다 (AC-003 · T26 · T27 · T31).
 * 금지어 스캔은 이 파일을 기준으로 동작한다.
 *
 * 문구의 정본은 `docs/prototype/cardfit-prd-srs-v0.4.html`이다 (`D-011`).
 * 화면과 기준본이 다르면 기준본이 옳다.
 */

/** 계산하지 않은 금액까지 포함한 것으로 오해되거나 과거 손실을 확정하는 표현 (T26) */
export const BANNED_TERMS = ['총혜택', '최대혜택', '놓쳤어요', '손해보고 있어요'] as const

export const DATA_NOTICE = {
  mockOnly: '프로토타입에서는 예시 데이터로 카드 조합을 확인해볼 수 있어요',
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

/** UI-001 현재 카드와 혜택 확인 — 기준본 s2. 관찰된 사실만 노출한다 (`T5`) */
export const CURRENT_STATE_NOTICE = {
  title: ['지금 가지고 있는 카드부터', '살펴볼게요.'],
  lead: '최근 12개월 동안의 카드 사용 흐름을 한눈에 확인해보세요.',
  spendLabel: '최근 12개월 지출액',
  benefitLabel: '최근 12개월 받은 혜택',
  benefitCaption: '결제내역과 카드 혜택 기준을 대조한 계산값',
  cardsHeading: '보유 카드',
  cardsLead: '카드를 누르면 주요 혜택을 자세히 확인할 수 있어요.',
  cardBenefitTitle: (name: string) => `${name} 주요 혜택`,
  benefitNotice:
    '받은 혜택은 결제내역과 카드 혜택 기준을 대조한 예시 계산값입니다. 카드사가 확정한 실적·청구 할인액과 다를 수 있어요.',
  cta: '앞으로 쓸 돈 반영하기',
  hide: '숨기기',
  show: '보기',
  masked: '••••••••',
} as const

/**
 * UI-002 미래지출 입력 — 기준본 s3.
 *
 * 앞으로 늘어날 지출만 받는다. 증감 토글과 감소 입력은 제공하지 않는다 (`T10`).
 * 빈 폼으로 열지 않는다 — 과거 패턴 기반 제안값이 이미 채워져 있다 (`T3` · FR-006).
 */
export const PLAN_NOTICE = {
  title: '예상되는 지출액을 입력해주세요.',
  lead: '앞으로 늘어날 지출만 확인해 주세요.',
  amountLabel: '추가로 예상되는 금액',
  amountUnit: '만원',
  durationQuestion: '얼마 동안 지출할 예정인가요?',
  once: '한 번에',
  months: (n: number) => `${n}개월`,
  addItem: '＋ 지출 항목 추가',
  remove: '삭제',
  emptyMessage: '앞으로 쓸 돈을 입력하면 카드 조합을 확인할 수 있어요.',
  next: '다음',
  skip: '이 단계 건너뛰기',
  emptyBlocked: '확인할 앞으로의 지출이 0건이라 계산하지 않습니다',
  confirmCta: '이 계획대로 계산하기',
} as const

/** UI-003 변경 조건 — 기준본 s4. 사용 카드 최대 3장 · 신규 최대 1장 */
export const CONSTRAINT_COPY = {
  title: '어느 정도까지 바꿔도 괜찮나요?',
  lead: '계산에 사용할 조건을 확인해 주세요.',
  maxCardsLabel: '최대 카드 수',
  maxCardsHint: ['결과 조합에 포함할 카드 수', '최대 3장'],
  newCardLabel: '신규 카드 포함 여부',
  newCardHint: ['더 유리한 경우에만 포함', '최대 1장'],
  yes: '예',
  no: '아니오',
  gate: (floor: string, ratio: number) =>
    `변경 제안 기준: Net Benefit이 연 ${floor} 이상이고 Gross Benefit의 ${ratio}% 이상일 때만 제안합니다.`,
  cta: '이 계획대로 계산하기',
} as const

/**
 * UI-005 · UI-006 · UI-008 결과 — 기준본 s5.
 * 세 요구사항이 화면 하나 안에 있다. 카드 순위 목록을 만들지 않는다 (`T2`).
 */
export const RESULT_COPY = {
  scenarioLabel: '앞으로 12개월 지출이',
  benefitLabel: '이 조합으로 받을 수 있는 연간 혜택',
  benefitUnit: '연',
  benefitDelta: (amount: string) => `현재 카드 조합보다 ${amount} 더 받아요`,
  evidenceTrigger: '왜 이 금액인가요? · 근거 보기',
  holdLabel: (scenario: string) => `${scenario} 지출하면`,
  holdValue: '현재 조합 유지',
  holdDelta: '바꾸는 비용보다 추가 혜택이 작아요',
  holdEvidenceTrigger: '유지 이유와 계산 근거 보기',
  cardsHeading: '이렇게 사용해 보세요',
  cardsSub: '카드별 예상 연간 혜택',
  cardBenefitLabel: '예상 연간 혜택',
  issuerLink: '카드사 페이지 ›',
  like: '이 조합 좋아요',
  liked: '좋아요를 반영했어요',
  editPlan: '계획 수정하기',
} as const

/** UI-007 요약 근거 — 기준본 `#resultEvidenceModal`. 결과 화면에서만 연다 */
export const RESULT_EVIDENCE_COPY = {
  eyebrow: '계산 근거',
  title: '혜택을 이렇게 계산했어요',
  lead: '선택한 지출 시나리오와 카드 조건을 함께 반영했습니다.',
  summaryLabel: (scenario: string) => `${scenario} 지출 시 받을 수 있는 연간 혜택`,
  lineIncrease: '현재 조합 대비 추가 혜택',
  lineFee: '연회비',
  lineRequalification: '실적 재적립 손실',
  lineWait: '발급 대기 비용',
  lineHorizon: '계산 기준',
  horizonValue: '앞으로 12개월',
  close: '닫기',
  full: '전체 근거 보기',
} as const

/** UI-007 상세 근거 — 기준본 s6. 결론 화면에서만 진입한다 */
export const EVIDENCE_COPY = {
  title: ['카드마다 혜택이', '어떻게 계산됐나요?'],
  lead: '실적구간과 업종별 할인율, 월 한도를 카드 약관 기준으로 쉽게 풀어봤어요.',
  spendHeading: (scenario: string) => `${scenario} 지출을 이렇게 반영했어요`,
  monthlyAmount: (amount: string) => `월 ${amount}씩`,
  performanceLabel: '실적구간',
  cardSummary: (state: string, amount: string) => `${state} · 예상 연간 혜택 ${amount}`,
  cautionPrefix: '꼭 확인하세요: ',
  officialLink: '카드사 공식 혜택 확인 ›',
  notice:
    '표시 금액은 입력한 지출을 바탕으로 계산한 예시입니다. 실제 할인은 카드사 업종 분류, 전월 실적, 승인 순서와 약관 변경에 따라 달라질 수 있어요.',
  backToResult: '결과로 돌아가기',
  /** T31 — 면책. 근거 화면에 함께 둔다 */
  disclaimer: '계산 결과는 참고용이며 실제 혜택은 카드사 약관·심사에 따릅니다',
} as const

/**
 * 결론 배너 문구 — 손실의 방향이 결론마다 반대다. 기준선 없는 차액을 화면에 띄우지 않는다 (T26).
 *
 * 기준본 s5는 `받을 수 있는 연간 혜택 + 현재 조합 대비 차액` 형태로 결론을 말한다.
 * 아래 문장들은 규칙 엔진이 같은 결론을 문장으로 바꿔야 할 때 쓰는 정본이며
 * 금지어 스캔(QA-01-04)의 검사 대상이다.
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
} as const

/**
 * AC-003 · T27 — 실행 경계. 대행하지 않고 고지만 한다.
 *
 * 기준본 s5는 `정리` 카드에 버튼을 두지 않고 배지만 두어 이 경계를 화면 구조로 지킨다.
 * 아래 문구는 실연동에서 고지가 필요해질 때 쓰는 정본이자 금지어 스캔 대상이다.
 */
export const BOUNDARY_COPY = {
  headline: 'CardFit의 실행 경계',
  direct: '신청·해지는 카드사에서 직접 진행하셔야 합니다',
  outlinkNote: '새 카드 신청은 카드사 공식 페이지로 이동만 제공하고, 신청을 대신 진행하지 않습니다',
  newCardRisk: '카드사 심사로 거절될 수 있습니다',
  removeRisk: '연회비 환급·포인트 소멸이 있을 수 있으니 카드사에 확인해 주세요',
  keepNote: '그대로 계속 사용하세요',
  expired: '약관이 변경되었을 수 있습니다 · 다시 계산하기',
} as const

export const STATUS_COPY = {
  신규: { label: '신규', note: '현재 없지만 앞으로의 조합에 추가' },
  유지: { label: '유지', note: '현재 보유 중이며 앞으로도 사용' },
  정리: { label: '정리', note: '현재 보유 중이지만 앞으로의 조합에서 제외' },
} as const

/** 금지어가 카피에 섞였는지 검사한다 — QA-01-04 */
export function findBannedTerms(text: string): string[] {
  return BANNED_TERMS.filter((term) => text.includes(term))
}
