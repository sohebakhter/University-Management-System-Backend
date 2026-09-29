import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
    UpdateInstructorZodSchema,
    UpdateStudentZodSchema,
    UpdateUserStatusZodSchema,
    UpdateUserZodSchema,
} from "./user.validation";

const router = Router()

// ── Specific / static routes first ────────────────────────────────────────

router.get(
    "/students",
    auth(UserRole.ADMIN),
    UserController.getAllStudents
);

router.get(
    "/students/:studentId",
    auth(UserRole.ADMIN, UserRole.STUDENT),
    UserController.getSingleStudent
);

router.patch(
    "/students/:studentId",
    auth(UserRole.ADMIN, UserRole.STUDENT),
    validateRequest(UpdateStudentZodSchema),
    UserController.updateStudent
);

router.get(
    "/instructors",
    auth(UserRole.ADMIN),
    UserController.getAllInstructors
);

router.get(
    "/instructors/:instructorId",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    UserController.getSingleInstructor
);

router.patch(
    "/instructors/:instructorId",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    validateRequest(UpdateInstructorZodSchema),
    UserController.updateInstructor
);
router.patch(
    "/instructors/:instructorId/status",
    auth(UserRole.ADMIN),
    UserController.updateInstructorStatus
);

// ── Generic / dynamic routes last ──────────────────────────────────────────

router.get(
    "/",
    auth(UserRole.ADMIN),
    UserController.getAllUser
);

router.get(
    "/:userId",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT),
    UserController.getSingleUser
);

router.patch(
    "/:userId/status",
    auth(UserRole.ADMIN),
    validateRequest(UpdateUserStatusZodSchema),
    UserController.updateUserStatus
);

router.patch(
    "/:userId",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT),
    validateRequest(UpdateUserZodSchema),
    UserController.updateUser
);

export const UserRoutes = router