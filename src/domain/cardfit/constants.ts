/**
 * 계산 상수 — 화면과 엔진이 함께 읽는다.
 *
 * 엔진 모듈(`calc.ts`)에 두면 임계값 하나를 문구에 쓰려고 조합 열거 코드까지 클라이언트
 * 번들로 끌고 오게 된다. 계산은 Server Action에서만 돌아야 하므로(`ADR-004`) 상수만
 * 따로 둔다.
 */

/** `D-002` — 실측이 아니라 과잉 추천을 막는 팀 합의 상수 🟡 */
export const NET_BENEFIT_FLOOR = 50_000
export const NET_BENEFIT_RATIO = 0.15

/** `T41` — 기준일 경고 임계 (팀 상수 🟡) */
export const STALE_AS_OF_MONTHS = 3

/** `T40` — 12개월 창의 7개월 이후 발급이면 연회비 통째 반영을 고지한다 */
export const ANNUAL_FEE_NOTICE_MONTH = 7
