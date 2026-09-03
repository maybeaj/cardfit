-- AlterTable
ALTER TABLE "future_spend_plan" DROP COLUMN "direction";

-- AlterTable
ALTER TABLE "suggested_spend" DROP COLUMN "direction";

-- DropEnum
DROP TYPE "SpendDirection";

