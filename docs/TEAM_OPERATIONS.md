# 팀 운영 규칙

문서 하나씩 나눠 맡는 방식은 후반 통합 비용이 큽니다. **병렬 작업이 가능한 4개 레인**으로 나누고, 하루 세 번만 합칩니다.

---

## 1. 레인과 파일 소유 경계

같은 파일을 두 사람(또는 두 에이전트)이 동시에 고치지 않는 것이 이 표의 목적입니다.
**소유자만 커밋**하고, 다른 레인이 내용을 바꾸고 싶으면 Issue나 채널로 요청합니다.

| 레인 | 담당 | 소유 경로 | 핵심 핸드오프 |
| --- | --- | --- | --- |
| **Product & Decision** | TODO | `README.md` · `docs/SCOPE.md` · `docs/PRD.md` · `docs/knowledge-base/04-decisions.md` · `docs/grill/` · Master Deck | 제품 목표, Scope, Decision Log |
| **Knowledge & Spec** | TODO | `docs/SRS.md` · `docs/knowledge-base/00·01·02·03·05` | KB Index, SRS, Requirement ID |
| **Delivery & GitHub** | TODO | `.github/**` · `docs/TRACEABILITY.md` · `docs/TEAM_OPERATIONS.md` · GitHub Project | Issue, Board, 추적성 |
| **UX & Build** | TODO | `src/**` · `docs/ux/**` · `docs/TECH_LEARNING_PLAN.md` | UI/UX Issue, Source, Deploy URL |

> 3인 운영이 되면 Product Lead가 Delivery를 겸임합니다. 단, 개발 경험자 한 명에게 구현을 몰아주지 않습니다 —
> **모든 팀원이 최소 한 번은 요구사항 검토 · Issue 작성 · AI 산출물 검증을 직접 수행**해야 합니다.

---

## 2. 하루 세 번만 동기화합니다

| 시점 | 시간 제한 | 확인할 것 |
| --- | --- | --- |
| 09:00 Daily Planning | 15분 | 오늘의 Done, 담당 Issue, 차단요소, 발표자료에서 채울 페이지 |
| 13:00 Scope Sync | 10분 | 오전 결과 통합, 충돌 해결, 오후 범위 재잠금 |
| 17:20 Integration Review | 30분 | Issue 상태, 문서 링크, 배포 상태, Deck 업데이트, 다음 날 첫 TASK |

그 사이에는 서로를 부르지 않습니다. 막히면 Issue에 `blocked` 라벨을 답니다.

---

## 3. 15분 Decision Clock

| 시간 | 할 일 |
| --- | --- |
| 3분 | 무엇을 결정해야 하는지 한 문장으로 고정 |
| 5분 | 후보를 최대 3개로 제한, 근거·제약 확인 |
| 4분 | 사용자 가치 · 구현 가능성 · 근거 수준 · 시간 비용을 1~3점으로 비교 |
| 3분 | 결정권자가 선택, 재검토 조건과 폐기 이유를 한 줄로 기록 |

**결정권** — 되돌리기 쉬운 결정은 해당 Issue 담당자가 결정합니다.
범위 · 데이터 · 보안 · 배포처럼 되돌리기 비싼 결정은 팀 전체가 검토하되, 시간이 끝나면 Product Lead가 현재 근거로 잠급니다.

결정한 것은 [`docs/knowledge-base/04-decisions.md`](knowledge-base/04-decisions.md)에 D-00x로 남깁니다. **핵심 결정만** 남깁니다.

---

## 4. Git 규칙 — 32시간용 경량 운영

| 대상 | 규칙 |
| --- | --- |
| 문서 (`docs/**`, `README.md`) | 소유 레인이 `main`에 직접 커밋. PR 없이 진행 — 파일 소유 경계가 충돌을 막습니다 |
| 코드 (`src/**`) | **브랜치 + PR 필수.** 같은 컴포넌트를 두 사람이 동시에 만지는 사고를 막습니다 |
| 공통 기반 (디자인 토큰·공통 컴포넌트·Mock Data 스키마) | **한 사람이 먼저 통합**한 뒤에 병렬 작업을 시작합니다 |

**브랜치 이름** — `<레인>/<이슈번호>-<슬러그>`
예: `ui/18-recommend-result`, `spec/12-fr-004`, `qa/31-empty-state`

**커밋 메시지** — `[FR-004] 조합 최적화 게이팅 계산 추가`
요구사항 ID를 앞에 붙이면 Day 4 추적 검증이 `git log`로 끝납니다.

**작업 시작 전** — 항상 `git pull --rebase` 먼저. 문서를 main에 직접 커밋하는 구조라 이걸 건너뛰면 바로 충돌합니다.

---

## 5. GitHub Project 운영

| 항목 | 값 |
| --- | --- |
| Board 컬럼 | Backlog → Ready → In Progress → Review → Done |
| 필수 필드 | Owner · Priority · Requirement ID · Workstream · Target Day |
| 라벨 | `area:research` `area:spec` `area:ui` `area:ux` `area:qa` `risk` `blocked` |
| WIP 제한 | **팀원 1명당 In Progress 1개** |
| 로드맵 | Day 1~4를 Target Day 필드로 표현 |

**범위 추가에는 교환 조건이 필요합니다.** 새 기능을 넣으려면 같은 크기의 기존 기능을 빼거나 Backlog로 보냅니다.
"시간 되면 하자"는 현재 Sprint의 약속이 아닙니다.

---

## 6. AI 에이전트를 병렬로 돌릴 때

| 규칙 | 이유 |
| --- | --- |
| Issue 경계와 소유 파일을 **먼저** 나눈다 | 같은 파일을 두 에이전트가 동시에 고치면 복구 비용이 구현 비용보다 큽니다 |
| 저장소 전체를 읽히지 말고 **KB Index와 해당 SRS·Issue를 지정**한다 | 근거 없는 내용을 사실처럼 채우는 걸 막습니다 |
| 리서치 · 명세 · 구현 · 리뷰 역할을 **분리**한다 | 같은 에이전트의 자기검증만으로 Done 처리하지 않습니다 |
| 외부 사실 · 라이브러리 버전 · 배포 설정은 **공식 문서나 실제 실행 결과**로 확인한다 | 환각 방지 |
| 개인정보 · 비밀키 · 실제 고객 데이터를 프롬프트와 저장소에 넣지 않는다 | 저장소가 Public입니다 |

**AI를 많이 돌린 것 자체는 성과가 아닙니다.** 평가 기준은 "사람의 판단·검증·개입을 설명하는가"입니다.
`/grill-it` 1회 · `/goal-setting` 1회 · `/goal` 2회 — 이 횟수 안에서 운영합니다.
