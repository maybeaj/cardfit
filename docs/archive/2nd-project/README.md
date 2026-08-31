# 2차 프로젝트 발표본 — 입력 자산

> **읽기 전용.** 이 폴더의 파일은 수정하지 않습니다. 여기서 필요한 것을 골라 `docs/` 아래로 옮깁니다.

| 파일 | 내용 |
| --- | --- |
| `01_서비스_역기획서.pdf` | Master Deck 32p — 시장·고객·문제·메커니즘·VP·PRD·KPI 전체 |
| `02_Evidence_Analysis_Workbook.xlsx` | 11개 방법론 상세표와 근거 (Five Forces, 가치사슬, KSF, TAM-SAM-SOM, 페르소나, OS, JTBD, VP, PRD 추적, 근거 등급, 벤치마크 전이) |
| `03_Decision_AI_Usage_Log.xlsx` | 2차 결정 이력과 AI 활용 로그 |
| `CardFit_Deck_10min_v2-2.html` | 10분 발표용 덱 |
| `CardFit_발표대본.pdf` | 발표 대본 |

원본 저장소: [`jennie-brain/team-project_2nd`](https://github.com/jennie-brain/team-project_2nd)

---

## Reuse Map — 무엇이 어디로 가는가

> **항목 단위 판정은 [`docs/REUSE_MAP.md`](../../REUSE_MAP.md)가 정본입니다.** 아래는 파일 단위 요약입니다.

| 2차 자산 | 목적지 | 처리 |
| --- | --- | --- |
| 워크북 10번 근거 등급표 (Fact 13 / Inference 6 / Assumption 8 / 미확인 22) | `knowledge-base/02-research-evidence.md` | **거의 그대로** — 형식이 KB Status 필드와 1:1 |
| 워크북 08 Value Proposition + 덱 p02 | `knowledge-base/01-product-context.md` | 압축 — 목표 6개만, 논증 과정 제거 |
| 워크북 11 Benchmark Transfer + 메커니즘 전이 분석 | `knowledge-base/03-domain-and-tech-notes.md` | 선별 — 구현에 제약을 만드는 것만 |
| 2차 Decision Log | `knowledge-base/04-decisions.md` | 강한 선별 — 살아 있는 결정만 D-00x로 재번호 |
| 금지어 사전 | `knowledge-base/05-glossary.md` | 그대로 + 계산 용어 추가 |
| 워크북 09 PRD 추적 + 덱 p26-29 | `docs/PRD.md` | 압축 — 목적·범위·우선순위만 |
| 워크북 09의 F-01~F-14 + AC 24건 | `docs/SRS.md` | **재번호** — FR/UI/NFR 3계열로 |
| 덱 p24-25 데이터·시스템·정책·상태·예외 | `docs/SRS.md` 6~7절 | 재가공 |
| 덱 p30 KPI | `docs/SRS.md` NFR | 3~5개만 |
| blueprint v0.1~v0.4 + To-Be 화면 설계 | `docs/ux/` · `src/` | UX 기준선 |
| 덱 p03~p19 시장·고객 분석 원고 17p | Master Deck 2~4p | **대량 축약** |
| AI 활용 로그 전량 | `docs/ai-usage/` | 대표 2~3건만 |

> **Copy가 아니라 Curate.** 평가 항목 1번(15점)이 "기존 결과를 반복하지 않고 이번 구현에 필요한 근거로 선별했는가"입니다.
