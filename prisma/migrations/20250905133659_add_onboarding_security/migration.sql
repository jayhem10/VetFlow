-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingExpiresAt" TIMESTAMP(3),
ADD COLUMN     "onboardingSecret" VARCHAR(64);
