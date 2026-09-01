# CardFit 기술 설계 문서 v0.1

- 기준 문서: `docs/SRS.md`, `docs/specs/CALC_SPEC.md`, `docs/specs/TECH_SPEC.md`, `docs/specs/TEST_SPEC.md`
- 문서 목적: SRS의 요구사항을 구현 가능한 구조, 데이터, 화면 흐름으로 연결
- 범위: Mock Fixture 기반 MVP. 실제 카드사 API·인증·발급 연동은 제외
- 기준일: 2026-09-01

## 1. 설계 원칙과 문서 사용법

CardFit은 먼저 사용자의 앞으로 12개월 지출 계획을 확정하고, 그 계획에 맞춰 카드 조합을 계산한다. 계산 결과는 반드시 근거 6개를 검증한 뒤 공개한다. 근거가 하나라도 없으면 부분 계산으로 결론을 만들지 않고 결과를 보류한다.

| 설계 원칙 | 구현 의미 |
|---|---|
| 미래 계획 우선 | 최근 12개월 소비는 초기 제안의 입력이고, 최종 계산에는 사용자가 확인한 `FutureSpendPlan`만 사용 |
| 결정론적 계산 | 같은 입력·같은 `ruleVersion`이면 같은 결과를 반환 |
| 근거 완전성 | `PerformanceBand`, `BenefitCap`, `AnnualFee`, `Exclusion`, `AsOfDate`, `UnmodeledItem` 6개가 모두 있어야 결론 공개 |
| 안전한 보류 | Net Benefit 게이트 미통과 시 `CURRENT`를 반환하고, 근거 누락 시 `EVIDENCE_INCOMPLETE`를 반환 |
| 실행 경계 분리 | 추천은 CardFit에서, 카드 발급·변경 실행은 카드사 공식 채널에서 수행 |

## 2. Actor와 Use Case

### 2.1 Actor

- **사용자(User)**: 보유 카드와 지출 계획을 확인·수정하고 계산 결과를 검토한다.
- **CardFit UI**: 입력, 검증 상태, 결과, 보류 사유를 표시한다.
- **계산 도메인(Domain)**: 후보 생성, 혜택·비용 계산, Net Benefit 게이트, 상태 판정을 수행한다.
- **Mock Fixture**: 보유 카드·최근 12개월 소비·카드 규칙·근거를 제공한다.
- **카드사 공식 채널(External)**: 신규 카드 신청 등 최종 실행을 담당한다.

### 2.2 Use Case 다이어그램

```mermaid
flowchart LR
  U[사용자]
  UI[CardFit UI]
  F[Mock Fixture]
  D[계산 도메인]
  E[근거 검증기]
  K[카드사 공식 채널]
  U -->|예시 데이터 연결| UI
  UI -->|데이터 조회| F
  U -->|지출 계획 확인·수정| UI
  UI -->|계산 요청| D
  D -->|6개 근거 검증| E
  E -->|공개 가능 / 보류| UI
  U -->|신규 카드 신청| K
  K -->|신청 결과| U
```

### 2.3 주요 Use Case 명세

| ID | Use Case | 사전 조건 | 기본 흐름 | 대체·실패 흐름 |
|---|---|---|---|---|
| UC-01 | 예시 데이터 연결 | 앱 진입 | Fixture 로드 → 기준일·ruleVersion 표시 → 현재 카드 요약 | Fixture 오류 시 오류 상태와 재시도 표시 |
| UC-02 | 미래 지출 계획 확정 | 현재 카드 요약 확인 | 카테고리별 제안 표시 → 사용자가 확인·수정 → 1개 이상 계획 저장 | 모든 값 삭제/0이면 계산 CTA 차단 |
| UC-03 | 카드 조합 계산 | 확정된 계획 존재 | 후보 생성 → 혜택 계산 → 비용 차감 → Net Benefit 게이트 | 게이트 미통과 시 `CURRENT` 유지 |
| UC-04 | 근거 검증 결과 확인 | 계산 결과 존재 | 6개 근거 표시 → 출처·기준일 표시 | 하나라도 누락되면 추천 결과·적용 CTA 차단 |
| UC-05 | 조합 확정 | 공개 가능한 결과 존재 | 조합 저장 → 다음 행동과 실행 경계 표시 | `CURRENT` 카드에는 발급 CTA를 표시하지 않음 |
| UC-06 | 누락 근거 복구 | `EVIDENCE_INCOMPLETE` | 누락 항목 설명 → 정보 보완 → 동일 입력 재계산 | 재검증 전까지 이전 보류 상태 유지 |

## 3. 논리 데이터 모델(ERD)

```mermaid
erDiagram
  SESSION ||--o{ FUTURE_SPEND_PLAN : contains
  SESSION ||--o{ CURRENT_CARD : owns
  SESSION ||--o{ CALCULATION_RUN : requests
  CALCULATION_RUN ||--o{ PLAN_CANDIDATE : produces
  PLAN_CANDIDATE ||--o{ ALLOCATION : distributes
  PLAN_CANDIDATE ||--o{ EVIDENCE_ITEM : proves
  CARD_RULE ||--o{ EVIDENCE_ITEM : sources

  SESSION {
    string sessionId PK
    string fixtureId
    string asOfDate
    string ruleVersion
    datetime createdAt
  }
  CURRENT_CARD {
    string currentCardId PK
    string sessionId FK
    string issuer
    string cardName
    string status
    int annualFee
  }
  FUTURE_SPEND_PLAN {
    string planId PK
    string sessionId FK
    string category
    int monthlyAmount
    string direction
    string source
    boolean confirmed
  }
  CALCULATION_RUN {
    string runId PK
    string sessionId FK
    string basisPeriod
    string status
    int grossBenefit
    int netBenefit
    string holdReason
    datetime calculatedAt
  }
  PLAN_CANDIDATE {
    string candidateId PK
    string runId FK
    string candidateType
    string decision
    int grossBenefit
    int netBenefit
    int confidence
  }
  ALLOCATION {
    string allocationId PK
    string candidateId FK
    string category
    int monthlyAmount
    int expectedBenefit
  }
  CARD_RULE {
    string ruleId PK
    string cardName
    string ruleVersion
    string asOfDate
    string performanceBand
    int benefitCap
    int annualFee
  }
  EVIDENCE_ITEM {
    string evidenceId PK
    string candidateId FK
    string type
    string value
    string sourceUrl
    string sourceDate
    boolean required
    boolean verified
  }
```

### 3.1 핵심 엔터티와 필드 규칙

| 엔터티 | 필수 필드 | 규칙 |
|---|---|---|
| `FutureSpendPlan` | `category`, `monthlyAmount`, `direction`, `confirmed` | 금액은 0 이상 정수. 최종 계산은 `confirmed=true`만 사용 |
| `CalculationRun` | `basisPeriod`, `status`, `grossBenefit`, `netBenefit`, `holdReason` | `basisPeriod`는 MVP에서 최근 12개월. 계산 실패와 게이트 보류를 구분 |
| `PlanCandidate` | `decision`, `grossBenefit`, `netBenefit` | `NEW`, `KEEP`, `ORGANIZE` 중 정확히 하나의 결론 상태 |
| `EvidenceItem` | `type`, `value`, `verified` | 여섯 유형을 모두 갖추지 못하면 공개 불가 |
| `Allocation` | `category`, `monthlyAmount`, `expectedBenefit` | 계획 총액과 카테고리별 배분액의 합을 검증 |

## 4. 클래스·도메인 구조(CLD)

```mermaid
classDiagram
  class SessionState {
    +sessionId: string
    +currentCards: CurrentCard[]
    +futurePlan: FutureSpendPlan[]
    +latestRun: CalculationRun
    +confirmPlan()
    +restoreInputs()
  }
  class FutureSpendPlan {
    +category: string
    +monthlyAmount: number
    +direction: INCREASE|DECREASE
    +confirmed: boolean
  }
  class CalculationService {
    +calculate(input): CalculationRun
  }
  class BenefitCalculator {
    +calculateGrossBenefit(card, plan): number
    +calculateNetBenefit(gross, costs): number
  }
  class CandidateGenerator {
    +generate(currentCards, rules, plan): PlanCandidate[]
  }
  class GatePolicy {
    +passes(netBenefit, grossBenefit): boolean
    +decide(candidate): Decision
  }
  class EvidenceValidator {
    +validate(candidate, rules): EvidenceValidation
    +requiredTypes(): EvidenceType[]
  }
  class ResultPresenter {
    +present(run): ResultViewModel
    +presentHold(reason): HoldViewModel
  }
  SessionState --> FutureSpendPlan
  CalculationService --> CandidateGenerator
  CalculationService --> BenefitCalculator
  CalculationService --> GatePolicy
  CalculationService --> EvidenceValidator
  CalculationService --> ResultPresenter
```

### 4.1 계산 순서

1. `FutureSpendPlan`의 확정 여부와 금액을 검증한다.
2. 후보 카드를 생성하고 카테고리별 `Gross Benefit`을 계산한다.
3. 연회비·재적립 손실·발급 대기 비용을 차감해 `Net Benefit`을 계산한다.
4. `Net Benefit >= 50,000원` 그리고 `Net Benefit >= Gross Benefit × 15%`를 함께 적용한다.
5. 게이트를 통과하지 못하면 `CURRENT` 중심 결과를 생성한다.
6. 후보별 필수 근거 6개를 검증한다.
7. 근거가 완전한 결과만 공개하고, 누락이면 `EVIDENCE_INCOMPLETE`로 보류한다.

## 5. 컴포넌트 다이어그램

```mermaid
flowchart TB
  subgraph Browser[브라우저 / 정적 프로토타입]
    Landing[Landing /]
    App[App /app]
    Input[입력 컴포넌트]
    Result[결과·근거 컴포넌트]
    Store[Session State]
  end
  subgraph Domain[도메인 모듈]
    Fixture[Fixture Repository]
    Calc[Calculation Service]
    Rules[Rule Evaluator]
    Evidence[Evidence Validator]
  end
  subgraph External[외부 경계]
    Official[카드사 공식 신청 페이지]
  end
  Landing --> App
  App --> Input
  Input --> Store
  Store --> Fixture
  Store --> Calc
  Calc --> Rules
  Calc --> Evidence
  Evidence --> Result
  Result --> Store
  Result -. 신규 카드 실행 .-> Official
```

구현 시 UI는 계산 규칙을 직접 소유하지 않는다. UI는 입력과 표시를 담당하고, `CalculationService`가 도메인 결과와 `holdReason`을 반환한다. 이를 통해 같은 계산 규칙을 테스트와 화면에서 공유할 수 있다.

## 6. 대표 Sequence Diagram

### 6.1 정상 계산과 결과 공개

```mermaid
sequenceDiagram
  autonumber
  actor User as 사용자
  participant UI as CardFit UI
  participant State as Session State
  participant Fixture as Mock Fixture
  participant Calc as CalculationService
  participant Validator as EvidenceValidator

  User->>UI: 예시 데이터 연결
  UI->>Fixture: 현재 카드·최근 12개월 소비·규칙 조회
  Fixture-->>UI: fixture + ruleVersion + asOfDate
  UI-->>User: 현재 카드 요약과 미래 지출 제안 표시
  User->>UI: 계획 수정 후 확인
  UI->>State: confirmed FutureSpendPlan 저장
  User->>UI: 계획대로 계산하기
  UI->>Calc: 계산 요청(plan, cards, rules)
  Calc->>Calc: 후보 생성·혜택·비용·Net Benefit 계산
  Calc->>Validator: 후보별 근거 6개 검증
  Validator-->>Calc: COMPLETE
  Calc-->>UI: 공개 가능한 PlanCandidate + Evidence
  UI-->>User: 추천/유지/정리 상태와 배분 표시
```

### 6.2 근거 누락·복구

```mermaid
sequenceDiagram
  actor User as 사용자
  participant UI as CardFit UI
  participant Calc as CalculationService
  participant Validator as EvidenceValidator
  participant State as Session State

  User->>UI: 결과 확인
  UI->>Validator: 후보의 근거 6개 검증
  Validator-->>Calc: INCOMPLETE(예: AnnualFee 누락)
  Calc-->>UI: 결과 비공개 + holdReason=EVIDENCE_INCOMPLETE
  UI-->>User: 누락 항목·사유·복구 방법 표시
  User->>UI: 연회비 근거 보완
  UI->>State: EvidenceItem 저장
  User->>UI: 다시 검사
  UI->>Calc: 동일 입력으로 재계산
  Calc->>Validator: 근거 6개 재검증
  Validator-->>Calc: COMPLETE
  Calc-->>UI: 결과 공개 + 적용 CTA 활성화
```

## 7. 화면 및 상태 Flow Chart

```mermaid
flowchart TD
  A[Landing /] --> B[App /app 진입]
  B --> C[예시 데이터 연결]
  C --> D{미래 지출 계획이<br/>1개 이상이고 금액이 0보다 큰가?}
  D -- 아니오 --> E[계산 CTA 비활성화<br/>입력 필요 안내]
  E --> C
  D -- 예 --> F[계획 확인·수정]
  F --> G[12개월 계획 확정]
  G --> H[후보 생성·Net Benefit 계산]
  H --> I{Net Benefit 게이트 통과?}
  I -- 아니오 --> J[현재 조합 유지<br/>hold_reason=THRESHOLD_NOT_MET]
  I -- 예 --> K[근거 6개 검증]
  K --> L{6개 모두 존재·검증됨?}
  L -- 아니오 --> M[추천·적용 CTA 차단<br/>누락 사유 표시]
  M --> N[근거 보완]
  N --> H
  L -- 예 --> O[결과·근거·배분 공개]
  O --> P{사용자가 조합 확정?}
  P -- 아니오 --> F
  P -- 예 --> Q[확정 요약·다음 행동]
  Q --> R[카드사 공식 채널에서 직접 실행]
```

## 8. API·인터페이스 개요

MVP에서는 실제 HTTP 서버 대신 동일한 계약을 가진 함수/Mock Repository로 시작한다. 추후 API 서버로 분리할 때도 요청·응답 구조는 유지한다.

| 인터페이스 | 입력 | 출력 | 제약 |
|---|---|---|---|
| `GET /api/fixtures/:fixtureId` | `fixtureId` | currentCards, pastSpend(12개월), rules, asOfDate, ruleVersion | 외부 개인정보·실결제 연동 없음 |
| `POST /api/sessions/:id/future-plan` | plans[] | normalized plans, validation | 금액 정수·0 이상, category 중복 병합 |
| `POST /api/calculations` | sessionId, confirmedPlan, cards | runId, candidates, status, holdReason, evidence | 미확정 계획은 거부 |
| `GET /api/calculations/:runId/evidence` | runId | six evidence items, source metadata | 누락 시 `EVIDENCE_INCOMPLETE` |
| `POST /api/sessions/:id/confirm` | candidateId | confirmation summary | `COMPLETE` 결과만 확정 가능 |

### 오류 계약

```json
{
  "code": "EVIDENCE_INCOMPLETE",
  "message": "필수 근거가 모두 확인되지 않아 추천 결과를 보류했습니다.",
  "missing": ["AnnualFee"],
  "retryable": true
}
```

## 9. SRS 추적성 및 배치 위치

| SRS 항목 | 설계 문서 위치 |
|---|---|
| FR-001 미래 지출 입력 | Use Case UC-02, `FutureSpendPlan`, 화면 Flow A~G |
| FR-002 12개월 기준 혜택 계산 | 계산 순서 1~3, `CalculationRun.basisPeriod` |
| FR-003 Net Benefit 게이트 | 계산 순서 4~5, Flow H~J |
| FR-004 결제수단 배분 | `Allocation`, 정상 Sequence의 결과 표시 |
| FR-005 계산 근거 공개 | Evidence ERD, 정상 화면의 근거 6개 |
| FR-006 초기값 자동 제안 | UC-02, Fixture → UI 흐름 |
| FR-007 이벤트 변수 입력 | `FutureSpendPlan` 확장 필드로 관리; MVP에서는 제한적 |
| FR-008 조합 확정·실행 경계 | UC-05, Component의 Official 경계 |
| AC-001 입력 0건 차단 | Flow D~E |
| AC-002 근거 6개 완전성 | Flow K~N, Sequence 6.2 |
| AC-004 게이트 미통과 | Flow I~J |

SRS의 사용자 흐름 챕터에는 이 문서의 **7장 Flow Chart**를, 계산·근거 챕터에는 **6.1 정상 Sequence**와 **6.2 누락·복구 Sequence**를 배치하는 것을 권장한다. 실제 화면을 확인하려면 [CardFit 근거 검증 화면 프로토타입](../prototype/cardfit-evidence-flow.html)을 연다.

## 10. 구현·검증 체크리스트

- [ ] `FutureSpendPlan.confirmed`가 아닌 값이 계산에 들어가지 않는지 확인
- [ ] 최근 12개월 기준 문구와 “앞으로의 지출은 아직 반영되지 않았어요” 문구 표시
- [ ] 후보마다 근거 6개를 표시하고, 하나 제거 시 결과가 공개되지 않는지 확인
- [ ] `unmodeled_bound`가 순이익 계산에 더해지지 않는지 확인
- [ ] `THRESHOLD_NOT_MET`와 `EVIDENCE_INCOMPLETE`를 서로 다른 화면 상태로 표시
- [ ] `CURRENT`와 `KEEP` 결과에 신규 발급 CTA가 노출되지 않는지 확인
- [ ] 브라우저 새로고침 전후 세션 상태 복구 여부를 결정하고 테스트에 반영
- [ ] SRS AC-001, AC-002, AC-004, AC-005, AC-006, AC-008을 구현 테스트와 연결

## 12. 다이어그램 우선순위

아래 순서는 “개발 전에 반드시 합의해야 하는 설계”에서 “구현 중 상세화해도 되는 설계” 순서다.

| 우선순위 | 다이어그램 | 이유 | SRS 반영 후보 |
|---|---|---|---|
| P0 | 화면·상태 Flow Chart | 입력 0건, 게이트 미통과, 근거 누락 시 제품이 어떻게 멈추는지 결정한다. | 2장 핵심 사용자 흐름, AC-001·002·004 |
| P0 | 정상·누락 Sequence Diagram | UI·계산 도메인·근거 검증기의 책임과 결과 공개 조건을 고정한다. | 2장 흐름, 3장 FR-003·005 |
| P0 | ERD | 계산 결과와 근거를 어떤 데이터로 보존할지 결정한다. `EvidenceItem` 누락 여부가 핵심이다. | 4장 데이터·계산 규칙 |
| P1 | Component Diagram | 정적 프로토타입에서 도메인 모듈로 확장할 때 책임 경계를 명확히 한다. | 6장 UI·아키텍처 개요 |
| P1 | Use Case Diagram | 사용자·Mock Fixture·외부 카드사 채널의 시스템 경계를 설명한다. | 2장 사용자 흐름, 7장 제약 |
| P2 | CLD | 클래스와 메서드 수준의 구현 구조를 구체화한다. 도메인 테스트 작성 시 유용하다. | SRS 본문보다는 구현 설계 문서에 유지 |

### 검토 권장 순서

1. P0 Flow Chart에서 사용자에게 결과를 보여주거나 보류하는 조건을 확인한다.
2. P0 Sequence Diagram에서 각 조건을 어느 컴포넌트가 판단하는지 확인한다.
3. P0 ERD에서 판단에 필요한 필드와 근거 6개가 충분한지 확인한다.
4. P1 Use Case·Component로 시스템 경계와 화면 범위를 확인한다.
5. 마지막으로 P2 CLD의 클래스·메서드가 실제 구현 단위로 적절한지 검토한다.
