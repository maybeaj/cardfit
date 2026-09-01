# 라벨 정의

Delivery & GitHub Lead가 저장소 생성 직후 아래 명령으로 한 번에 만듭니다.

```bash
gh label create "area:research" --color 0E8A16 --description "리서치·근거 수집" --force
gh label create "area:spec"     --color 1D76DB --description "PRD·SRS·요구사항" --force
gh label create "area:ui"       --color 5319E7 --description "화면 구현" --force
gh label create "area:ux"       --color B60205 --description "사용자 흐름·정보구조·상태" --force
gh label create "area:qa"       --color FBCA04 --description "검증·회귀·추적 확인" --force
gh label create "risk"          --color D93F0B --description "되돌리기 비싼 결정 또는 리스크" --force
gh label create "blocked"       --color 000000 --description "차단됨 — 동기화 시점에 다룸" --force
gh label create "part:infra"    --color 6F42C1 --description "앱 기반·도구·배포" --force
gh label create "part:design"   --color D4C5F9 --description "디자인 시스템·공통 UI" --force
gh label create "part:fixture"  --color C2E0C6 --description "Mock 데이터·정답셋" --force
gh label create "part:calc"     --color BFDADC --description "계산·게이팅·배분 엔진" --force
gh label create "part:frontend" --color 0052CC --description "사용자 화면·상태 흐름" --force
gh label create "part:qa"       --color FBCA04 --description "테스트·E2E·추적 검증" --force
gh label create "priority:p0"   --color B60205 --description "프로토타입 완료에 필수" --force
gh label create "kind:epic"     --color 3E4B9E --description "여러 원자 Task를 묶는 상위 작업" --force
gh label create "kind:task"     --color 0E8A16 --description "반나절 이내 완료·검증 가능한 원자 작업" --force
```

## GitHub Project 필수 필드

Board에서 수동으로 추가합니다 (Projects v2).

| 필드 | 타입 | 값 |
| --- | --- | --- |
| Owner | Assignee | 팀원 |
| Priority | Single select | Must / Should / Could |
| Requirement ID | Text | `FR-003` 형식 |
| Workstream | Single select | Product / Knowledge / Delivery / UX-Build |
| Target Day | Single select | Day 1 / Day 2 / Day 3 / Day 4 |

컬럼: `Backlog → Ready → In Progress → Review → Done`
WIP 제한: 팀원 1명당 In Progress 1개
