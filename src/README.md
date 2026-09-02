# src — 프로토타입 소스

> 담당: UX & Build Lead
> **상태: 🟢 스캐폴드 완료 — Next.js App Router + TypeScript + Tailwind CSS v4**

실행·검증·배포 명령은 저장소 루트 [`README.md`](../README.md)의 "프로토타입 실행 방법"에 있습니다.

## 코드 경계

정본은 [`docs/specs/TECH_SPEC.md`](../docs/specs/TECH_SPEC.md) 4절입니다.

| 경계 | 책임 | 금지 |
| --- | --- | --- |
| `app/page.tsx` | `/` 랜딩페이지 | 앱과 다른 숫자·문구 생성 |
| `app/app/**` | `/app/*` 앱 데모 라우트 9개 | 계산식 직접 작성 |
| `components/` | 재사용 UI와 접근성 | Fixture 직접 참조 |
| `domain/` | 순수 계산·타입 (`calculatePlan`·`diagnose`) | 브라우저 API·화면 카피 |
| `fixtures/` | 예시 카드·지출·규칙·정답셋 | 실사용자 데이터 |
| `content/` | 경계 고지·면책·금지어 사전 | 계산 상수 |
| `state/` | 세션 상태 직렬화·복원, `ClientEvent` 로깅 | 서버 전송·영구 저장 |

## 바꿀 때 같이 바꿔야 하는 것

| 코드 | 같은 커밋에서 바꿀 문서 |
| --- | --- |
| `domain/calc.ts` 임계·상수 | `docs/specs/CALC_SPEC.md` · `docs/SCOPE.md` 6-1절 (`D-002`) |
| `fixtures/expected.ts` 기대값 | `docs/specs/FIXTURE_SPEC.md` 2·4절 · `docs/ux/README.md` 4절 |
| `content/copy.ts` 결론·경계 문구 | `docs/ux/README.md` 2-5·2-6절 · `docs/SRS.md` UI-005·FR-008 |
| 라우트 추가·이동 | `docs/ux/README.md` 1절 · `docs/specs/TECH_SPEC.md` 3절 · `docs/SRS.md` 2·4절 |

## 규칙

- `src/**` 변경은 **브랜치 + PR 필수** (문서와 달리 main 직접 커밋 금지)
- 금액은 규칙 엔진이 계산한다. LLM에게 금액을 생성시키지 않는다.
- 디자인 토큰은 `app/globals.css`의 `@theme`에서만 선언한다. 컴포넌트에 원시 hex를 쓰지 않는다.
- `.env`는 커밋하지 않습니다. 현재 프로토타입은 환경변수를 쓰지 않습니다.
