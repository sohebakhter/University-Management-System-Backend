/*
  Warnings:

  - You are about to drop the column `employeeId` on the `instructors` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `students` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "instructors_employeeId_key";

-- DropIndex
DROP INDEX "students_studentId_key";

-- AlterTable
ALTER TABLE "instructors" DROP COLUMN "employeeId";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "studentId";
