-- AlterTable
ALTER TABLE "calculation" ADD COLUMN     "session_id" TEXT;

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "fixture_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "future_spend_plan" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "plan_key" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "direction" "SpendDirection" NOT NULL,
    "month_offset" INTEGER NOT NULL,
    "origin" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "future_spend_plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "future_spend_plan_session_id_plan_key_key" ON "future_spend_plan"("session_id", "plan_key");

-- AddForeignKey
ALTER TABLE "future_spend_plan" ADD CONSTRAINT "future_spend_plan_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation" ADD CONSTRAINT "calculation_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmed_plan" ADD CONSTRAINT "confirmed_plan_calculation_id_fkey" FOREIGN KEY ("calculation_id") REFERENCES "calculation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
