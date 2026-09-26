import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { auth } from "../../middleware/checkAuth";
import { UserRole } from "../../../../generated/prisma/enums";


const router = Router();

router.post(
    "/checkout",
    auth(UserRole.STUDENT),
    PaymentController.checkout
);

router.post(
    "/bkash/initiate",
    auth(UserRole.STUDENT),
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

export const PaymentRoutes = router;