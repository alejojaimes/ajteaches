-- AlterEnum
ALTER TYPE "EventType" ADD VALUE 'engagement_end';

-- AlterTable
ALTER TABLE "PostEvent" ADD COLUMN     "durationMs" INTEGER;
