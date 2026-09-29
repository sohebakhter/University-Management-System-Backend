import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { SemesterController } from "./semester.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
    CreateSemesterZodSchema,
    UpdateSemesterStatusZodSchema,
    UpdateSemesterZodSchema,
} from "./semester.validation";

const router = Router()

router.post(
    "/",
    auth(UserRole.ADMIN),
    validateRequest(CreateSemesterZodSchema),
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
    validateRequest(UpdateSemesterZodSchema),
    SemesterController.updateSemester
);

router.patch(
    "/:semesterId/status",
    auth(UserRole.ADMIN),
    validateRequest(UpdateSemesterStatusZodSchema),
    SemesterController.updateSemesterStatus
);

router.delete(
    "/:semesterId",
    auth(UserRole.ADMIN),
    SemesterController.deleteSemester
);

export const SemesterRoutes = router