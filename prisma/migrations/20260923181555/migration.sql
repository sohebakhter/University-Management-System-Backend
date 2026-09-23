-- DropForeignKey
ALTER TABLE "instructors" DROP CONSTRAINT "instructors_departmentId_fkey";

-- AlterTable
ALTER TABLE "instructors" ALTER COLUMN "departmentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "instructors" ADD CONSTRAINT "instructors_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
