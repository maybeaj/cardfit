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
| 1 | Server / Client Component 차이는 무엇인가? | 상호작용 UI와 계산 처리 위치 결정 | 한 컴포넌트의 경계 변경 | 선택 이유와 제약 3줄 | PM/개발자 |
| 2 | Mock Data와 실제 API 연동 경계는 어떻게 나누는가? | 프로토타입과 이후 실제 개발의 연결 지점 | Repository/Adapter 인터페이스 만들기 | 교체 지점 설명 | PM/개발자 |
| 3 | Vercel 환경변수와 공개 변수의 차이는 무엇인가? | 비밀키 노출 방지 (저장소가 Public) | 샘플 환경변수 연결 | 노출 금지 항목 체크 | PM/개발자 |

## 학습 → 적용

| 주제 | 어떤 코드·설정·Issue에 실제로 적용했는가 |
| --- | --- |
| 1 | `docs/SRS.md`의 계산·DB 접근은 Server Actions/서버 경계에서 처리하고, UI-001~011의 입력·탭·CTA처럼 상호작용이 필요한 부분만 Client Component로 분리한다. 관련 결정은 C-TEC-001~002와 `docs/specs/TECH_SPEC.md`의 앱·서버 항목에 반영한다. |
| 2 | `docs/SRS.md`의 `HeldCard`·`PastSpend`·`BenefitRule`은 Prisma Seed Mock으로 공급하고, 화면·계산 로직이 외부 API에 직접 의존하지 않도록 Repository/Adapter 경계를 둔다. `D-001`, `docs/adr/ADR-001-mock-first.md`, `docs/diagrams/TECHNICAL_DESIGN.md`의 Fixture Repository에 적용한다. |
| 3 | `C-TEC-007`과 NFR-002를 기준으로 Supabase 연결 정보 등 비밀값은 Vercel 서버 환경변수에만 두고 `NEXT_PUBLIC_` 변수에는 공개 가능한 값만 둔다. 저장소·번들 정적 스캔을 배포 전 체크리스트로 삼는다. |

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
- Server Actions의 입력·출력·오류 계약과 결정론적 Rule Engine 테스트 작성
- 모바일·데스크톱 E2E, 배포 Smoke Test, 환경변수 누출 정적 스캔 자동화
- 실제 마이데이터·카드사 API 연동 전 필요한 동의·규제·데이터 최신성·비용 검증
