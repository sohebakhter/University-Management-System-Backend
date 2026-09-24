import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { CourseController } from "./course.controller";

const router = Router()

router.post(
    "/",
    auth(UserRole.ADMIN),
    CourseController.createCourse
);

router.get(
    "/",
    CourseController.getAllCourses
);

router.get("/:courseId", CourseController.getCourseById);

router.patch(
    "/:courseId",
    auth(UserRole.ADMIN),
    CourseController.updateCourse
);

router.delete(
    "/:courseId",
    auth(UserRole.ADMIN),
    CourseController.deleteCourse
);

export const CourseRoutes = router

