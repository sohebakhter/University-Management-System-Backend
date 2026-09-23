import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post(
    "/register",
    AuthController.registerPatient,
);
router.post(
    "/verify-email",
    AuthController.verifyUserEmail,
);

export const AuthRoutes = router;
