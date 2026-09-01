# Issue Map — CardFit

> GitHub: [`maybeaj/cardfit`](https://github.com/maybeaj/cardfit) · 생성일 2026-09-01  
> 구성: Epic 9건(`#1~#9`) + 압축 후 원자 Task 49건 + 기술 제약 보완 Task 7건 = 총 56건. 기존 GitHub Issue 번호는 이력 보존을 위해 삭제하지 않고 통합 매핑으로 관리한다.

| Task | GitHub Issue | 선행 Issue | 시작 조건 |
| --- | --- | --- | --- |
| IN-01 | [#1](https://github.com/maybeaj/cardfit/issues/1) | 없음 | 즉시 |
| DS-01 | [#2](https://github.com/maybeaj/cardfit/issues/2) | #1 | 앱 셸 실행 가능 |
| FX-01 | [#3](https://github.com/maybeaj/cardfit/issues/3) | #1 | 타입·테스트 기반 존재 |
| CE-01 | [#4](https://github.com/maybeaj/cardfit/issues/4) | #3 | Fixture와 정답 계약 확정 |
| FE-01 | [#5](https://github.com/maybeaj/cardfit/issues/5) | #2, #3 | 공통 UI와 예시 데이터 준비 |
| FE-02 | [#6](https://github.com/maybeaj/cardfit/issues/6) | #2, #3 | 공통 UI와 제안값 준비 |
| FE-03 | [#7](https://github.com/maybeaj/cardfit/issues/7) | #4, #6 | 계산 결과 계약과 입력 흐름 준비 |
| QA-01 | [#8](https://github.com/maybeaj/cardfit/issues/8) | #4, #7 | 계산·결과 구현 완료 |
| QA-02 | [#9](https://github.com/maybeaj/cardfit/issues/9) | #5~#8 | 전체 Happy Path 연결 |

## 원자 Task Issue 범위

| Epic | Task 수 | GitHub Issue |
| --- | ---: | --- |
| IN-01 | 4 | 기존 #10~#14 이력 유지, `IN-01-04`는 `IN-01-02`로 통합 |
| DS-01 | 6 | 기존 #15~#21 이력 유지, `DS-01-05`는 `DS-01-04`로 통합 |
| FX-01 | 5 | 기존 #22~#27 이력 유지, `FX-01-05`는 `FX-01-04`로 통합 |
| CE-01 | 10 | [#28](https://github.com/maybeaj/cardfit/issues/28)~[#37](https://github.com/maybeaj/cardfit/issues/37) |
| FE-01 | 4 | 기존 #38~#42 이력 유지, `FE-01-02`는 `FE-01-01`로 통합 |
| FE-02 | 5 | 기존 #43~#48 이력 유지, `FE-02-04`는 `FE-02-03`으로 통합 |
| FE-03 | 7 | [#49](https://github.com/maybeaj/cardfit/issues/49)~[#55](https://github.com/maybeaj/cardfit/issues/55) |
| QA-01 | 4 | [#56](https://github.com/maybeaj/cardfit/issues/56)~[#59](https://github.com/maybeaj/cardfit/issues/59) |
| QA-02 | 4 | [#60](https://github.com/maybeaj/cardfit/issues/60)~[#63](https://github.com/maybeaj/cardfit/issues/63) |

### 압축 이력

| 통합 후 Task | 흡수된 Task | 판단 |
| --- | --- | --- |
| `IN-01-02` | `IN-01-04` | 개발 기반 설정의 동일 경계 |
| `DS-01-04` | `DS-01-05` | 공통 UI 컴포넌트 묶음 |
| `FX-01-04` | `FX-01-05` | 두 시나리오 정답 Fixture |
| `FE-01-01` | `FE-01-02` | 온보딩·예시 데이터 안내 흐름 |
| `FE-02-03` | `FE-02-04` | 지출 입력의 감소·Empty 상태 |

## 기술 제약 보완 Task 범위

기존 54개 Task Issue는 유지한다. 아래 7개는 기술 제약 반영을 위해 추가로 생성해야 하는 보완 Issue이며, 이 문서 커밋 시점에는 GitHub Issue 번호가 아직 부여되지 않았다.

| Epic | Task 수 | GitHub Issue | 비고 |
| --- | ---: | --- | --- |
| TEC | 7 | 생성 필요 | Prisma·Supabase·Seed·Server Actions·Vercel |

AI/Gemini 및 마이데이터·카드사 데이터 API Issue는 생성하지 않는다.

## UI/UX 상위 그룹

UI/UX 11개 그룹은 기존 원자 Task의 상위 분류이며, 별도 중복 Issue를 만들지 않는다. 상세 매핑은 [`TASK_LIST.md`](TASK_LIST.md)의 `UI/UX 상위 그룹` 표를 따른다.

원자 Task의 제목·요구사항·선행 관계 정본은 [`TASK_LIST.md`](TASK_LIST.md)다. GitHub Project는 아직 만들지 않는다. 32시간 범위에서는 Issue의 open/closed 상태와 위 선행 관계만으로 충분하며, 별도 보드 운영이 필요해질 때 `.github/labels.md`의 필드 정의를 사용한다.
