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
