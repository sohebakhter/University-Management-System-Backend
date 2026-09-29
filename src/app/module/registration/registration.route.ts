import express from "express";
import { RegistrationController } from "./registration.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import {
    CreateRegistrationZodSchema,
    UpdateRegistrationStatusZodSchema,
} from "./registration.validation";

const router = express.Router();

router.post(
    "/",
    auth(UserRole.STUDENT),
    validateRequest(CreateRegistrationZodSchema),
    RegistrationController.createRegistration
);

router.get(
    "/my",
    auth(UserRole.STUDENT),
    RegistrationController.getMyRegistrations
);

router.get(
    "/",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    RegistrationController.getAllRegistrations
);

router.get(
    "/:registrationId",
    auth(
        UserRole.ADMIN,
        UserRole.INSTRUCTOR,
        UserRole.STUDENT
    ),
    RegistrationController.getRegistrationById
);

router.patch(
    "/:registrationId/drop",
    auth(UserRole.STUDENT, UserRole.ADMIN),
    RegistrationController.dropRegistration
);

router.patch(
    "/:registrationId/status",
    auth(UserRole.ADMIN),
    validateRequest(UpdateRegistrationStatusZodSchema),
    RegistrationController.updateRegistrationStatus
);

export const RegistrationRoutes = router;