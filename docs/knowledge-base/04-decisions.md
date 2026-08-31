# 04. Decision Log

> **핵심 결정만 기록합니다.** 되돌리기 쉬운 결정은 Issue 안에서 끝내고 여기 오지 않습니다.
> 되돌리기 비싼 결정(범위 · 데이터 · 보안 · 배포)만 여기 남깁니다.

| ID | 결정 질문 | 선택 | 근거 | 영향 Requirement | 재검토 조건 | 결정일 |
| --- | --- | --- | --- | --- | --- | --- |
| D-001 | 프로토타입에서 마이데이터를 실제로 연동할 것인가? | **Mock 데이터** | 핵심 검증 대상은 조합안 이해 UX이며, 마이데이터 연동은 32시간 범위를 초과 | F-02, FR-TODO | 사용자별 데이터 저장을 검증해야 할 때 | 2026-08-31 |
| D-002 | TODO | | | | | |

---

## 2차에서 승계한 결정

2차 Decision Log 전체를 옮기지 않습니다. **아직 살아 있는 결정만** 위 표에 D-00x로 재번호해서 옮깁니다.

| 2차 결정 | 이번 프로젝트에서 | 처리 |
| --- | --- | --- |
| 핵심 기능 = F-04 Net Benefit 게이팅 | 그대로 승계 | → `docs/SCOPE.md` 5절 |
| 개선축 2개 분리 (시간축 / 조합축) | 그대로 승계 | → `01-product-context.md` |
| MoSCoW 프레임 채택 (RICE 아님) | 승계, 근거 유지 | → `docs/PRD.md` |
| TAM-SAM-SOM 포함관계 논쟁 | **종결** — 최종 정의만 남기고 이력은 옮기지 않음 | 2차 저장소 링크로 대체 |

원본: [`jennie-brain/team-project_2nd/decision-log/decision-log.md`](https://github.com/jennie-brain/team-project_2nd/blob/main/decision-log/decision-log.md)
