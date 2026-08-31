# AI 활용 기록

> **전체 프롬프트 로그를 제출하지 않습니다.** 판단을 바꾼 대표 사례 2~3개만 남깁니다.
> 평가 기준은 "많이 돌렸는가"가 아니라 **"사람의 판단·검증·개입을 설명할 수 있는가"** 입니다. (배점 10점)

---

> 스킬 정의는 [`.claude/skills/`](../../.claude/README.md)에 있습니다. `grill-it` · `goal-setting` 2종만 가져왔습니다.

## 사용 횟수 제한

| 스킬 | 횟수 | 시점 | 시간 제한 |
| --- | --- | --- | --- |
| `/grill-it` | 1회 | Day 1 15:30 | 20~30분 |
| `/goal-setting` | 1회 | Day 2 16:10 | 15~25분 |
| `/goal` | 2회 | Day 2 16:35 · Day 3 16:40 | 45~60분 / 40~60분 |

---

## /grill-it — Day 1

| 항목 | 내용 |
| --- | --- |
| 입력 | `docs/PRD.md` · `docs/knowledge-base/00-index.md` · `docs/SCOPE.md` · `docs/SRS.md` |
| 결정 원장 | `docs/grill/GRILL_LEDGER.md` — 스킬이 자동 생성·갱신 |
| 상위 쟁점 5개 | TODO |
| 수용 / 보류 / 기각 | TODO — 각각 근거 한 줄 |
| 반영 위치 | TODO — 수용한 것만 PRD/SRS/Decision Log에 |

## /goal-setting — Day 2

| 항목 | 내용 |
| --- | --- |
| 목표 | TODO |
| 입력 명세 | TODO |
| 범위 밖 | TODO |
| Done 정의 | TODO |
| 검증 방법 | TODO |
| 중단 조건 | TODO |
| 연결 Issue / Requirement | TODO |

## /goal Cycle 1 — Day 2

| 항목 | 내용 |
| --- | --- |
| 목표 | TODO |
| 에이전트에게 준 근거 | TODO |
| **사람이 개입한 지점** | TODO |
| 최종 결과 | TODO |
| 다음에 바꿀 점 | TODO |

## /goal Cycle 2 — Day 3

| 항목 | 내용 |
| --- | --- |
| 목표 | TODO |
| 에이전트에게 준 근거 | TODO |
| **사람이 개입한 지점** | TODO |
| 최종 결과 | TODO |
| 다음에 바꿀 점 | TODO |

---

## 멀티에이전트 역할 분리 (Day 3)

| 역할 | 입력 | 출력 | 사람의 승인 지점 |
| --- | --- | --- | --- |
| Specification | PRD, SRS, KB | 모호성·누락·AC 후보 | 요구사항 변경 승인 |
| UX | UI/UX Issue, 사용자 흐름 | 화면 구조·상태·상호작용 제안 | 핵심 흐름과 정보 위계 승인 |
| Builder | 승인된 Issue와 관련 SRS | 코드·테스트·변경 설명 | Merge 전 Requirement 일치 검토 |
| Reviewer | Issue, Diff, AC | 결함·누락·회귀 위험 | 수정 우선순위와 Done 판단 |

> **같은 파일과 같은 컴포넌트를 여러 에이전트가 동시에 수정하지 않습니다.**
> Issue 경계와 소유 파일을 먼저 나누고, 공통 기반 변경은 한 사람이 통합합니다.
