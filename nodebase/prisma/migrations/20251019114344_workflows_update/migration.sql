/*
  Warnings:

  - You are about to drop the `Workflow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Workflow";

-- CreateTable
CREATE TABLE "workflow" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "workflow" ADD CONSTRAINT "workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
