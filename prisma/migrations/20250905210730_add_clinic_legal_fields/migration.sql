/*
  Warnings:

  - You are about to drop the column `onboardingExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `onboardingSecret` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "bic" VARCHAR(11),
ADD COLUMN     "iban" VARCHAR(34),
ADD COLUMN     "legalForm" VARCHAR(20),
ADD COLUMN     "nafCode" VARCHAR(10),
ADD COLUMN     "siret" VARCHAR(14),
ADD COLUMN     "tvaNumber" VARCHAR(20),
ADD COLUMN     "website" VARCHAR(255);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "onboardingExpiresAt",
DROP COLUMN "onboardingSecret";
