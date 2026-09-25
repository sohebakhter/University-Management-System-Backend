import { Router } from "express";
import { ResultController } from "./result.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";

const router = Router();

router.post(
    "/",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
    ResultController.createResult
);

router.post(
    "/bulk",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR),
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
    ResultController.updateResult
);

export const ResultRoutes = router;