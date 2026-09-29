import { Router } from "express";
import { AuthController } from "./auth.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import {
    ForgotPasswordZodSchema,
    GoogleLoginZodSchema,
    LoginZodSchema,
    RegisterZodSchema,
    ResetPasswordZodSchema,
    VerifyEmailZodSchema,
} from "./auth.validation";

const router = Router();

router.post(
    "/register",
    validateRequest(RegisterZodSchema),
    AuthController.registerUser,
);
router.post(
    "/verify-email",
    validateRequest(VerifyEmailZodSchema),
    AuthController.verifyUserEmail,
);

router.post(
    "/login",
    validateRequest(LoginZodSchema),
    AuthController.loginUser,
);
router.get(
    "/me",
    auth(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT),
    AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);
router.post(
    "/google",
    validateRequest(GoogleLoginZodSchema),
    AuthController.googleLogin,
);
router.post(
    "/forgot-password",
    validateRequest(ForgotPasswordZodSchema),
    AuthController.forgotPassword,
);
router.post(
    "/reset-password",
    validateRequest(ResetPasswordZodSchema),
    AuthController.resetPassword,
);

export const AuthRoutes = router;
