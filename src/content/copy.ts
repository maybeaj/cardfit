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

/**
 * UI-011 온보딩 — v0.5 기준본 s0의 최종 렌더 상태.
 *
 * 아이콘과 부연 문단, 하단 안내 문구를 두지 않는다. 기준본의 `UX review`가 전부
 * 걷어냈고(`.onboarding-copy`와 `.note`는 넣었다가 도로 지운다), 남은 것은
 * 제목·3단계·CTA뿐이다. 첫 화면에서 읽을 것을 줄이는 게 이 화면의 목적이다.
 */
export const ONBOARDING_COPY = {
  kicker: '앞으로의 소비까지 맞춤 계산',
  title: ['예정된 지출에 맞는', '카드 조합을 추천해 드려요'],
  steps: [
    { title: '지금 받은 혜택 확인', body: '최근 소비와 카드 혜택을 살펴봐요.' },
    { title: '예정된 지출 반영', body: '여행이나 예식처럼 큰 지출을 더해요.' },
    { title: '더 나을 때만 추천', body: '바꿨을 때 늘어나는 혜택을 비교해요.' },
  ],
  cta: '내 카드 조합 찾기',
} as const

/**
 * UI-012 마이데이터 이용 동의 — 기준본의 바텀시트.
 *
 * 실제 서비스와 같은 이름을 쓰되(`P04-R2`), 화면 안에 프로토타입임을 함께 고지한다.
 * 실제 본인인증·전송요구는 구현하지 않는다 — 체크박스는 동의 구조를 검증하는 UI다.
 */
export const CONSENT_COPY = {
  /**
   * UI-012 마이데이터 이용 동의 — v0.5 기준본 `#consentModal`의 최종 렌더 상태.
   * 필수 2항목이고 각각 펼침 상세를 가진다. 약관 전문 링크는 두지 않는다 —
   * 없는 문서를 있는 것처럼 열지 않는다.
   */
  eyebrow: '마이데이터 연결',
  title: ['내 카드 정보를', '불러올까요?'],
  lead: '카드와 결제 내역을 불러와 내게 맞는 카드 조합을 계산해요.',
  allLabel: '전체 동의',
  required: '필수',
  items: [
    {
      id: 'collect',
      title: '개인신용정보 수집·이용',
      detailTitle: '수집·이용 안내',
      rows: [
        ['이용 목적', '보유 카드와 결제 내역을 분석해 카드 조합을 계산합니다.'],
        ['이용 항목', '보유 카드 정보, 최근 12개월 결제 내역, 카드 혜택 조건'],
        ['보유 기간', '서비스 연결을 해제하거나 동의를 철회할 때까지'],
      ],
    },
    {
      id: 'transfer',
      title: '개인신용정보 전송요구',
      detailTitle: '전송요구 안내',
      rows: [
        ['전송받는 자', 'CardFit'],
        ['전송 정보', '보유 카드와 결제 내역 등 카드 조합 계산에 필요한 정보'],
        ['전송 방식', '연결한 금융회사에서 CardFit으로 전송'],
        ['철회 방법', '설정에서 언제든지 연결을 해제할 수 있습니다.'],
      ],
    },
  ],
  reassurance: '언제든지 마이데이터 연결을 해제할 수 있어요.',
  legalNoteLabel: '안내',
  legalNote:
    '프로토타입 예시입니다. 실제 전송기관, 정보 항목, 전송 주기와 보유 기간은 서비스 정책 및 준법 검토 후 확정해야 합니다.',
  detailLabel: (title: string) => `${title} 상세보기`,
  submit: '동의하고 계속하기',
  close: '닫기',
  /** 머리의 × — 바닥의 `닫기` 버튼과 이름이 겹치면 무엇을 누르는지 알 수 없다 */
  closeSheet: '시트 닫기',
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
  calculating: '계산하고 있어요',
  /** UI-002 미래지출 입력 — 기준본 s3 */
  title: '예상되는 지출액을 입력해주세요.',
  lead: '앞으로 늘어날 지출만 확인해 주세요.',
  addItem: '＋ 지출 항목 추가',
  addCategoryTitle: '카테고리 선택',
  addCategoryCta: '이 항목 추가',
  addCategoryNote: '마일리지는 카드별 적립 기준이 달라 이번 프로토타입에서는 제외했습니다.',
  categorySheetClose: '닫기',
  amountLabel: '추가로 예상되는 금액',
  amountUnit: '만원',
  /** 만원 단위 입력을 원으로 되읽어 준다 — 840을 8,400,000으로 잘못 넣는 것을 막는다 */
  amountZero: '금액을 입력해 주세요',
  removed: (category: string) => `${category} 항목을 지웠어요`,
  undo: '되돌리기',
  durationQuestion: '얼마 동안 지출할 예정인가요?',
  /** 두 번째 항목부터는 질문을 반복하지 않는다 */
  durationShort: '지출 기간',
  once: '한 번에',
  months: (n: number) => `${n}개월`,
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
  /**
   * 종착 행동 — 누르면 같은 화면에서 `다음에 하면 되는 일`이 펼쳐진다.
   * 별도 확정 화면으로 넘기지 않는다 (SRS UI-008 · FR-008).
   */
  likeCta: '이 조합 선택하기',
  likedCta: '좋아요를 반영했어요',
  editPlanCta: '계획 수정',
  /** 캡션의 카드 장수를 하드코딩하지 않는다 (`T26`) */
  constraintCaption: (maxCards: number, allowNew: boolean) =>
    `최대 ${maxCards}장 · ${allowNew ? '신규 카드 포함' : '보유 카드만'} 조건의 추천 결과`,
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
    /** 결론 카드는 **늘어나는 금액**을 크게 세우고 총액을 보조로 둔다 (v0.5) */
    label: '현재보다 늘어나는 연간 혜택',
    unit: '+',
    delta: (amount: string) => `총 예상 혜택 ${amount}`,
    holdLabel: (scenarioLabel: string) => `${scenarioLabel} 지출하면`,
    holdValue: '현재 조합 유지',
    holdDelta: '바꾸는 비용보다 추가 혜택이 작아요',
    evidenceTrigger: '계산 기준 보기',
    holdEvidenceTrigger: '유지 이유와 계산 근거 보기',
    close: '닫기',
  },
} as const

/**
 * UI-007 계산 기준 요약 바텀시트 — 기준본 `#resultEvidenceModal`.
 *
 * **전체 근거 화면(`/app/evidence`)과 다른 화면이다.** 여기에는 금액이 어떻게 만들어졌는지
 * 한 눈에 보이는 몇 줄만 둔다. 카드별 실적구간 표까지 넣으면 결과를 보다 말고 약관을
 * 읽게 되고, 그럴 거면 상세 화면이 따로 있을 이유가 없다.
 */
export const BASIS_COPY = {
  eyebrow: '계산 근거',
  title: '혜택을 이렇게 계산했어요',
  lead: '선택한 지출 시나리오와 카드 조건을 함께 반영했습니다.',
  summaryLabel: (scenarioLabel: string) => `${scenarioLabel} 지출 시 받을 수 있는 연간 혜택`,
  holdSummaryLabel: (scenarioLabel: string) => `${scenarioLabel} 지출 시 현재 조합의 연간 혜택`,
  lines: {
    increase: '현재 조합 대비 추가 혜택',
    annualFee: '연회비',
    requalificationLoss: '실적 재적립 손실',
    issuanceWaitCost: '발급 대기 비용',
    horizon: '계산 기준',
  },
  horizonValue: '앞으로 12개월',
  close: '닫기',
  closeSheet: '시트 닫기',
  full: '전체 근거 보기',
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
  /**
   * UI-008 다음에 하면 되는 일 — 결과 화면 안에서 펼쳐진다. 별도 확정 화면은 없다.
   * `확정`이라는 단계가 신청·해지 대행으로 읽혀 종착 행동을 선택으로 바꿨다 (`T12`).
   */
  actionsHeading: '다음에 하면 되는 일',
  nextAction: {
    신규: '카드사 공식 페이지에서 직접 신청하세요',
    정리: '해지 전에 연회비 환급·포인트 소멸을 카드사에 확인하세요',
    유지: '그대로 계속 사용하세요',
  },
  outlinkCta: '카드사 페이지 ›',
  /**
   * 경계 고지 (`AC-003`). 아웃링크 수와 해지 실행 버튼 수를 세어 보여준다 —
   * *"해지 버튼을 두지 않는다"*는 약속을 화면이 스스로 증명하게 한다.
   */
  boundary: (outlinks: number) =>
    `신청·해지는 카드사에서 직접 진행하셔야 합니다 · 아웃링크 ${outlinks}개 · 해지 실행 버튼 0개`,
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
