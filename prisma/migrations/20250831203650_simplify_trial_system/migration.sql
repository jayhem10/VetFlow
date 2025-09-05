/*
  Warnings:

  - You are about to drop the column `trialDaysLeft` on the `Clinic` table. All the data in the column will be lost.
  - You are about to drop the column `trialStartDate` on the `Clinic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Clinic" DROP COLUMN "trialDaysLeft",
DROP COLUMN "trialStartDate",
ALTER COLUMN "trialEndDate" SET DEFAULT (now() + interval '14 days');
