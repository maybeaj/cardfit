# Technical Spec — CardFit Prototype

> 상태: 🟢 구현 기준본 · 2026-09-01  
> 상위 문서: [`PRD.md`](../PRD.md) · [`SRS.md`](../SRS.md) · [`DESIGN.md`](../../DESIGN.md)

## 1. 구현 목표와 경계

CardFit의 32시간 프로토타입은 사용자가 예시 데이터를 연결하고, 과거 패턴으로 제안된 앞으로 12개월 지출을 확인·수정한 뒤, 최대 2장의 카드 조합과 결제 배분·계산 근거를 확인하는 흐름을 검증한다.

- 포함: `/` 랜딩페이지, `/app/*` iPhone 17 모바일 UI, 데스크톱 반응형, 정적 Fixture, 결정론적 계산, 세션 내 상태 보존, 공식 카드사 페이지 아웃링크, **Vercel 배포**
- 제외: 실제 마이데이터·카드사 API, 로그인, DB, 서버 런타임, 결제·신청·해지 대행, 개인정보 저장, AI 계산
- 계산은 규칙 엔진만 담당한다. 생성형 AI는 런타임 의존성이 아니다.

## 2. 기술 선택

| 영역 | 선택 | 이유 |
| --- | --- | --- |
| 앱 | Next.js App Router + TypeScript (`next 15` · React 19) | 한 저장소에서 랜딩·앱 데모·도메인 로직·배포를 처리 |
| 배포 | Vercel (`framework: nextjs`) | 제출물 3번. 모든 라우트를 정적 프리렌더하고 계산은 브라우저에서 실행 |
| 스타일 | Tailwind CSS + CSS 변수 | 402×874 모바일과 데스크톱을 빠르게 동일 토큰으로 구현 |
| 상태 | React state + `sessionStorage` | 외부 페이지 복귀 시 입력·조합·탭 보존, 서버 저장 없음 |
| 데이터 | TypeScript/JSON Fixture | 실제 연동처럼 오해하지 않도록 Mock을 코드 경계에서 고정 |
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
| `src/app/app/**` | 앱 데모 라우트·화면 조립 | 계산식 직접 작성 |
| `src/components` | 재사용 UI와 접근성 | Fixture 직접 참조 |
| `src/domain` | 순수 계산·타입·상태 전이 | 브라우저 API·카피 |
| `src/fixtures` | 예시 카드·지출·규칙·정답셋 | 실사용자 데이터 |
| `src/content` | 경계 고지·금지어 검사 대상 카피 | 계산 상수 |
| `src/state` | 세션 상태 직렬화·복원 | 영구 저장 |

## 5. 상태와 오류 처리

- 계산 입력은 매번 스냅샷으로 만들고 `rule_version`, `as_of_date`를 함께 저장한다.
- 근거 6항목 중 하나라도 없으면 결과 객체를 만들지 않고 `EVIDENCE_INCOMPLETE`를 반환한다.
- 복원할 수 없는 세션 값은 폐기하고 `FUTURE_PLAN`으로 안전하게 이동한다.
- 금액은 정수 원 단위이며 화면 표시 직전에만 포맷한다.

## 6. 완료 기준

`npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e`, `npm run build`가 통과하고 `AC-001~008·010~014`, `NFR-001~004`이 [`TEST_SPEC.md`](TEST_SPEC.md)의 검증과 연결돼야 한다.

Vercel 배포 URL에서 `/`와 `/app` 흐름을 수동으로 완주하고 콘솔 오류가 0건이어야 `NFR-004`를 통과한다 (`AC-014`).
