-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "error" TEXT,
    "errorStack" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "inngestEventId" TEXT NOT NULL,
    "output" JSONB,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Execution_inngestEventId_key" ON "Execution"("inngestEventId");

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
