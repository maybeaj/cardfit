# 추적표 — KB → PRD → SRS → Issue → 구현·검증

> **배점 20점.** 이번 프로젝트에서 가장 배점이 큰 단일 항목입니다.
> Day 4 오전 09:20~10:30에 이 표로 검증합니다. **Day 2에 채우기 시작하면 그날이 편합니다.**

| KB 근거 | PRD 목표 | SRS Requirement | GitHub Issue | 구현 | 검증 |
| --- | --- | --- | --- | --- | --- |
| TODO | G3 바꿀 가치가 있을 때만 권한다 | FR-003, UI-TODO | #TODO | TODO | AC 통과 / Preview URL |
| | | | | | |

---

## 채우는 규칙

| 열 | 값 |
| --- | --- |
| KB 근거 | `02-research-evidence.md`의 E-xx / A-xx ID |
| PRD 목표 | G1~G6 |
| SRS Requirement | FR-0xx · UI-0xx · NFR-0xx |
| GitHub Issue | `#12` 형식. Issue 본문에 Requirement ID가 있어야 함 |
| 구현 | 커밋 해시 또는 PR 번호. 커밋 메시지가 `[FR-003] ...` 형식이면 `git log --grep` 으로 찾힘 |
| 검증 | AC 통과 여부 + 확인한 Preview/Production URL |

## Day 4 검증 체크

- [ ] Must 요구사항 중 Issue가 없는 것이 있는가?
- [ ] Issue는 있는데 구현·Backlog 어느 쪽도 아닌 것이 있는가?
- [ ] 구현은 됐는데 어떤 Requirement에도 연결되지 않은 것이 있는가? (명세가 조용히 대체된 신호)
- [ ] KB 근거 없이 만들어진 기능이 있는가?
