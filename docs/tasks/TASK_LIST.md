# Task List — CardFit Prototype

> 정본 순서: PRD → SRS → Spec → Task → GitHub Issue → 구현·검증

기존 `IN/DS/FX/CE/FE/QA-01` 9건은 **Epic**이다. 안전하게 결합 가능한 5개 묶음을 통합한 원자 Task 49건과 기술 제약 보완 Task 7건을 합쳐 총 **56건**으로 관리한다. 한 Task는 한 명이 반나절 안에 구현하거나 검증할 수 있고, 독립적인 완료 증거를 남긴다.

> **기술 제약 보완**: 마이데이터·카드사 데이터 API·AI/Gemini는 사용하지 않는다. 과거 12개월 지출은 Mock Seed로 제공하고, 데이터 접근·변경은 Prisma와 Next.js Server Actions를 사용한다. DB는 Prisma + 로컬 Supabase CLI로 개발하고 배포 시 Supabase PostgreSQL을 사용하며, 배포는 Vercel Git Push 자동 배포를 사용한다.

| ID | Task | Epic | 요구사항 | SRS 단계 | 선행 |
| --- | --- | --- | --- | --- | --- |
| IN-01-01 | Next.js App Router 초기화 | IN-01 | NFR-003 | Step 4 | 없음 |
| IN-01-02 | TypeScript strict·경로 별칭·Vitest 기본 환경 구성 | IN-01 | NFR-001 | Step 3 | IN-01-01 |
| IN-01-03 | Tailwind·전역 CSS 구성 | IN-01 | NFR-003 | Step 4 | IN-01-01 |
| IN-01-05 | Playwright·뷰포트 프로젝트 구성 | IN-01 | NFR-003 | Step 3 | IN-01-01 |
| DS-01-01 | 색상·타이포·간격 토큰 정의 | DS-01 | UI 전체 | Step 2 | IN-01-03 |
| DS-01-02 | iPhone 17 AppShell 구현 | DS-01 | NFR-003 | Step 2 | DS-01-01 |
| DS-01-03 | 데스크톱 반응형 AppShell 구현 | DS-01 | NFR-003 | Step 2 | DS-01-02 |
| DS-01-04 | Header·Progress·Button·Card·Notice 공통 컴포넌트 구성 | DS-01 | UI-001~008 | Step 2 | DS-01-01 |
| DS-01-06 | 금액·배지·상태 컴포넌트 구현 | DS-01 | UI-001·005~007 | Step 2 | DS-01-01 |
| DS-01-07 | 공통 포커스·키보드 접근성 적용 | DS-01 | NFR-003 | Step 4 | DS-01-04 |
| FX-01-01 | 도메인 Fixture 타입 정의 | FX-01 | FR-001~006 | Step 1 | IN-01-02 |
| FX-01-02 | 카드 상품·혜택 규칙 Fixture 작성 | FX-01 | FR-003·005 | Step 1 | FX-01-01 |
| FX-01-03 | 과거 소비·제안 미래지출 Fixture 작성 | FX-01 | FR-001·006 | Step 1 | FX-01-01 |
| FX-01-04 | change_case·maintain_case 정답 Fixture 작성 | FX-01 | AC-004~006 | Step 2 | FX-01-02·03 |
| FX-01-06 | 미반영 상한·출처 Fixture 검증 | FX-01 | AC-002 | Step 3 | FX-01-02 |
| CE-01-01 | 계산 입력 스냅샷 검증기 구현 | CE-01 | AC-001·010 | Step 2 | FX-01-01 |
| CE-01-02 | 12개월 월별 계획 생성기 구현 | CE-01 | FR-002 | Step 2 | CE-01-01 |
| CE-01-03 | 카드별 신규·유지·정리 상태 결정 구현 | CE-01 | AC-005 | Step 2 | CE-01-02 |
| CE-01-04 | 카드별 실적·한도·제외조건 계산 구현 | CE-01 | FR-002·005 | Step 2 | FX-01-02 |
| CE-01-05 | 최대 2장·신규 1장 후보 생성 구현 | CE-01 | FR-003 | Step 2 | CE-01-04 |
| CE-01-06 | Gross·전환비용·Net 계산 구현 | CE-01 | FR-003 | Step 2 | CE-01-05 |
| CE-01-07 | 5만원 AND 15% 게이팅·유지 폴백 구현 | CE-01 | AC-004·AC-013 | Step 2 | CE-01-06 |
| CE-01-08 | 카테고리별 결제 배분 구현 | CE-01 | FR-004 | Step 2 | CE-01-05 |
| CE-01-09 | 동률 결정 규칙 구현 | CE-01 | NFR-001 | Step 2·4 | CE-01-06 |
| CE-01-10 | 근거 6항목·후보 제외·기준일 신선도 검사 구현 | CE-01 | AC-002 | Step 2 | CE-01-04 |
| FE-01-01 | 브랜드 온보딩·예시 데이터 연결 안내 화면 구성 | FE-01 | UI-011~012 | Step 2 | DS-01-02·04 |
| FE-01-03 | 예시 데이터 불러오기 완료 상태 구현 | FE-01 | AC-011 | Step 2 | FX-01-03·FE-01-01 |
| FE-01-04 | 현재 혜택 요약 화면 구현 | FE-01 | UI-001·AC-012 | Step 2 | DS-01-06·FX-01-03 |
| FE-01-05 | 현재 카드 진단·미래 CTA 구현 | FE-01 | UI-001 | Step 2 | FE-01-04 |
| FE-02-01 | 미래지출 제안 목록 화면 구현 | FE-02 | FR-006·UI-002 | Step 2 | DS-01-04·FX-01-03 |
| FE-02-02 | 지출 항목 추가·수정 폼 구현 | FE-02 | FR-001 | Step 2 | FE-02-01 |
| FE-02-03 | 지출 항목 삭제·감소·Empty·다시 채우기 상태 처리 | FE-02 | AC-001·007 | Step 2 | FE-02-02 |
| FE-02-05 | 카드 수·신규 허용 조건 화면 구현 | FE-02 | UI-003 | Step 2 | DS-01-04 |
| FE-02-06 | 계획 확인 스냅샷·이동 구현 | FE-02 | AC-010 | Step 2 | CE-01-01·FE-02-03·05 |
| FE-03-01 | 계산 중 상태 화면 구현 | FE-03 | UI-004 | Step 2 | FE-02-06 |
| FE-03-02 | 단일 조합안·카드 상태 목록 구현 | FE-03 | UI-005·AC-005 | Step 2 | CE-01-03·FE-03-01 |
| FE-03-03 | 변경·유지 결론·비교 기준선 배너 구현 | FE-03 | AC-004·006·013 | Step 2 | CE-01-07·FE-03-02 |
| FE-03-04 | 카드별 결제 배분표 구현 | FE-03 | UI-006 | Step 2 | CE-01-08·FE-03-03 |
| FE-03-05 | 근거 6항목·미반영 상한·신선도 경고 화면 구현 | FE-03 | UI-007·AC-002 | Step 2 | CE-01-10·FE-03-04 |
| FE-03-06 | 확정·다음 행동·경계 화면 구현 | FE-03 | UI-008·AC-003·008 | Step 2 | FE-03-05 |
| FE-03-07 | 확정 스냅샷·아웃링크·sessionStorage·ClientEvent 구현 | FE-03 | FR-008·NFR-004 | Step 2·4 | FE-03-06 |
| QA-01-01 | 임계·유지·변경 단위 테스트 | QA-01 | AC-004·006 | Step 3 | CE-01-07 |
| QA-01-02 | 카드 상태·결정론·동률 단위 테스트 | QA-01 | AC-005·NFR-001 | Step 3 | CE-01-03·09 |
| QA-01-03 | 배분 합·연회비 경계 단위 테스트 | QA-01 | FR-003·004 | Step 3 | CE-01-08 |
| QA-01-04 | 근거 누락·금지어·비밀정보·Guardrail 검사 | QA-01 | AC-002·003·NFR-002·NFR-004 | Step 3 | CE-01-10·FE-03-06 |
| QA-02-01 | change_case 모바일 E2E 작성 | QA-02 | AC 전체 | Step 3 | FE-01~03 |
| QA-02-02 | maintain_case 모바일 E2E 작성 | QA-02 | AC 전체 | Step 3 | FE-01~03 |
| QA-02-03 | 데스크톱·세션 복원 E2E 작성 | QA-02 | AC-008·NFR-003 | Step 3 | FE-03-07 |
| QA-02-04 | 스크린샷·추적표·Preview·측정 검증 | QA-02 | G1~G6·NFR-004 | Step 3·4 | QA-01·QA-02-01~03 |

## 기술 제약 보완 Task — 7건

아래 7개 Task는 압축 후 원자 Task 49건을 대체하거나 병합하지 않는다. `C-TEC-001~004`, `C-TEC-007`을 구현하기 위한 보완 범위다. `C-TEC-005~006`(Vercel AI SDK·Gemini)은 AI를 사용하지 않으므로 기각한다.

| ID | Task | Epic | 요구사항 | SRS 단계 | 선행 |
| --- | --- | --- | --- | --- | --- |
| TEC-01 | Prisma·로컬 Supabase CLI 개발환경 구성 | TEC | C-TEC-003 | Step 1 | IN-01-01 |
| TEC-02 | CardFit 도메인 Prisma Schema 작성 | TEC | C-TEC-003·SRS 6장 | Step 1 | TEC-01 |
| TEC-03 | Prisma Migration 생성·로컬 적용 검증 | TEC | C-TEC-003 | Step 1·3 | TEC-02 |
| TEC-04 | 과거 12개월 지출·카드·혜택 규칙 Mock Seed 작성 | TEC | C-TEC-003·FR-001~006 | Step 1 | TEC-03·FX-01-01~03 |
| TEC-05 | Server Actions 입력·출력·에러 계약 구현 | TEC | C-TEC-002·FR-001~008 | Step 1·2 | TEC-02 |
| TEC-06 | Prisma Repository 및 서버 전용 데이터 접근 계층 구현 | TEC | C-TEC-002·C-TEC-003 | Step 1·2 | TEC-02·TEC-05 |
| TEC-07 | Vercel·Supabase 환경변수·배포 Smoke Test | TEC | C-TEC-007 | Step 4 | TEC-03·TEC-06 |

## UI/UX 상위 그룹 — 11개

UI/UX 그룹은 기존 원자 Task를 삭제하지 않는 상위 분류다. GitHub에서는 Label 또는 Epic으로 연결하고, 아래 그룹 안에 기존 `DS-01`, `FE-01`, `FE-02`, `FE-03` Task를 유지한다.

| 그룹 | 기존 Task 범위 |
| --- | --- |
| UI-01 디자인 토큰·shadcn/ui 테마 | DS-01-01 |
| UI-02 모바일·데스크톱 AppShell | DS-01-02~03 |
| UI-03 공통 UI 컴포넌트 | DS-01-04·06 |
| UI-04 온보딩·예시 데이터 안내 | FE-01-01·03 |
| UI-05 현재 혜택 요약 | FE-01-04 |
| UI-06 현재 카드 진단 | FE-01-05 |
| UI-07 미래지출 제안·입력 | FE-02-01~02 |
| UI-08 Empty·감소·제약·계획 확인 | FE-02-03·05~06 |
| UI-09 계산 결과·카드 상태·결론 | FE-03-01~03 |
| UI-10 결제 배분·근거 | FE-03-04~05 |
| UI-11 확정·실행 경계·복원 | FE-03-06~07 |

## 권장 실행 순서

1. 기반 병렬화: `IN-01-01~03` 완료 후 `DS-01-01~07`과 `TEC-01`을 병렬 진행한다.
2. 데이터 계약: `IN-01-02` 완료 후 `FX-01-01~06`과 `TEC-02`를 진행하고, `TEC-03`으로 Migration을 검증한다.
3. Seed·서버 경계: `TEC-03`과 `FX-01`이 준비되면 `TEC-04`, `TEC-05`, `TEC-06`을 진행한다. `TEC-05`와 `TEC-06`은 서버 경계가 달라 분리한다.
4. 규칙 엔진: `FX-01`과 `TEC-02`가 준비되면 `CE-01-*`을 순서대로 구현·검증한다.
5. 화면 흐름: `DS-01`, `FX-01` 준비 후 `FE-01-*`, `FE-02-*`를 진행하고, `CE-01`과 `FE-02-06` 완료 후 `FE-03-*`을 진행한다.
6. 검증·배포: `CE-01`, `FE-03` 완료 후 `QA-01-*`, `QA-02-*`를 수행하고, 마지막에 `TEC-07`과 Preview Smoke Test를 진행한다.

`DS-01`과 `FX-01`은 `IN-01` 이후 병렬 가능하다. UI 작업은 계산식을 복제하지 않고 `CE-01`의 결과 계약만 소비한다.

## SRS 추출 단계 매핑

아래 단계는 개발 순서가 아니라 SRS에서 Task를 추출한 기준이다. 한 Task가 두 관심사를 함께 다루는 경우 두 단계를 병기한다.

| SRS 추출 단계 | 해당 Task | 추출 기준 |
| --- | --- | --- |
| Step 1 — 계약·데이터 명세 | `FX-01-01~03`, `TEC-01~04` | 도메인 Fixture 타입, 카드·혜택 규칙, 12개월 Mock Seed, Prisma Schema·Migration·개발 DB |
| Step 2 — 로직·상태 변경 | `DS-01-01~06`, `FX-01-04`, `CE-01-01~10`, `FE-01-01·03~05`, `FE-02-01~03·05~06`, `FE-03-01~07`, `TEC-05~06` | 결정론적 계산, Server Actions·Repository, 화면 상태와 사용자 입력·확정 흐름 |
| Step 3 — 완료 조건·테스트 | `IN-01-02`, `IN-01-05`, `FX-01-06`, `QA-01-01~04`, `QA-02-01~04` | Vitest·Playwright 기반, AC·Fixture 근거·Guardrail·반응형·세션 복원 검증 |
| Step 4 — 비기능·의존성 | `IN-01-01·03`, `DS-01-07`, `CE-01-09`, `TEC-07` | Next.js·Tailwind 기반, 접근성·결정론성·Vercel/Supabase 배포 Smoke Test |

`DS-01-07`과 `CE-01-09`처럼 기능 구현과 비기능 제약을 동시에 만족해야 하는 항목은 위 표에서 대표적인 추출 단계를 기준으로 표시했다. AI/Gemini 및 실제 MyData·카드사 API Task는 서비스 범위에서 제외한다.
