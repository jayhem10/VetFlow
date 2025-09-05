-- AlterTable
ALTER TABLE "Clinic" ALTER COLUMN "trialEndDate" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false;
