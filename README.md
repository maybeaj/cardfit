# CardFit — AI 네이티브 실전기획 프로젝트

> 미래 지출을 기준으로 **보유 카드 조합을 다시 설계**하는 서비스.
> 2차 역기획 프로젝트의 검증된 결론을 Knowledge Base·SRS·GitHub TASK·프로토타입으로 연결합니다.

| 항목 | 내용 |
| --- | --- |
| 운영 기간 | 2026.08.31(월) ~ 09.03(목) · 4일 × 8시간 |
| 팀 | 4인 (Product · Knowledge · Delivery · UX/Build) |
| 핵심 사용자 | 혼인 등 대형 지출 이벤트를 앞둔 다장 보유자 |
| 핵심 기능 | F-04 조합 최적화 — Net Benefit 게이팅 |

---

## 제출 링크 3개

| # | 제출물 | 링크 | 담당 |
| --- | --- | --- | --- |
| 1 | Master Deck (12~16p) | `TODO — Day 1 오전 생성 후 여기에` | Product |
| 2 | GitHub Workspace | 이 저장소 · [GitHub Project](TODO) | Delivery |
| 3 | Deployed Product | `TODO — vercel --prod 실행 후 URL 기입` · 로컬 실행은 아래 "프로토타입 실행 방법" | UX·Build |

---

## 3분 안에 증거를 찾는 경로

| 알고 싶은 것 | 여기로 |
| --- | --- |
| 이 제품이 왜 필요한가 | [KB Index](docs/knowledge-base/00-index.md) → [제품 맥락](docs/knowledge-base/01-product-context.md) |
| 근거가 사실인가 가정인가 | [근거 대장](docs/knowledge-base/02-research-evidence.md) |
| 2차에서 뭘 가져오고 뭘 버렸나 | [Reuse Map](docs/REUSE_MAP.md) |
| 무엇을 만들고 무엇을 안 만드나 | [범위 잠금](docs/SCOPE.md) |
| 요구사항이 무엇인가 | [PRD](docs/PRD.md) → [SRS](docs/SRS.md) |
| 요구사항이 실제로 구현됐나 | [추적표](docs/TRACEABILITY.md) → GitHub Issue → 배포 URL |
| 왜 그렇게 결정했나 | [Decision Log](docs/knowledge-base/04-decisions.md) |
| 팀이 어떻게 일하나 | [운영 규칙](docs/TEAM_OPERATIONS.md) |
| AI를 어디서 어떻게 썼나 | [AI 활용 기록](docs/ai-usage/README.md) |

---

## 저장소 구조

```
cardfit/
├── README.md                     # 제출 허브 (이 파일)
├── docs/
│   ├── REUSE_MAP.md              # 2차 결과 재사용·폐기·추가확인 판정
│   ├── SCOPE.md                  # 범위 잠금 1장 — 이 문서가 모든 "넣을까요?"의 답
│   ├── PRD.md                    # 제품 목적·범위·우선순위
│   ├── SRS.md                    # FR / UI / NFR + Acceptance Criteria
│   ├── TRACEABILITY.md           # KB → PRD → SRS → Issue → 구현·검증
│   ├── TEAM_OPERATIONS.md        # 레인·동기화·브랜치·파일 소유 경계
│   ├── TECH_LEARNING_PLAN.md     # 비개발자 PM 기술 학습 3주제
│   ├── knowledge-base/           # LLM-Wiki — 사람과 AI가 같이 읽는 근거
│   │   ├── 00-index.md
│   │   ├── 01-product-context.md
│   │   ├── 02-research-evidence.md
│   │   ├── 03-domain-and-tech-notes.md
│   │   ├── 04-decisions.md
│   │   └── 05-glossary.md
│   ├── ux/                       # 화면 흐름·상태·디자인 토큰
│   ├── ai-usage/                 # /grill-it · /goal 대표 기록
│   └── archive/2nd-project/      # 2차 발표본 — 입력 자산 (읽기 전용)
├── src/                          # 프로토타입 소스 (Next.js App Router)
│   ├── app/page.tsx              #   / 랜딩페이지
│   ├── app/app/**                #   /app/* 앱 데모 9화면
│   ├── domain/                   #   순수 계산·타입
│   ├── fixtures/                 #   Mock 데이터·정답셋
│   ├── content/                  #   경계 고지·금지어 사전
│   └── state/                    #   세션 상태·이벤트 로깅
├── e2e/                          # Playwright Happy Path
└── .github/                      # Issue 템플릿 · PR 템플릿 · CODEOWNERS
```

---

## 프로토타입 실행 방법

Node 20 이상이 필요합니다. 환경변수는 없습니다 — 모든 데이터가 저장소 안의 Mock Fixture입니다.

```bash
npm install
npm run dev            # http://localhost:3000
```

| 경로 | 무엇 |
| --- | --- |
| `/` | 랜딩페이지 — 문제·해결·가치·흐름·경계 |
| `/app` | 앱 데모 시연 시작 (온보딩 → 확정까지 9화면) |

### 검증 명령

```bash
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm test               # Vitest — 계산 정답셋·결정론성·금지어
npm run test:e2e       # Playwright — 402×874 / 1440×900 Happy Path
npm run build          # 배포 전 프로덕션 빌드
```

### Vercel 배포

```bash
npx vercel login
npx vercel link        # 저장소를 Vercel 프로젝트에 연결
npx vercel --prod      # 프로덕션 배포
```

GitHub 연동으로 배포하면 `main` 푸시가 프로덕션, PR이 Preview가 됩니다. 프레임워크 설정은 `vercel.json`에 있고 빌드 명령은 `npm run build`입니다. **환경변수·비밀키를 추가하지 않습니다** (`NFR-002`).

### 구조

| 경계 | 책임 |
| --- | --- |
| `src/app/page.tsx` | 랜딩페이지 |
| `src/app/app/**` | 앱 데모 라우트 9개 |
| `src/components` | 공통 UI · 결과 블록 |
| `src/domain` | 순수 계산 (`calculatePlan`·`diagnose`)과 타입 |
| `src/fixtures` | 예시 카드·소비·규칙과 정답셋 |
| `src/content` | 경계 고지·면책·금지어 사전 |
| `src/state` | 세션 상태 · `ClientEvent` 로깅 |

---

## 입력 자산

이번 프로젝트는 새로 시작하지 않습니다. 2차 역기획 프로젝트의 결론을 **선별해서** 가져옵니다.

- [`docs/archive/2nd-project/`](docs/archive/2nd-project/) — 2차 최종 발표본 (역기획서 PDF, Evidence Workbook, Decision·AI Usage Log, 발표덱, 발표대본)
- [`jennie-brain/team-project_2nd`](https://github.com/jennie-brain/team-project_2nd) — 2차 원본 저장소 (11개 방법론 워크북, 32p 덱 원고)
- [`maybeaj/cardfit-prd-to-srs`](https://github.com/maybeaj/cardfit-prd-to-srs) — PRD v1.0 및 SRS 포맷 레퍼런스 (참고용, 이관하지 않음)

> **재사용 원칙 — Copy가 아니라 Curate.**
> 이번 구현에 근거·결정·제약으로 쓰이는 것만 옮깁니다. 옮기지 않은 것은 위 링크로 연결만 합니다.
