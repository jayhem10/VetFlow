-- AlterTable
ALTER TABLE "Clinic" ALTER COLUMN "trialEndDate" SET DEFAULT (now() + interval '14 days');
