import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { SectionController } from "./section.controller";

const router = Router()

router.post(
    "/",
    auth(UserRole.ADMIN),
    SectionController.createSection
);

router.get(
    "/",
    auth(
        UserRole.ADMIN,
        UserRole.STUDENT,
        UserRole.INSTRUCTOR
    ),
    SectionController.getAllSections
);

router.get(
    "/:sectionId",
    auth(
        UserRole.ADMIN,
        UserRole.STUDENT,
        UserRole.INSTRUCTOR
    ),
    SectionController.getSectionById
);

router.patch(
    "/:sectionId",
    auth(UserRole.ADMIN),
    SectionController.updateSection
);

router.delete(
    "/:sectionId",
    auth(UserRole.ADMIN),
    SectionController.deleteSection
);

router.get(
    "/:sectionId/students",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    SectionController.getSectionStudents
);

export const SectionRoutes = router