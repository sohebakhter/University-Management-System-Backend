import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { SemesterController } from "./semester.controller";

const router = Router()

router.post(
    "/",
    auth(UserRole.ADMIN),
    SemesterController.createSemester
);

router.get(
    "/",
    SemesterController.getAllSemesters
);

router.get(
    "/:semesterId",
    SemesterController.getSemesterById
);

router.patch(
    "/:semesterId",
    auth(UserRole.ADMIN),
    SemesterController.updateSemester
);

router.patch(
    "/:semesterId/status",
    auth(UserRole.ADMIN),
    SemesterController.updateSemesterStatus
);

router.delete(
    "/:semesterId",
    auth(UserRole.ADMIN),
    SemesterController.deleteSemester
);

export const SemesterRoutes = router