# Fixture Spec — CardFit

> 상태: 🟢 구현 기준본 · 실제 개인정보·실제 연결 데이터 사용 금지

## 1. 목적

Fixture는 페르소나를 선택하게 하는 기능이 아니라 동일한 사용자 흐름에서 “변경”과 “유지” 두 결론을 재현하는 내부 정답셋이다. UI에는 프로필 선택 화면을 만들지 않는다.

## 2. 데이터 세트

| Fixture ID | 기본 탭 기대 결과 | 필수 경계값 |
| --- | --- | --- |
| `change_case` | 조합 변경, Net Benefit `186,000원` | `LOW`는 Net `42,000원`으로 유지 반환 |
| `maintain_case` | 현재 조합 유지, Net Benefit `31,000원` | 미통과 대안을 결과에 함께 표시 |

각 Fixture는 `User`, `OwnedCard`, `PastSpend`, `FutureSpendPlan`, `Constraint`, `CardProduct`, `BenefitRule`을 포함한다. 화면 카피에는 사람 이름 대신 “예시 데이터”를 사용한다.

## 3. 필수 필드

- 금액은 정수 원 단위, 날짜는 ISO `YYYY-MM-DD`, 미래 시점은 기준일 +1~12개월이다.
- `BenefitRule`에는 `rule_version`, 적용 시작·종료일, 실적구간, 한도, 제외조건이 반드시 있다.
- `unmodeled_bound`가 있으면 `unmodeled_bound_source.label`과 `as_of_date`가 반드시 있다. 출처가 없으면 필드 자체를 생략하고 0원으로 채우지 않는다.
- 카드 이름과 혜택 수치는 예시임을 명시한다. 공식 카드사 링크만 외부 이동 대상으로 허용한다.

## 4. 정답셋

각 세트는 세 시나리오의 결론, Gross Benefit, 전환비용 3항목, Net Benefit, 임계 통과 여부, 카드별 배분 합, 근거 6항목을 기대값으로 가진다. 구현 중 기대 숫자를 바꿀 때는 이 문서와 `SRS.md`의 판정 케이스를 같은 커밋에서 바꾼다.
