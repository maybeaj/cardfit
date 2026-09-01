# Technical Spec — CardFit Prototype

> 상태: 🟢 구현 기준본 · 2026-09-01  
> 상위 문서: [`PRD.md`](../PRD.md) · [`SRS.md`](../SRS.md) · [`DESIGN.md`](../../DESIGN.md)

## 1. 구현 목표와 경계

CardFit의 32시간 프로토타입은 사용자가 예시 데이터를 연결하고, 과거 패턴으로 제안된 앞으로 12개월 지출을 확인·수정한 뒤, 최대 2장의 카드 조합과 결제 배분·계산 근거를 확인하는 흐름을 검증한다.

- 포함: `/` 랜딩페이지, `/app/*` iPhone 17 모바일 UI, 데스크톱 반응형, 결정론적 계산, 세션 내 상태 보존, 공식 카드사 페이지 아웃링크, **Vercel 배포**, **Prisma + Supabase Postgres 데이터 계층**, **Server Actions**, **Mock Seed** (`D-011`)
- 제외: 실제 마이데이터·카드사 API 호출, 로그인·인증, 동의 판정, 개인정보 저장, 결제·신청·해지 대행, AI 런타임 호출, Supabase RLS, Cron 배치, 운영 대시보드 (`D-012`)
- 계산은 규칙 엔진만 담당한다. 생성형 AI는 런타임 의존성이 아니다.

## 2. 기술 선택

| 영역 | 선택 | 이유 |
| --- | --- | --- |
| 앱 | Next.js App Router + TypeScript (`next 15` · React 19) | 한 저장소에서 랜딩·앱 데모·도메인 로직·배포를 처리 |
| 배포 | Vercel (`framework: nextjs`) | 제출물 3번. 모든 라우트를 정적 프리렌더하고 계산은 브라우저에서 실행 |
| 스타일 | Tailwind CSS + CSS 변수 | 402×874 모바일과 데스크톱을 빠르게 동일 토큰으로 구현 |
| 상태 | React state + `sessionStorage` | 외부 페이지 복귀 시 입력·확정 조합 보존. 사용자 진행 상태는 서버에 저장하지 않는다 (`ADR-003`) |
| 데이터 | **Prisma 7 + Supabase Postgres (로컬 CLI / Vercel)** | `TEC-01~04`. Mock을 DB Seed로 적재해 실연동 전환 지점을 Repository 하나로 좁힌다 (`D-011`) |
| 서버 경계 | **Server Actions + 서버 전용 Repository** | `TEC-05·06`. 공개 REST 엔드포인트를 만들지 않고, Prisma 접근을 `server-only` 모듈에 격리한다 |
| Mock 원본 | `src/fixtures/*.ts` | Seed의 **입력 소스**로만 쓴다. 화면이 직접 import하지 않는다 — 정답셋(`186,000원`)을 한 곳에서 유지하기 위해 파일을 남긴다 |
| 단위 테스트 | Vitest | 계산 함수의 결정론성과 경계값 검증 |
| E2E | Playwright | Happy Path, 402×874, 데스크톱, 아웃링크 상태 보존 검증 |

새 UI 라이브러리와 상태관리 라이브러리는 도입하지 않는다. 기본 HTML 요소와 작은 로컬 컴포넌트로 충분하지 않을 때만 재검토한다.

## 3. 화면 상태 흐름과 라우트

랜딩과 앱 데모를 한 배포에서 라우트로 나눈다.

| 상태 | 라우트 |
| --- | --- |
| `LANDING` | `/` |
| `ONBOARDING` | `/app` |
| `MOCK_CONNECT` | `/app/connect` |
| `CURRENT_SUMMARY` | `/app/summary` |
| `CURRENT_DIAGNOSIS` | `/app/diagnosis` |
| `FUTURE_PLAN` | `/app/plan` |
| `CONSTRAINT` | `/app/constraint` |
| `CALCULATING` | `/app/calculating` |
| `RESULT` | `/app/result` |
| `EVIDENCE` | `/app/evidence` |
| `CONFIRM` | `/app/confirm` |

- `/`는 앱 데모의 파생물이다. 랜딩에 표시하는 임계·경계 문구·금액 표현은 `src/content/copy.ts`·`src/domain/calc.ts`에서 읽고 새로 만들지 않는다 (`T12`).
- `/app/*`는 `DemoProvider` 하위에서만 동작하며 계획을 확인하지 않은 상태로 `/app/result` 이후에 직접 진입하면 `/app/plan`으로 되돌린다.
- `CURRENT_*`의 금액은 반드시 `최근 12개월 소비 기준`과 `앞으로의 지출은 아직 반영되지 않았어요`를 함께 표시한다.
- `FUTURE_PLAN`에서 전체 제안값을 확인해야 계산할 수 있다. 전부 삭제하거나 모두 0원이면 다음 단계가 비활성이다.
- `RESULT`는 단일 조합안을 보여주며 각 카드에 `신규·유지·정리` 상태를 표시한다.
- `EVIDENCE`에서만 `CONFIRM`으로 이동한다.

## 4. 코드 경계

| 경계 | 책임 | 금지 |
| --- | --- | --- |
| `src/app/page.tsx` | 랜딩페이지 | 앱과 다른 숫자·문구 생성 |
| `src/app/app/**` | 앱 데모 라우트·화면 조립 | 계산식 직접 작성 · Prisma·Fixture 직접 참조 |
| `src/components` | 재사용 UI와 접근성 | Fixture 직접 참조 |
| `src/domain` | 순수 계산·타입·상태 전이 | 브라우저 API·카피·DB |
| **`src/server`** | **Server Actions · 서버 전용 Repository · Prisma Client** | **클라이언트 컴포넌트에서 import · 비밀값을 반환값에 담기** |
| `prisma/` | Schema · Migration · Seed | 실사용자 데이터 |
| `src/fixtures` | Seed의 입력 소스와 정답셋 | 화면에서 직접 import |
| `src/content` | 경계 고지·금지어 검사 대상 카피 | 계산 상수 |
| `src/state` | 세션 상태 직렬화·복원 | 영구 저장 |

`src/domain`은 `Profile` 타입만 받는 순수 함수를 유지한다. Repository가 DB에서 읽어 `Profile`을 조립해 넘기므로 계산 엔진과 UI는 Prisma를 알지 못한다 (`TEC-06`).

## 5. 상태와 오류 처리

- 계산 입력은 매번 스냅샷으로 만들고 `rule_version`, `as_of_date`를 함께 저장한다.
- 복원할 수 없는 세션 값은 폐기하고 `FUTURE_PLAN`으로 안전하게 이동한다.
- 금액은 정수 원 단위이며 화면 표시 직전에만 포맷한다.
- **오류를 성공 결과로 변환하지 않는다** (`TEC-05·06`). Server Action은 아래 상태 코드 중 하나를 반환하고, 화면은 `code`로 상태를 판정하고 `message`·`missing`을 사용자에게 보여준다.

| 상태 코드 | 조건 | 화면 동작 |
| --- | --- | --- |
| `INVALID_PLAN` | 확인할 계획 0건 · 금액 전부 0 · 형식 오류 | 계산 요청 차단, 입력 복구 안내 (`AC-001`) |
| `THRESHOLD_NOT_MET` | Net Benefit 이중 임계 미달 | 현재 조합 유지 — **정상 결과** (`AC-004`) |
| `FIXTURE_UNAVAILABLE` | Seed 조회 실패 | 데이터 오류 표시 |
| `FIXTURE_INVALID` | 기준일·규칙 버전 누락 | 계산 보류 |
| `RULE_INCOMPLETE` | 카드 규칙 일부 누락 | 해당 후보 제외 + 사유 표기 (`T41`) |
| `EVIDENCE_INCOMPLETE` | 결론 카드의 근거 6항목 미달 | 결과·적용 CTA 차단 (`AC-002`) |

오류 응답은 `{ code, message, missing[], retryable }`을 반환한다. `retryable=true`일 때만 재검사 액션을 노출한다. 코드 체계 정본은 [`../diagrams/TECHNICAL_DESIGN.md`](../diagrams/TECHNICAL_DESIGN.md) 6.7절이다.

## 6. 완료 기준

`npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`가 통과하고 `AC-001~008·010~014`, `NFR-001~005`이 [`TEST_SPEC.md`](TEST_SPEC.md)의 검증과 연결돼야 한다.

데이터 계층은 `npx supabase start` → `npm run db:migrate` → `npm run db:seed`가 새 환경에서 같은 결과를 재현해야 한다 (`TEC-03·04`).

Vercel 배포 URL에서 `/`와 `/app` 흐름을 수동으로 완주하고, 콘솔 오류 0건 · 클라이언트 번들에 비밀값 0건이어야 `NFR-005`를 통과한다 (`AC-014` · `TEC-07`).
