-- CreateEnum
CREATE TYPE "InstructorStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "instructors" ADD COLUMN     "instructorStatus" "InstructorStatus" NOT NULL DEFAULT 'PENDING';
