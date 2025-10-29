/*
  Warnings:

  - You are about to drop the column `description` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `projectId` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `query` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `project` table. All the data in the column will be lost.
  - Made the column `title` on table `project` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ProjectVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "MessageFrom" AS ENUM ('USER', 'ASSISTANT');

-- DropIndex
DROP INDEX "public"."project_projectId_key";

-- AlterTable
ALTER TABLE "project" DROP COLUMN "description",
DROP COLUMN "projectId",
DROP COLUMN "query",
DROP COLUMN "status",
ADD COLUMN     "currentSnapshotAt" TIMESTAMP(3),
ADD COLUMN     "currentSnapshotS3Key" TEXT,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3),
ADD COLUMN     "previewUrl" TEXT,
ADD COLUMN     "sandboxId" TEXT,
ADD COLUMN     "visibility" "ProjectVisibility" NOT NULL DEFAULT 'PUBLIC',
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "chat_history" (
    "id" TEXT NOT NULL,
    "from" "MessageFrom" NOT NULL,
    "content" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chat_history" ADD CONSTRAINT "chat_history_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job" ADD CONSTRAINT "job_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
