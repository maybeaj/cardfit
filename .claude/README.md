# .claude — 프로젝트 스킬

`maybeaj/cardfit-prd-to-srs`에서 이번 프로젝트에 필요한 것만 가져왔습니다.

| 스킬 | 언제 | 산출물 |
| --- | --- | --- |
| `grill-it` | Day 1 15:30 · 20~30분 · **1회** | `docs/grill/GRILL_LEDGER.md` (결정 토픽 원장) + 수용한 지적을 반영한 PRD·SRS·Decision Log |
| `goal-setting` | Day 2 16:10 · 15~25분 · **1회** | `/goal`에 그대로 붙여넣을 4섹션 프롬프트. 4,000자를 넘으면 `docs/goals/<slug>.md`로 저장 |

## grill-it 착수 입력 (Intake)

호출하면 네 가지를 묻습니다. 미리 정해서 들어가야 20분 안에 끝납니다.

```
A. 참조 범위      → docs/PRD.md, docs/SRS.md, docs/knowledge-base/00-index.md, docs/SCOPE.md
B. 관심 방향      → TODO (Day 1에 팀이 결정. 예: UX 흐름의 모호함 / 계산 규칙의 빈칸 / 데이터 경계)
C. 완료 조건      → 관심 방향의 미해소 토픽 전부 RESOLVED
D. 반영 대상      → docs/PRD.md · docs/SRS.md · docs/knowledge-base/04-decisions.md
```

**주의** — grill-it은 근거를 검증하는 도구가 아니라 **아직 결정하지 않은 것을 뽑아 결정시키는** 도구입니다.
근거의 사실 여부는 `docs/knowledge-base/02-research-evidence.md`의 등급 표기로 관리합니다.

## 가져오지 않은 것

원본 저장소에는 prisma · supabase · shadcn · vercel · tdd · webapp-testing 계열 스킬과 서브에이전트 6종이 더 있습니다.
**기술 스택이 확정되기 전(Day 2)이라 아직 판단할 수 없어서 가져오지 않았습니다.**
`docs/TECH_LEARNING_PLAN.md`에서 스택을 확정한 뒤 필요한 것만 추가로 가져오세요.

원본: [`maybeaj/cardfit-prd-to-srs/.claude/skills/`](https://github.com/maybeaj/cardfit-prd-to-srs/tree/main/.claude/skills)

## Access Preflight 미확인 항목

`/goal` **자체는 이 저장소에 정의돼 있지 않습니다.** `goal-setting`은 `/goal`에 넣을 프롬프트를 설계할 뿐,
`/goal` 명령은 별도로 제공되어야 합니다. Day 1 시작 전에 실제로 호출되는지 확인하세요.
