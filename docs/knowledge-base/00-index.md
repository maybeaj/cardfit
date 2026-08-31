# KB Index

> Knowledge Base는 자료 보관함이 아니라 **팀원과 AI가 같은 근거를 같은 구조로 탐색하는 작업 경로**입니다.
> 긴 통합 문서 하나 대신, 목적별로 나뉜 짧은 문서와 명시적인 링크를 씁니다.

**완료 기준** — 팀원이 "왜 이 기능이 필요한가?"라고 물었을 때 **3분 안에** 근거 → 결정 → 요구사항을 따라갈 수 있어야 합니다.

---

## 문서

| 문서 | 담고 있는 것 | 담당 |
| --- | --- | --- |
| [01 제품 맥락](01-product-context.md) | 제품 목표, 핵심 사용자, 해결하는 문제, 가치 제안 | Knowledge |
| [02 근거 대장](02-research-evidence.md) | 모든 주장의 근거 등급 · 출처 · 확인일 · 검증 계획 | Knowledge |
| [03 도메인·기술 노트](03-domain-and-tech-notes.md) | 카드 도메인 규칙, 교차 산업 메커니즘, 기술 제약 | Knowledge |
| [04 Decision Log](04-decisions.md) | 되돌리기 비싼 결정과 재검토 조건 | Product |
| [05 용어집](05-glossary.md) | 팀과 AI가 같은 뜻으로 써야 하는 용어 | Knowledge |

## 바깥 문서

| 문서 | 위치 |
| --- | --- |
| 범위 잠금 | [`docs/SCOPE.md`](../SCOPE.md) |
| PRD | [`docs/PRD.md`](../PRD.md) |
| SRS | [`docs/SRS.md`](../SRS.md) |
| 추적표 | [`docs/TRACEABILITY.md`](../TRACEABILITY.md) |

---

## 작성 규칙

1. **Index First** — 이 파일에서 모든 핵심 문서·질문·Requirement로 이동할 수 있어야 합니다.
2. **한 페이지 한 목적** — 제품 맥락 · 근거 · 기술 · 결정 · 용어를 섞지 않습니다.
3. **근거 상태 표기** — 🔵 Fact / ⚪ Inference / 🟡 Assumption / 🟠 Open Question을 반드시 구분합니다.
4. **출처와 시점** — 외부 자료는 URL · 게시일 · 확인일을 기록합니다.
5. **연결** — 주요 결론은 Requirement ID 또는 Decision ID와 연결합니다.
6. **충돌 보존** — 근거가 충돌하면 하나를 조용히 지우지 않고, 차이와 최종 판단을 남깁니다.

## 항목 템플릿

| 필드 | 내용 |
| --- | --- |
| Title / Tags | 이 항목의 질문 또는 지식 단위, 검색용 태그 |
| Status | 🔵 Fact / ⚪ Inference / 🟡 Assumption / 🟢 Decision / 🟠 Open Question |
| Summary | AI가 짧게 인용할 수 있는 2~4문장 |
| Evidence | 원문 링크, 사용자 조사, 화면 관찰, 데이터 |
| Implication | 제품 · UX · 기술 · 운영에 미치는 영향 |
| Linked Items | 관련 KB 문서, Decision ID, Requirement ID, Issue |
| Updated | 마지막 갱신일과 담당자 |

---

## AI에게 이 KB를 쓰게 하는 지시문

```
docs/knowledge-base 경로의 문서만 근거로 다음을 수행하세요.
1. 현재 제품 목표와 핵심 사용자 문제를 요약하세요.
2. 답변마다 사용한 KB 문서와 근거 상태를 표시하세요.
3. 근거가 없는 내용은 추정하지 말고 Open Question으로 남기세요.
4. 제안이 기존 Decision 또는 SRS Requirement와 충돌하면 먼저 알려주세요.
```
