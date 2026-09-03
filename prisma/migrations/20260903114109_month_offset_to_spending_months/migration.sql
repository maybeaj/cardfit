-- 시점(month_offset)을 기간(spending_months)으로 바꾼다 (T10 · UI-002).
--
-- 두 값의 뜻이 달라 기존 행을 그대로 옮길 수 없다 — `3개월 내에 쓴다`와
-- `3개월에 걸쳐 쓴다`는 다른 진술이다. 기존 행은 화면 기본값인 3개월로 채우고,
-- 잘못된 변환을 사실인 것처럼 남기지 않는다.
ALTER TABLE "suggested_spend" DROP COLUMN "month_offset";
ALTER TABLE "suggested_spend" ADD COLUMN "spending_months" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "suggested_spend" ALTER COLUMN "spending_months" DROP DEFAULT;

ALTER TABLE "future_spend_plan" DROP COLUMN "month_offset";
ALTER TABLE "future_spend_plan" ADD COLUMN "spending_months" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "future_spend_plan" ALTER COLUMN "spending_months" DROP DEFAULT;
