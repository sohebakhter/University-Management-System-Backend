import { Router } from "express";
import { AuthController } from "./auth.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";

const router = Router();

router.post(
    "/register",
    AuthController.registerUser,
);
router.post(
    "/verify-email",
    AuthController.verifyUserEmail,
);

router.post(
    "/login",
    AuthController.loginUser,
);
router.get(
    "/me",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT),
    AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/google", AuthController.googleLogin);
router.post(
    "/forgot-password",
    AuthController.forgotPassword,
);
router.post(
    "/reset-password",
    AuthController.resetPassword,
);

export const AuthRoutes = router;
