/*
  Warnings:

  - A unique constraint covering the columns `[courseId,semesterId]` on the table `sections` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "sections_courseId_semesterId_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "sections_courseId_semesterId_key" ON "sections"("courseId", "semesterId");
