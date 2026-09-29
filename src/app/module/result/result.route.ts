import { Router } from "express";
import { ResultController } from "./result.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import {
    BulkCreateResultZodSchema,
    CreateResultZodSchema,
    UpdateResultZodSchema,
} from "./result.validation";

const router = Router();

router.post(
    "/",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    validateRequest(CreateResultZodSchema),
    ResultController.createResult
);

router.post(
    "/bulk",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    validateRequest(BulkCreateResultZodSchema),
    ResultController.bulkCreateResult
);

router.get(
    "/my",
    auth(UserRole.STUDENT),
    ResultController.getMyResults
);

router.get(
    "/registration/:registrationId",
    auth(
        UserRole.ADMIN,
        UserRole.INSTRUCTOR,
        UserRole.STUDENT
    ),
    ResultController.getResultsByRegistration
);

router.patch(
    "/:resultId",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    validateRequest(UpdateResultZodSchema),
    ResultController.updateResult
);

export const ResultRoutes = router;