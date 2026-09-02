-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('CREDIT', 'CHECK');

-- AlterTable
ALTER TABLE "card_product" ADD COLUMN     "card_type" "CardType" NOT NULL DEFAULT 'CREDIT';

-- AlterTable
ALTER TABLE "past_spend" ADD COLUMN     "approval_no" TEXT,
ADD COLUMN     "card_id" TEXT,
ADD COLUMN     "installment_months" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "industry" DROP NOT NULL,
ALTER COLUMN "paid_at" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "card_monthly_performance" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "year_month" TEXT NOT NULL,
    "prev_month_spending" INTEGER NOT NULL,
    "billed_amount" INTEGER NOT NULL,
    "points_balance" INTEGER NOT NULL,

    CONSTRAINT "card_monthly_performance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "card_monthly_performance_card_id_year_month_key" ON "card_monthly_performance"("card_id", "year_month");

-- CreateIndex
CREATE INDEX "past_spend_card_id_paid_at_idx" ON "past_spend"("card_id", "paid_at");

-- CreateIndex
CREATE UNIQUE INDEX "past_spend_fixture_id_approval_no_key" ON "past_spend"("fixture_id", "approval_no");

-- AddForeignKey
ALTER TABLE "card_monthly_performance" ADD CONSTRAINT "card_monthly_performance_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "card_product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "past_spend" ADD CONSTRAINT "past_spend_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "card_product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

