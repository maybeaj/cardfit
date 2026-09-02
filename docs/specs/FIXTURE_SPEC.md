# Fixture Spec — CardFit

> 상태: 🟢 구현 기준본 · 실제 개인정보·실제 연결 데이터 사용 금지

## 1. 목적

Fixture는 페르소나를 선택하게 하는 기능이 아니라 동일한 사용자 흐름에서 “변경”과 “유지” 두 결론을 재현하는 내부 정답셋이다. UI에는 프로필 선택 화면을 만들지 않는다.

## 2. 데이터 세트

| Fixture ID | 기대 결과 | 필수 경계값 |
| --- | --- | --- |
| `change_case` | 조합 변경, 결론 조합의 Net Benefit `186,000원` (추가 혜택 `227,980원` − 전환비용 `41,980원`) | 카드별 신규·유지·정리 상태 포함 · 배분 합 `32,000,000원` |
| `maintain_case` | 현재 조합 유지, `hold_reason = 임계미달`. **검토했던 최선 대안의 Net Benefit `31,000원`** — 절대 임계 `50,000원`에 미달해 유지가 정상 결과다 | 모든 보유 카드 유지, 신규·정리 0건 · 배분 합 `27,440,000원` |

`maintain_case`의 `31,000원`은 **거부된 대안의 값**이다. 이 값이 플러스라서 결론 배너에 *"바꾸면 손해"*를 쓸 수 없다 — 문구 분기는 [`../ux/README.md`](../ux/README.md) 2-5절에 있다.

**전환비용 3항목은 Fixture 선언값이다** — `CardProduct.transition.requalification_loss`(정리 시 실적 재적립 손실)와 `issuance_wait_cost`(신규 발급 대기 비용)를 출처 문구와 함께 선언하고, 연회비만 카드 데이터에서 계산한다. 코드가 이 값을 추정하지 않는다.

각 Mock Seed/Fixture는 `User`, `HeldCard`, `PastSpend`, `FutureSpendPlan`, `Constraint`, `CardProduct`, `BenefitRule`을 포함한다. 화면 카피에는 사람 이름 대신 “예시 데이터”를 사용한다.

## 3. 필수 필드

- 금액은 정수 원 단위, 날짜는 ISO `YYYY-MM-DD`, 미래 시점은 기준일 +1~12개월이다.
- `BenefitRule`에는 `rule_version`, 적용 시작·종료일, 실적구간, 한도, 제외조건이 반드시 있다.
- `unmodeled_bound`가 있으면 `unmodeled_bound_source.label`과 `as_of_date`가 반드시 있다. 출처가 없으면 필드 자체를 생략하고 0원으로 채우지 않는다.
- 카드 이름과 혜택 수치는 예시임을 명시한다. 공식 카드사 링크만 외부 이동 대상으로 허용한다.

## 4. 정답셋

각 세트는 단일 조합 결론, 카드별 신규·유지·정리 상태, Gross Benefit, 전환비용 3항목, Net Benefit, 임계 통과 여부, 카드별 배분 합, 근거 6항목을 기대값으로 가진다.

기대값 정본은 **`src/fixtures/expected.ts`**이며 `src/domain/calc.test.ts`가 이 값과 대조한다. 구현 중 기대 숫자를 바꿀 때는 이 문서, `src/fixtures/expected.ts`, `docs/ux/README.md` 4절을 같은 커밋에서 바꾼다.
