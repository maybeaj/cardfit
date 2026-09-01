# CardFit Task 의존성 및 Gantt 계획

> 기준본: `docs/tasks/TASK_LIST.md` 56건 · 시작일: 2026-09-02 · 개발자: 3명

## 계획 가정

- Task당 기본 소요시간은 0.5일이다.
- 평일만 작업하며 주말은 버퍼로 둔다.
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

## 개발자 3명 기준 반일 배정

| 날짜 | 오전 — 개발자 1 / 2 / 3 | 오후 — 개발자 1 / 2 / 3 |
|---|---|---|
| 09-02 (수) | `IN-01-01` / `TEC-01` / 대기·문서 확인 | `IN-01-02` / `IN-01-03` / `IN-01-05` |
| 09-03 (목) | `DS-01-01` / `FX-01-01` / `TEC-02` | `DS-01-02` / `FX-01-02` / `FX-01-03` |
| 09-04 (금) | `DS-01-03` / `DS-01-04` / `FX-01-04` | `DS-01-06` / `DS-01-07` / `FX-01-06` |
| 09-07 (월) | `TEC-03` / `CE-01-01` / 대기·계약 확인 | `TEC-04` / `CE-01-02` / `FE-01-01` |
| 09-08 (화) | `CE-01-03` / `CE-01-04` / `FE-01-03` | `CE-01-05` / `CE-01-10` / `FE-01-04` |
| 09-09 (수) | `CE-01-06` / `CE-01-08` / `FE-01-05` | `CE-01-07` / `CE-01-09` / `FE-02-01` |
| 09-10 (목) | `FE-02-02` / `FE-02-05` / `TEC-05` | `FE-02-03` / 대기·통합 확인 / `TEC-06` |
| 09-11 (금) | `FE-02-06` / `FE-03-01` / `TEC-07` | `FE-03-02` / 통합 확인 / 배포 확인 |
| 09-14 (월) | `FE-03-03` / `FE-03-04` / `QA-01-01` | `FE-03-05` / `QA-01-02` / `QA-01-03` |
| 09-15 (화) | `FE-03-06` / 통합 확인 / 회귀 수정 | `FE-03-07` / `QA-01-04` / 회귀 수정 |
| 09-16 (수) | `QA-02-01` / `QA-02-02` / `QA-02-03` | `QA-02-04` / 최종 검토 / 최종 검토 |

## Gantt 차트

```mermaid
gantt
    title CardFit 56 Task 실행 계획
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d
    excludes weekends

    section 기반·계약
    IN-01 실행 기반                 :in, 2026-09-02, 2d
    TEC-01~03 Prisma·Migration      :tec1, 2026-09-02, 3d
    DS-01 디자인 시스템·AppShell     :ds, 2026-09-03, 2d
    FX-01 Fixture·정답셋             :fx, 2026-09-03, 2d

    section 데이터·엔진
    TEC-04 Mock Seed                 :tec4, 2026-09-07, 1d
    TEC-05~06 Server Actions·Repository :tec56, 2026-09-10, 2d
    CE-01 계산·게이팅·배분 엔진       :ce, 2026-09-07, 3d

    section 화면
    FE-01 온보딩·현재 진단            :fe1, 2026-09-07, 3d
    FE-02 미래지출 입력               :fe2, 2026-09-09, 2d
    FE-03 결과·근거·확정              :fe3, 2026-09-11, 3d

    section 검증·배포
    TEC-07 배포 Smoke Test            :tec7, 2026-09-11, 1d
    QA-01 단위·Guardrail              :qa1, 2026-09-14, 2d
    QA-02 E2E·반응형·측정              :qa2, 2026-09-16, 1d
```

## 일정 판단

- 개발 Task 완료 목표는 2026-09-16이다.
- 09-17~09-18은 통합 오류, DB Seed 재적재, Preview 검증을 위한 버퍼로 둔다.
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
