# SRS Lite — CardFit

> **상태: 🟠 목차와 ID 체계만 — Day 1 16:00~17:20 / 본문은 Day 2 09:15~13:30**
> IEEE 표준 수준의 방대한 문서를 만들지 않습니다. **구현과 Issue 추출에 필요한 만큼**만 씁니다.
> 출처: 2차 워크북 `09_PRD_Requirement_Trace.md`(F-01~F-14, AC 24건), 덱 원고 `p24-25`(데이터·상태·예외), `p30`(KPI)

---

## 0. Requirement ID 체계

| 계열 | 대상 | 번호 |
| --- | --- | --- |
| `FR-0xx` | 기능 요구사항 | 8~15개 |
| `UI-0xx` | 화면·상호작용 요구사항 | 프로토타입 구현 대상 |
| `NFR-0xx` | 비기능 요구사항 (성능·보안·접근성·호환성 중 3~5개) | 3~5개 |

### 2차 F-xx ↔ 이번 FR 매핑

> **Day 1에 이 표를 완성하면 Day 4 오전의 추적 검증이 사실상 자동으로 끝납니다.**

| 2차 F-xx | 이번 ID | 기능명 | MoSCoW |
| --- | --- | --- | --- |
| F-01 | FR-001 | 미래지출 입력 | Must |
| F-02 | — | 마이데이터 연동 | **Won't** (Mock, D-001) |
| F-03 | FR-002 | 시나리오 계산 (3개) | Must |
| F-04 | FR-003 | 조합 최적화 · Net Benefit 게이팅 | Must |
| F-05 | FR-004 | 결제수단 배분 | Must |
| F-06 | FR-005 | 계산 근거 공개 | Must |
| F-11 | FR-006 | 초기값 자동 제안 | Should |
| TODO | | | |

---

## 1. 문서 목적 / 제품 범위 / Out of Scope

→ [`SCOPE.md`](SCOPE.md)

## 2. 사용자 역할과 핵심 사용자 흐름

TODO — SCOPE 3절의 Happy Path를 단계별 입력·출력까지 전개

## 3. 기능 요구사항 (FR)

### 요구사항 작성 템플릿

| 필드 | 내용 |
| --- | --- |
| ID | FR-003 |
| Requirement | 시스템은 ~해야 한다 |
| Rationale | 왜 필요한가 |
| Input / Rule / Output | 입력 / 규칙 / 출력 |
| Acceptance Criteria | Given ~, When ~, Then ~ |
| Source | KB 문서 ID, Decision ID |
| Priority | Must / Should / Could |

### FR-001 미래지출 입력

| 필드 | 내용 |
| --- | --- |
| Requirement | TODO |
| Rationale | TODO |
| Input / Rule / Output | TODO |
| Acceptance Criteria | TODO |
| Source | TODO |
| Priority | Must |

> FR-002 이후 동일 형식으로 반복. **8~15개를 넘기지 않습니다.**

## 4. UI · UX 요구사항 (UI)

TODO — `docs/ux/` 화면 정의와 1:1 대응

## 5. 비기능 요구사항 (NFR) — 3~5개

| ID | 요구사항 | 검증 방법 |
| --- | --- | --- |
| NFR-001 | TODO (성능 — 예: 계산 결과 p95 응답) | |
| NFR-002 | TODO (보안 — 비밀키·개인정보 미포함) | |
| NFR-003 | TODO (반응형 — 모바일·데스크톱 핵심 레이아웃) | |

## 6. 핵심 데이터 · 외부 연동 · 권한

TODO — 2차 덱 원고 p24-25에 이미 정리돼 있음. 재가공만.

## 7. 상태 전이와 중요한 예외

| 상태 | 진입 조건 | 화면 | 구현 여부 |
| --- | --- | --- | --- |
| Loading | | | TODO |
| Empty | | | TODO |
| Error | | | TODO |
| 임계 미달 → 현재 조합 유지 | | | **필수** |

## 8. Acceptance Criteria와 검증 방법

TODO — 2차 AC 24건 중 이번 범위에 해당하는 것만 선별

## 9. 제약 · 가정 · Open Questions

→ [`knowledge-base/02-research-evidence.md`](knowledge-base/02-research-evidence.md)

## 10. Requirement Traceability

→ [`TRACEABILITY.md`](TRACEABILITY.md)

---

> **SRS를 완벽하게 만들고 개발을 시작하려고 기다리지 않습니다.**
> 핵심 흐름의 요구사항이 Issue-ready가 되면 구현을 시작하고, 발견된 모호성은 이 문서에 되돌려 반영합니다.
> 단, **구현이 명세를 조용히 대체해서는 안 됩니다.**
