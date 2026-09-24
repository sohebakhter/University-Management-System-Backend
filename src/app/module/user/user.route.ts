import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { UserController } from "./user.controller";

const router = Router()

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
    UserController.updateUserStatus
);

router.patch(
    "/:userId",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT),
    UserController.updateUser
);

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
    UserController.updateStudent
);

router.get(
    "/instructors",
    auth(UserRole.ADMIN),
    UserController.getAllInstructors
);

router.get(
    "instructors/:instructorId",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    UserController.getSingleInstructor
);

router.patch(
    "instructors/:instructorId",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    UserController.updateInstructor
);

export const UserRoutes = router