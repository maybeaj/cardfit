# CardFit Task 의존성 및 Gantt 계획

> 기준본: `docs/tasks/TASK_LIST.md` 56건 · 시작일: 2026-09-02 · 개발자: 3명

## 계획 가정

- Task당 기본 소요시간은 0.5일이다.
- 주말을 포함해 매일 작업한다.
- 한 개발자는 같은 반일 슬롯에 하나의 Task만 수행한다.
- `TASK_LIST.md`의 선행 Task를 준수한다.
- 실제 구현 중 DB 스키마·규칙 변경이 발생하면 후행 일정은 다시 산정한다.

## 의존성 구조

```mermaid
flowchart LR
    IN[IN-01 기반 구성]
    DS[DS-01 디자인 시스템·AppShell]
    FX[FX-01 Fixture·정답셋]
    TEC1[TEC-01~04 Prisma·Migration·Seed]
    TEC2[TEC-05~06 Server Actions·Repository]
    CE[CE-01 결정론적 계산 엔진]
    FE1[FE-01 온보딩·현재 진단]
    FE2[FE-02 미래지출 입력]
    FE3[FE-03 결과·근거·확정]
    QA1[QA-01 단위·Guardrail 테스트]
    QA2[QA-02 E2E·반응형·측정]
    TEC7[TEC-07 배포 Smoke Test]

    IN --> DS
    IN --> FX
    IN --> TEC1
    FX --> CE
    TEC1 --> TEC2
    TEC1 --> CE
    TEC2 --> FE1
    TEC2 --> FE2
    DS --> FE1
    DS --> FE2
    FX --> FE1
    FX --> FE2
    CE --> FE3
    FE1 --> FE3
    FE2 --> FE3
    CE --> QA1
    FE3 --> QA1
    FE1 --> QA2
    FE2 --> QA2
    FE3 --> QA2
    TEC2 --> TEC7
    QA2 --> TEC7
```

핵심 Critical Path 후보는 다음과 같다.

`IN-01-01 → IN-01-02 → FX-01-01 → FX-01-02 → CE-01-04 → CE-01-05 → CE-01-06 → CE-01-07 → FE-03-03 → FE-03-06 → FE-03-07 → QA-02-03 → QA-02-04`

이는 일정 산정용 대표 경로이며, 실제 Critical Path는 작업 완료 시각과 재작업 여부에 따라 변할 수 있다.

## 개발자 3명 기준 반일 배정 — 56개 전체

아래 표가 56개 원자 Task의 상세 일정이다. 각 날짜의 오전·오후 칸에 개발자 1·2·3의 작업을 모두 기재했으며, `대기·통합 확인·회귀 수정`은 Task가 아니라 의존성 확인과 재작업을 위한 버퍼다.

| 날짜 | 오전 — 개발자 1 / 2 / 3 | 오후 — 개발자 1 / 2 / 3 |
|---|---|---|
| 09-02 (수) | `IN-01-01` / `TEC-01` / 대기·문서 확인 | `IN-01-02` / `IN-01-03` / `IN-01-05` |
| 09-03 (목) | `DS-01-01` / `FX-01-01` / `TEC-02` | `DS-01-02` / `FX-01-02` / `FX-01-03` |
| 09-04 (금) | `DS-01-03` / `DS-01-04` / `FX-01-04` | `DS-01-06` / `DS-01-07` / `FX-01-06` |
| 09-05 (토) | `TEC-03` / `CE-01-01` / 대기·계약 확인 | `TEC-04` / `CE-01-02` / `FE-01-01` |
| 09-06 (일) | `CE-01-03` / `CE-01-04` / `FE-01-03` | `CE-01-05` / `CE-01-10` / `FE-01-04` |
| 09-07 (월) | `CE-01-06` / `CE-01-08` / `FE-01-05` | `CE-01-07` / `CE-01-09` / `FE-02-01` |
| 09-08 (화) | `FE-02-02` / `FE-02-05` / `TEC-05` | `FE-02-03` / 대기·통합 확인 / `TEC-06` |
| 09-09 (수) | `FE-02-06` / `FE-03-01` / `TEC-07` | `FE-03-02` / 통합 확인 / 배포 확인 |
| 09-10 (목) | `FE-03-03` / `FE-03-04` / `QA-01-01` | `FE-03-05` / `QA-01-02` / `QA-01-03` |
| 09-11 (금) | `FE-03-06` / 통합 확인 / 회귀 수정 | `FE-03-07` / `QA-01-04` / 회귀 수정 |
| 09-12 (토) | `QA-02-01` / `QA-02-02` / `QA-02-03` | `QA-02-04` / 최종 검토 / 최종 검토 |

## Gantt 차트 — Workstream 요약

Mermaid 차트는 가독성을 위해 56개 원자 Task를 13개 Workstream 막대로 요약한다. 개별 Task의 실제 배정은 바로 위 반일 표를 기준으로 한다. 주말도 작업일로 포함하므로 회색 주말 제외 영역은 사용하지 않는다.

```mermaid
%%{init: {"theme":"base", "themeVariables": {"primaryColor":"#dbeafe", "primaryTextColor":"#0f172a", "primaryBorderColor":"#64748b", "secondaryColor":"#dcfce7", "tertiaryColor":"#fef3c7", "taskBkgColor":"#bfdbfe", "taskTextColor":"#0f172a", "taskTextOutsideColor":"#0f172a"}}}%%
gantt
    title CardFit 56 Task 실행 계획
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 기반·계약
    IN-01 실행 기반                  :in, 2026-09-02, 2d
    TEC-01~03 DB·Migration            :tec1, 2026-09-02, 3d
    DS-01 디자인 시스템               :ds, 2026-09-03, 2d
    FX-01 Fixture·정답셋              :fx, 2026-09-03, 2d

    section 데이터·엔진
    TEC-04 Mock Seed                 :tec4, 2026-09-05, 1d
    TEC-05~06 서버 경계               :tec56, 2026-09-08, 2d
    CE-01 계산·게이팅·배분             :ce, 2026-09-05, 3d

    section 화면
    FE-01 온보딩·현재 진단             :fe1, 2026-09-05, 3d
    FE-02 미래지출 입력                :fe2, 2026-09-07, 2d
    FE-03 결과·근거·확정               :fe3, 2026-09-09, 3d

    section 검증·배포
    TEC-07 배포 Smoke Test            :tec7, 2026-09-09, 1d
    QA-01 단위·Guardrail               :qa1, 2026-09-10, 2d
    QA-02 E2E·반응형·측정               :qa2, 2026-09-12, 1d
```

## Gantt 차트 — 56개 개별 Task

아래 차트는 각 Task를 하나의 막대로 표현한 상세판이다. 막대의 `0.5d`는 반일 작업을 뜻하며, 개발자 레인별 배정은 위의 반일 표와 동일하다. Task ID를 짧게 표시해 막대 안의 글자가 가려지지 않도록 했다.

```mermaid
%%{init: {"theme":"base", "themeVariables": {"primaryColor":"#bfdbfe", "primaryTextColor":"#0f172a", "primaryBorderColor":"#475569", "taskBkgColor":"#bfdbfe", "taskTextColor":"#0f172a", "taskTextOutsideColor":"#0f172a"}}}%%
gantt
    title CardFit 56개 개별 Task Gantt
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 개발자 1
    IN-01-01 Next.js App Router 초기화 :d1a, 2026-09-02, 0.5d
    IN-01-02 TypeScript·경로 별칭·Vitest 환경 :d1b, 2026-09-02, 0.5d
    DS-01-01 디자인 토큰 정의 :d1c, 2026-09-03, 0.5d
    DS-01-02 모바일 AppShell 구현 :d1d, 2026-09-03, 0.5d
    DS-01-03 데스크톱 AppShell 구현 :d1e, 2026-09-04, 0.5d
    DS-01-06 금액·배지·상태 컴포넌트 :d1f, 2026-09-04, 0.5d
    TEC-03 Prisma Migration 검증 :d1g, 2026-09-05, 0.5d
    TEC-04 12개월 Mock Seed 작성 :d1h, 2026-09-05, 0.5d
    CE-01-03 카드 상태 결정 :d1i, 2026-09-06, 0.5d
    CE-01-05 후보 생성 :d1j, 2026-09-06, 0.5d
    CE-01-06 Gross·비용·Net 계산 :d1k, 2026-09-07, 0.5d
    CE-01-07 5만원·15% 게이팅 :d1l, 2026-09-07, 0.5d
    FE-02-02 지출 추가·수정 폼 :d1m, 2026-09-08, 0.5d
    FE-02-03 지출 삭제·감소·Empty :d1n, 2026-09-08, 0.5d
    FE-02-06 계획 확인 스냅샷 :d1o, 2026-09-09, 0.5d
    FE-03-02 조합안·카드 상태 목록 :d1p, 2026-09-09, 0.5d
    FE-03-03 변경·유지 결론 배너 :d1q, 2026-09-10, 0.5d
    FE-03-05 근거·미반영·신선도 경고 :d1r, 2026-09-10, 0.5d
    FE-03-06 확정·다음 행동·경계 화면 :d1s, 2026-09-11, 0.5d
    FE-03-07 확정 스냅샷·아웃링크·계측 :d1t, 2026-09-11, 0.5d
    QA-02-01 change_case 모바일 E2E :d1u, 2026-09-12, 0.5d
    QA-02-04 추적표·Preview·측정 검증 :d1v, 2026-09-12, 0.5d

    section 개발자 2
    TEC-01 Prisma·Supabase 개발환경 :d2a, 2026-09-02, 0.5d
    IN-01-03 Tailwind·전역 CSS :d2b, 2026-09-02, 0.5d
    FX-01-01 Fixture 타입 정의 :d2c, 2026-09-03, 0.5d
    FX-01-02 카드·혜택 Fixture :d2d, 2026-09-03, 0.5d
    DS-01-04 공통 UI 컴포넌트 :d2e, 2026-09-04, 0.5d
    DS-01-07 키보드 접근성 :d2f, 2026-09-04, 0.5d
    CE-01-01 입력 스냅샷 검증 :d2g, 2026-09-05, 0.5d
    CE-01-02 12개월 계획 생성 :d2h, 2026-09-05, 0.5d
    CE-01-04 실적·한도·제외조건 :d2i, 2026-09-06, 0.5d
    CE-01-10 근거·후보·신선도 검사 :d2j, 2026-09-06, 0.5d
    CE-01-08 카테고리 배분 :d2k, 2026-09-07, 0.5d
    CE-01-09 동률 결정 규칙 :d2l, 2026-09-07, 0.5d
    FE-02-05 카드 수·신규 조건 :d2m, 2026-09-08, 0.5d
    QA-01-02 상태·결정론·동률 테스트 :d2n, 2026-09-10, 0.5d
    QA-02-02 maintain_case 모바일 E2E :d2o, 2026-09-12, 0.5d

    section 개발자 3
    IN-01-05 Playwright·뷰포트 구성 :d3a, 2026-09-02, 0.5d
    TEC-02 Prisma Schema 작성 :d3b, 2026-09-03, 0.5d
    FX-01-03 소비·미래지출 Fixture :d3c, 2026-09-03, 0.5d
    FX-01-04 두 시나리오 정답 Fixture :d3d, 2026-09-04, 0.5d
    FX-01-06 미반영·출처 검증 :d3e, 2026-09-04, 0.5d
    FE-01-01 온보딩·예시 데이터 안내 :d3g, 2026-09-05, 0.5d
    FE-01-03 데이터 불러오기 완료 :d3h, 2026-09-06, 0.5d
    FE-01-04 현재 혜택 요약 :d3i, 2026-09-06, 0.5d
    FE-01-05 현재 카드 진단·CTA :d3j, 2026-09-07, 0.5d
    FE-02-01 미래지출 제안 목록 :d3k, 2026-09-07, 0.5d
    TEC-05 Server Actions 계약 :d3l, 2026-09-08, 0.5d
    TEC-06 Prisma Repository :d3m, 2026-09-08, 0.5d
    FE-03-01 계산 중 상태 :d3n, 2026-09-09, 0.5d
    TEC-07 배포 Smoke Test :d3o, 2026-09-09, 0.5d
    FE-03-04 카드별 배분표 :d3p, 2026-09-10, 0.5d
    QA-01-01 임계·유지·변경 테스트 :d3q, 2026-09-10, 0.5d
    QA-01-03 배분·연회비 경계 테스트 :d3r, 2026-09-10, 0.5d
    QA-01-04 근거·금지어·Guardrail :d3s, 2026-09-11, 0.5d
    QA-02-03 데스크톱·세션 복원 E2E :d3t, 2026-09-12, 0.5d
```

## 일정 판단

- 개발 Task 완료 목표는 2026-09-12이다.
- 09-13~09-14는 통합 오류, DB Seed 재적재, Preview 검증을 위한 버퍼로 둔다.
- `TEC-02` Schema와 `CE-01` 계산 입력 계약이 변경되면 가장 많은 후행 Task가 영향을 받으므로 일정상 위험도가 높다.
- `QA-02-04`는 단순 스크린샷 작업이 아니라 추적표·Guardrail·측정 결과를 최종 확인하는 마감 Task이므로 앞당기지 않는다.
- 대기 슬롯은 불필요한 신규 Task를 추가하는 데 쓰지 않고, 코드리뷰·계약 확인·재작업에 사용한다.

## 재산정 규칙

다음 조건이 발생하면 Gantt를 다시 계산한다.

1. Prisma Schema 또는 Server Actions 계약 변경
2. `CE-01-07` 게이팅 규칙 변경
3. Fixture의 12개월 데이터 구조 변경
4. QA에서 근거 누락·금지어·결정론성 오류 발견
5. 개발자 중 1명 이상이 반일 이상 일정에서 이탈
