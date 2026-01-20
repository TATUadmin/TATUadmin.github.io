-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "visibilityBoostActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visibilityBoostEndDate" TIMESTAMP(3);
