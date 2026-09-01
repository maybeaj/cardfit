# 기술 학습 계획

> **상태: 🟠 후보 선정 — Day 1 / 학습·적용 — Day 2 10:40~12:00**
> 목표는 4일 안에 개발자가 되는 것이 아니라, **선택한 기술이 제품 요구사항에 어떤 가능성과 제약을 만드는지 이해하고 AI 산출물을 검토할 수 있게 되는 것**입니다.
> **주제 최대 3개. 주제당 30~60분.**

---

## 채택 기술

| 항목 | 선택 | 어떤 Requirement 때문에 골랐나 |
| --- | --- | --- |
| 프레임워크 | Next.js App Router + TypeScript | C-TEC-001 단일 풀스택과 UI-001~011의 화면 흐름을 한 앱에서 구성하고, C-TEC-002에 따라 Server Actions로 서버 경계를 두기 위해 |
| UI | Tailwind CSS + shadcn/ui | C-TEC-004와 NFR-003의 402×874 모바일·데스크톱 반응형, UI-001~011의 공통 상태·배지·CTA를 일관된 토큰과 재사용 컴포넌트로 구현하기 위해 |
| 데이터 | Mock (D-001) | FR-002 미래지출 기준 혜택 계산을 실연동 없이 검증하기 위해 |
| 배포 | Vercel | 제출물 3번 |

## 학습 주제 — 최대 3개

| # | 학습 질문 | 제품 결정과의 연결 | 작은 실습 | 완료 증거 | 담당 |
| --- | --- | --- | --- | --- | --- |
| 1 | 결정론적 Rule Engine과 상태·테스트는 어떻게 검증하는가? | FR-003의 Net Benefit 게이팅과 NFR-001의 정확성·재현성 보장 | `Net Benefit ≥ 50,000원 AND Gross Benefit × 15%` 경계값과 `현재 조합 유지` 케이스를 Given–When–Then으로 작성 | 정상·경계·빈 상태·근거 부족·유지 결론을 설명하는 테스트 케이스 | PM/개발자 |
| 2 | Mock Data와 실제 API 연동 경계는 어떻게 나누는가? | 프로토타입과 이후 실제 개발의 연결 지점 | Repository/Adapter 인터페이스 만들기 | 교체 지점 설명 | PM/개발자 |
| 3 | Next.js의 서버/클라이언트 경계와 Server Actions는 어떻게 나누는가? | 계산·DB 접근의 서버 보호와 입력·탭·CTA의 상호작용 처리 | 계산 요청과 근거 조회를 Server Action 계약으로 작성하고 입력 컴포넌트 경계 그리기 | 서버에서만 처리해야 할 책임과 클라이언트 상태를 각각 3개 설명 | PM/개발자 |

## 학습 → 적용

| 주제 | 어떤 코드·설정·Issue에 실제로 적용했는가 |
| --- | --- |
| 1 | `docs/SRS.md`의 FR-003·NFR-001과 `docs/specs/TEST_SPEC.md`의 계산 단위 테스트를 기준으로 Net Benefit 이중 임계값, 1원 오차, `현재 조합 유지`, 근거 부족·Empty 상태를 테스트 대상으로 삼는다. 계산·설명은 AI가 아닌 결정론적 규칙 엔진으로 처리한다. |
| 2 | `docs/SRS.md`의 `HeldCard`·`PastSpend`·`BenefitRule`은 Prisma Seed Mock으로 공급하고, 화면·계산 로직이 외부 API에 직접 의존하지 않도록 Repository/Adapter 경계를 둔다. `D-001`, `docs/adr/ADR-001-mock-first.md`, `docs/diagrams/TECHNICAL_DESIGN.md`의 Fixture Repository에 적용한다. |
| 3 | `docs/SRS.md`와 `docs/diagrams/TECHNICAL_DESIGN.md`의 서버 경계를 기준으로 계산 요청·근거 조회·DB 자격증명은 Server Actions/서버에 두고, UI-001~011의 입력·탭·CTA만 Client Component에서 처리한다. 공개 REST API는 만들지 않는다. |

## 이해 확인

각 담당자가 **자기 말로** 설명하고, 실패 원인 또는 대안을 말할 수 있어야 통과입니다.

| 주제 | 설명 가능 | 확인자 |
| --- | --- | --- |
| 1 | ☐ | PM/개발자 자기 점검 |
| 2 | ☐ | PM/개발자 자기 점검 |
| 3 | ☐ | PM/개발자 자기 점검 |

## 남은 한계

이번 시간에 배우지 못해 Backlog로 남긴 것:

- Prisma 스키마·migration·seed를 직접 작성하고 로컬 Supabase PostgreSQL에서 실행하는 실습
- Server Actions의 상세 입력·출력·오류 계약과 실제 구현 실습
- 모바일·데스크톱 E2E, 배포 Smoke Test, Vercel 환경변수·비밀값 누출 정적 스캔 자동화
- 실제 마이데이터·카드사 API 연동 전 필요한 동의·규제·데이터 최신성·비용 검증
