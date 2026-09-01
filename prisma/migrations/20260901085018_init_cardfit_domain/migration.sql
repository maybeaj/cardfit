-- CreateEnum
CREATE TYPE "SpendDirection" AS ENUM ('INCREASE', 'DECREASE');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('NEW', 'KEEP', 'REMOVE');

-- CreateEnum
CREATE TYPE "Decision" AS ENUM ('CHANGE', 'HOLD');

-- CreateEnum
CREATE TYPE "HoldReason" AS ENUM ('THRESHOLD_NOT_MET', 'CONSTRAINT_TOO_TIGHT');

-- CreateTable
CREATE TABLE "fixture" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "as_of_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fixture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_user" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_product" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "annual_fee" INTEGER NOT NULL,
    "official_url" TEXT NOT NULL,
    "owned" BOOLEAN NOT NULL,
    "qualifying_month_spend" INTEGER NOT NULL,
    "issued_at" DATE,
    "requalification_loss" INTEGER NOT NULL,
    "issuance_wait_cost" INTEGER NOT NULL,
    "transition_source_label" TEXT NOT NULL,
    "transition_source_date" DATE NOT NULL,

    CONSTRAINT "card_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefit_rule" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "rule_version" TEXT NOT NULL,
    "as_of_date" DATE NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE NOT NULL,
    "categories" TEXT[],
    "excluded" TEXT[],

    CONSTRAINT "benefit_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefit_tier" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "min_monthly_spend" INTEGER NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "monthly_cap" INTEGER NOT NULL,

    CONSTRAINT "benefit_tier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unmodeled_bound" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "bound" INTEGER NOT NULL,
    "source_label" TEXT NOT NULL,
    "source_date" DATE NOT NULL,

    CONSTRAINT "unmodeled_bound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "past_spend" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "merchant" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "paid_at" DATE NOT NULL,

    CONSTRAINT "past_spend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggested_spend" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "direction" "SpendDirection" NOT NULL,
    "month_offset" INTEGER NOT NULL,

    CONSTRAINT "suggested_spend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_constraint" (
    "fixture_id" TEXT NOT NULL,
    "max_cards" INTEGER NOT NULL,
    "allow_new_card" BOOLEAN NOT NULL,
    "max_new_cards" INTEGER NOT NULL,

    CONSTRAINT "plan_constraint_pkey" PRIMARY KEY ("fixture_id")
);

-- CreateTable
CREATE TABLE "calculation" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "as_of_date" DATE NOT NULL,
    "plan_snapshot" JSONB NOT NULL,
    "constraint_snapshot" JSONB NOT NULL,
    "rule_versions" JSONB NOT NULL,
    "decision" "Decision" NOT NULL,
    "hold_reason" "HoldReason",
    "stale_as_of_warning" BOOLEAN NOT NULL,
    "excluded_cards" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_candidate" (
    "id" TEXT NOT NULL,
    "calculation_id" TEXT NOT NULL,
    "candidate_key" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "gross_benefit_absolute" INTEGER NOT NULL,
    "gross_benefit" INTEGER NOT NULL,
    "annual_fee_cost" INTEGER NOT NULL,
    "requalification_loss" INTEGER NOT NULL,
    "issuance_wait_cost" INTEGER NOT NULL,
    "net_benefit" INTEGER NOT NULL,
    "passes_threshold" BOOLEAN NOT NULL,
    "statuses" JSONB NOT NULL,

    CONSTRAINT "plan_candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation" (
    "id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "benefit" INTEGER NOT NULL,

    CONSTRAINT "allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "confirmed_plan" (
    "id" TEXT NOT NULL,
    "calculation_id" TEXT NOT NULL,
    "candidate_key" TEXT NOT NULL,
    "as_of_date" DATE NOT NULL,
    "rule_versions" JSONB NOT NULL,
    "net_benefit" INTEGER NOT NULL,
    "confirmed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "confirmed_plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_fixture_id_label_key" ON "app_user"("fixture_id", "label");

-- CreateIndex
CREATE UNIQUE INDEX "benefit_rule_card_id_key" ON "benefit_rule"("card_id");

-- CreateIndex
CREATE UNIQUE INDEX "benefit_tier_rule_id_min_monthly_spend_key" ON "benefit_tier"("rule_id", "min_monthly_spend");

-- CreateIndex
CREATE INDEX "past_spend_fixture_id_category_idx" ON "past_spend"("fixture_id", "category");

-- CreateIndex
CREATE INDEX "calculation_fixture_id_created_at_idx" ON "calculation"("fixture_id", "created_at");

-- CreateIndex
CREATE INDEX "plan_candidate_calculation_id_role_idx" ON "plan_candidate"("calculation_id", "role");

-- AddForeignKey
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_product" ADD CONSTRAINT "card_product_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_rule" ADD CONSTRAINT "benefit_rule_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "card_product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "benefit_tier" ADD CONSTRAINT "benefit_tier_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "benefit_rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unmodeled_bound" ADD CONSTRAINT "unmodeled_bound_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "benefit_rule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "past_spend" ADD CONSTRAINT "past_spend_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggested_spend" ADD CONSTRAINT "suggested_spend_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_constraint" ADD CONSTRAINT "plan_constraint_fixture_id_fkey" FOREIGN KEY ("fixture_id") REFERENCES "fixture"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_candidate" ADD CONSTRAINT "plan_candidate_calculation_id_fkey" FOREIGN KEY ("calculation_id") REFERENCES "calculation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation" ADD CONSTRAINT "allocation_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "plan_candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
