-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "stripeCustomerId" VARCHAR(100),
ADD COLUMN     "stripeSubscriptionId" VARCHAR(100),
ADD COLUMN     "trialDaysLeft" INTEGER,
ADD COLUMN     "trialEndDate" TIMESTAMP(3),
ADD COLUMN     "trialStartDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
