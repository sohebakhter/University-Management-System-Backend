import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { AttendanceController } from "./attendance.controller";

const router = Router()

router.post(
    "/",
    auth(UserRole.INSTRUCTOR),
    AttendanceController.markAttendance
);

router.post(
    "/bulk",
    auth(UserRole.INSTRUCTOR),
    AttendanceController.bulkMarkAttendance
);

router.get(
    "/my",
    auth(UserRole.STUDENT),
    AttendanceController.getMyAttendance
);

router.get(
    "/section/:sectionId",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    AttendanceController.getSectionAttendance
);

router.patch(
    "/:attendanceId",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    AttendanceController.updateAttendance
);
export const AttendanceRoutes = router