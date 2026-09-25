import express from "express";
import { RegistrationController } from "./registration.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";

const router = express.Router();

router.post(
    "/",
    auth(UserRole.STUDENT),
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
    RegistrationController.updateRegistrationStatus
);

export const RegistrationRoutes = router;