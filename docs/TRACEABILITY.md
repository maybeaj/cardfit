# 추적표 — KB → PRD → SRS → Spec → Issue → 구현·검증

> 상태: 🟡 구현 전 추적 완료 · Epic 9건 + 원자 Task 54건 생성
> 구현 커밋과 Preview URL은 각 Issue가 닫힐 때 채운다.

| KB 근거 | PRD 목표 | SRS Requirement | Spec | GitHub Issue | 구현 | 검증 |
| --- | --- | --- | --- | --- | --- | --- |
| E-01 · D-001 | G1 · G2 | UI-011·012, NFR-002 | TECH · FIXTURE | [#1](https://github.com/maybeaj/cardfit/issues/1), [#3](https://github.com/maybeaj/cardfit/issues/3), [#5](https://github.com/maybeaj/cardfit/issues/5) | 대기 | AC-011 · 비밀키 스캔 |
| E-04 · A-01 | G2 | FR-001·006·007, UI-002·003 | TECH · FIXTURE | [#3](https://github.com/maybeaj/cardfit/issues/3), [#6](https://github.com/maybeaj/cardfit/issues/6) | 대기 | AC-001·007·010 |
| D-008 | G2 | FR-002, UI-004 | CALC | [#4](https://github.com/maybeaj/cardfit/issues/4), [#7](https://github.com/maybeaj/cardfit/issues/7) | 대기 | AC-001·010 |
| 제품 결정 | G6 | FR-003, UI-005 | CALC | [#4](https://github.com/maybeaj/cardfit/issues/4), [#7](https://github.com/maybeaj/cardfit/issues/7) | 대기 | AC-005 |
| I-01 · A-02 | G3 | FR-003, UI-005 | CALC · FIXTURE | [#3](https://github.com/maybeaj/cardfit/issues/3), [#4](https://github.com/maybeaj/cardfit/issues/4), [#7](https://github.com/maybeaj/cardfit/issues/7) | 대기 | AC-004·006 |
| 2차 F-05 | G1 | FR-004, UI-006 | CALC | [#4](https://github.com/maybeaj/cardfit/issues/4), [#7](https://github.com/maybeaj/cardfit/issues/7) | 대기 | 배분 합 오차 ≤ 1원 |
| E-02 · I-02 | G4 | FR-005, UI-007 | CALC · TEST | [#4](https://github.com/maybeaj/cardfit/issues/4), [#7](https://github.com/maybeaj/cardfit/issues/7), [#8](https://github.com/maybeaj/cardfit/issues/8) | 대기 | AC-002 |
| E-03 | G5 | FR-008, UI-008 | TECH · TEST | [#7](https://github.com/maybeaj/cardfit/issues/7), [#9](https://github.com/maybeaj/cardfit/issues/9) | 대기 | AC-003·008 |
| E-05 | G2 | UI-001 | TECH · TEST | [#5](https://github.com/maybeaj/cardfit/issues/5), [#9](https://github.com/maybeaj/cardfit/issues/9) | 대기 | AC-012 |
| — | G1~G6 | UI-001~008·011·012, NFR-003 | TECH · TEST | [#2](https://github.com/maybeaj/cardfit/issues/2), [#9](https://github.com/maybeaj/cardfit/issues/9) | 대기 | 402×874 · 1440×900 E2E |

Spec 약칭은 `docs/specs/TECH_SPEC.md`, `CALC_SPEC.md`, `FIXTURE_SPEC.md`, `TEST_SPEC.md`를 뜻한다.

## 구현 중 갱신 규칙

1. Issue 본문에 Requirement와 AC ID를 유지한다.
2. 완료 커밋 또는 PR을 `구현` 열과 Issue 검증 증거에 기록한다.
3. 테스트 로그·스크린샷·Preview URL을 `검증` 열에 기록한 뒤 Issue를 닫는다.
4. Must 요구사항에 열린 구현 경로가 없거나, 구현이 어떤 Requirement에도 연결되지 않으면 완료로 보지 않는다.

## PRD Story·AC → SRS 직접 추적표

| PRD Story | PRD AC | SRS 기능·UI·NFR | 검증 Spec |
|---|---|---|---|
| US-01 미래 계획 반영 | AC-010, AC-001, AC-007 | FR-001, FR-002, FR-006, FR-007, UI-002·003, NFR-004 | `TEST_SPEC.md` 계획·입력·12개월 테스트 |
| US-02 안전한 조합 결정 | AC-004, AC-005, AC-006 | FR-003, UI-005, NFR-001·004 | `TEST_SPEC.md` 게이트·결정론성 테스트 |
| US-03 근거 검증과 결제 배분 | NFR-001, AC-002 | FR-004, FR-005, UI-006·007, NFR-001·004 | `TEST_SPEC.md` 배분·근거 완전성 테스트 |
| US-04 직접 확정과 실행 경계 | AC-008, AC-003 | FR-008, UI-008, NFR-004 | `TEST_SPEC.md` 확정·아웃링크 경계 테스트 |

| PRD AC | SRS AC | 상태 |
|---|---|---|
| AC-001 | AC-001 | 직접 대응 |
| AC-002 | AC-002 | 직접 대응 |
| AC-003 | AC-003 | 직접 대응 |
| AC-004 | AC-004 | 직접 대응 |
| AC-005 | AC-005 | 직접 대응 |
| AC-006 | AC-006 | 직접 대응 |
| AC-007 | AC-007 | 직접 대응 |
| AC-008 | AC-008 | 직접 대응 |
| AC-009 | AC-009 | 철회 이력 보존 |
| AC-010 | AC-010 | 직접 대응 |
| AC-011 | AC-011 | 진입 UX 대응 |
| AC-012 | AC-012 | 진단 화면 대응 |
| AC-013 | AC-013 | 유지 원인 대응 |

이 표는 기존 KB → PRD → SRS 추적표를 대체하지 않고, PRD의 사용자 요구와 수용 기준을 SRS ID에 직접 연결하는 보완 표다.
