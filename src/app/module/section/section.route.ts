import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { SectionController } from "./section.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
    CreateSectionZodSchema,
    UpdateSectionZodSchema,
} from "./section.validation";

const router = Router()

router.post(
    "/",
    auth(UserRole.ADMIN),
    validateRequest(CreateSectionZodSchema),
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
    validateRequest(UpdateSectionZodSchema),
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