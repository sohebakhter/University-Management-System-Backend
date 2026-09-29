import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import {
    CheckoutZodSchema,
    InitiateBkashPaymentZodSchema,
} from "./payment.validation";


const router = Router();

router.post(
    "/checkout",
    auth(UserRole.STUDENT),
    validateRequest(CheckoutZodSchema),
    PaymentController.checkout
);

router.post(
    "/bkash/initiate",
    auth(UserRole.STUDENT),
    validateRequest(InitiateBkashPaymentZodSchema),
    PaymentController.initiateBkashPayment
);

router.get(
    "/bkash/callback",
    PaymentController.bkashCallback
);

router.get(
    "/my",
    auth(UserRole.STUDENT),
    PaymentController.getMyPayments
);

router.get(
    "/:paymentId",
    auth(UserRole.ADMIN, UserRole.STUDENT),
    PaymentController.getPaymentById
);

router.patch(
    "/:paymentId/confirm",
    auth(UserRole.ADMIN),
    PaymentController.confirmPayment
);

export const PaymentRoutes = router;