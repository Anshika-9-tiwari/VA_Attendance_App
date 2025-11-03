/*
  Warnings:

  - The values [PAID,UNPAID,ANNUAL] on the enum `LeaveType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."LeaveType_new" AS ENUM ('SICK', 'CASUAL');
ALTER TABLE "public"."Leave" ALTER COLUMN "leaveType" TYPE "public"."LeaveType_new" USING ("leaveType"::text::"public"."LeaveType_new");
ALTER TYPE "public"."LeaveType" RENAME TO "LeaveType_old";
ALTER TYPE "public"."LeaveType_new" RENAME TO "LeaveType";
DROP TYPE "public"."LeaveType_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Attendance" ADD COLUMN     "siteName" TEXT;

-- CreateTable
CREATE TABLE "public"."WorkReport" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "customerName" TEXT NOT NULL,
    "location" TEXT,
    "purpose" TEXT,
    "inTime" TIMESTAMP(3),
    "outTime" TIMESTAMP(3),
    "issue" TEXT,
    "machineSystem" TEXT,
    "reportedBy" TEXT,
    "actionTaken" TEXT,
    "status" TEXT,
    "task" TEXT,
    "actionRequired" TEXT,
    "remark" TEXT,
    "partNumber" TEXT,
    "serialNumber" TEXT,
    "qty" INTEGER,
    "additionalNote" TEXT,
    "preparedBy" TEXT,
    "submittedTo" TEXT,
    "submissionTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkReport_pkey" PRIMARY KEY ("id")
);
