# Technical Spec — CardFit Prototype

> 상태: 🟢 구현 기준본 · 2026-09-01  
> 상위 문서: [`PRD.md`](../PRD.md) · [`SRS.md`](../SRS.md) · [`DESIGN.md`](../../DESIGN.md)

## 1. 구현 목표와 경계

CardFit의 32시간 프로토타입은 사용자가 예시 데이터를 연결하고, 과거 패턴으로 제안된 앞으로 12개월 지출을 확인·수정한 뒤, 최대 2장의 카드 조합과 결제 배분·계산 근거를 확인하는 흐름을 검증한다.

- 포함: iPhone 17 기준 모바일 UI, 데스크톱 반응형, 12개월 Mock Seed, Prisma·Supabase 저장, 결정론적 계산, 세션 내 상태 보존, 공식 카드사 페이지 아웃링크
- 제외: 실제 마이데이터·카드사 데이터 API, 로그인, 실사용자 개인정보, 결제·신청·해지 대행, AI 계산·AI 설명
- 계산과 설명은 카드 혜택 Rule 및 고정 템플릿으로 처리한다. 생성형 AI는 런타임 의존성이 아니다.

## 2. 기술 선택

| 영역 | 선택 | 이유 |
| --- | --- | --- |
| 앱 | Next.js App Router + TypeScript | 한 저장소에서 화면·도메인 로직·정적 배포를 처리 |
| 스타일 | Tailwind CSS + shadcn/ui | 402×874 모바일과 데스크톱을 동일 토큰으로 구현 |
| 상태 | React state + `sessionStorage` | 외부 페이지 복귀 시 임시 입력·조합 보존 |
| 데이터 | Prisma + Supabase Seed | 실제 연동 없이 고정된 12개월 Mock을 서버 데이터 경계에 저장 |
| 서버 | Next.js Server Actions | DB 조회·변경·계산 요청을 서버에서 처리; 공개 REST API 없음 |
| 단위 테스트 | Vitest | 계산 함수의 결정론성과 경계값 검증 |
| E2E | Playwright | Happy Path, 402×874, 데스크톱, 아웃링크 상태 보존 검증 |

새 UI 라이브러리와 상태관리 라이브러리는 도입하지 않는다. 기본 HTML 요소와 작은 로컬 컴포넌트로 충분하지 않을 때만 재검토한다.

## 3. 화면 상태 흐름

`LANDING → ONBOARDING → MOCK_CONNECT → CURRENT_SUMMARY → CURRENT_DIAGNOSIS → FUTURE_PLAN → CONSTRAINT → CALCULATING → RESULT → EVIDENCE → CONFIRM`

랜딩페이지와 앱 데모를 한 배포에서 라우트로 나눈다 ([`../diagrams/TECHNICAL_DESIGN.md`](../diagrams/TECHNICAL_DESIGN.md) 7장의 `Landing /` → `App /app` 과 정합).

| 상태 | 라우트 | 대응 |
| --- | --- | --- |
| `LANDING` | `/` | `UI-013` |
| `ONBOARDING` · `MOCK_CONNECT` | `/app` · `/app/connect` | `UI-011` · `UI-012` |
| `CURRENT_SUMMARY` · `CURRENT_DIAGNOSIS` | `/app/summary` · `/app/diagnosis` | `UI-001` |
| `FUTURE_PLAN` · `CONSTRAINT` | `/app/plan` · `/app/constraint` | `UI-002` · `UI-003` |
| `CALCULATING` · `RESULT` | `/app/calculating` · `/app/result` | `UI-004`~`UI-006` |
| `EVIDENCE` · `CONFIRM` | `/app/evidence` · `/app/confirm` | `UI-007` · `UI-008` |

- `/`는 앱 데모의 파생물이다. 랜딩에 표시하는 임계·경계 문구·금액 표현은 `src/content/copy.ts`·`src/domain/calc.ts`에서 읽고 랜딩에만 있는 숫자를 만들지 않는다 (`T12`).

- `CURRENT_*`의 금액은 반드시 `최근 12개월 소비 기준`과 `앞으로 쓸 돈을 반영하면 내게 맞는 카드 조합을 확인할 수 있어요`를 함께 표시한다.
- `FUTURE_PLAN`에서 전체 제안값을 확인해야 계산할 수 있다. 전부 삭제하거나 모두 0원이면 다음 단계가 비활성이다.
- `RESULT`는 단일 조합안을 보여주며 각 카드에 `신규·유지·정리` 상태를 표시한다.
- `EVIDENCE`에서만 `CONFIRM`으로 이동한다.

## 4. 코드 경계

| 경계 | 책임 | 금지 |
| --- | --- | --- |
| `src/app` | 라우트·화면 조립 | 계산식 직접 작성 · Prisma·Fixture 직접 참조 |
| **`src/server`** | **Server Actions · 서버 전용 Repository · Prisma Client** (`TEC-05·06`) | **클라이언트 컴포넌트에서 import · 비밀값을 반환값에 담기** |
| `src/components` | 재사용 UI와 접근성 | Fixture 직접 참조 |
| `src/domain` | 순수 계산·타입·상태 전이 | 브라우저 API·카피·DB |
| `prisma/` | Schema · Migration · Seed | 실사용자 데이터 |
| `src/fixtures` | 규칙·정답셋 및 Seed 원본 | 실사용자 데이터 |
| `src/content` | 경계 고지·금지어 검사 대상 카피 | 계산 상수 |
| `src/state` | 세션 상태 직렬화·복원 | DB 정본을 대체하는 영구 저장 |

## 5. 상태와 오류 처리

- 계산 입력은 매번 스냅샷으로 만들고 `rule_version`, `as_of_date`를 함께 저장한다.
- 근거 6항목 중 하나라도 없으면 결과 객체를 만들지 않고 `EVIDENCE_INCOMPLETE`를 반환한다.
- 복원할 수 없는 세션 값은 폐기하고 `FUTURE_PLAN`으로 안전하게 이동한다.
- 금액은 정수 원 단위이며 화면 표시 직전에만 포맷한다.
- **오류를 성공 결과로 변환하지 않는다** (`TEC-05·06`). Server Action은 아래 상태 코드 중 하나를 반환하고, 화면은 `code`로 상태를 판정하고 `message`·`missing`을 사용자에게 보여준다. 코드 체계 정본은 [`../diagrams/TECHNICAL_DESIGN.md`](../diagrams/TECHNICAL_DESIGN.md) 6.7절이다.

| 상태 코드 | 조건 | 화면 동작 |
| --- | --- | --- |
| `INVALID_PLAN` | 확인할 계획 0건 · 금액 전부 0 · 형식 오류 | 계산 요청 차단, 입력 복구 안내 (`AC-001`) |
| `THRESHOLD_NOT_MET` | Net Benefit 이중 임계 미달 | 현재 조합 유지 — **정상 결과** (`AC-004`) |
| `FIXTURE_UNAVAILABLE` | Seed 조회 실패 | 데이터 오류 표시 |
| `FIXTURE_INVALID` | 기준일·규칙 버전 누락 | 계산 보류 |
| `RULE_INCOMPLETE` | 카드 규칙 일부 누락 | 해당 후보 제외 + 사유 표기 (`T41`) |
| `EVIDENCE_INCOMPLETE` | 결론 카드의 근거 6항목 미달 | 결과·적용 CTA 차단 (`AC-002`) |

오류 응답은 `{ code, message, missing[], retryable }`을 반환한다. `retryable=true`일 때만 재검사 액션을 노출한다.

## 6. 완료 기준

`npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`가 통과하고 `AC-001~008·010~014`, `NFR-001~005`가 [`TEST_SPEC.md`](TEST_SPEC.md)의 검증과 연결돼야 한다. Prisma migration·seed와 Vercel 배포 Smoke Test도 통과해야 한다.
