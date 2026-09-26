import httpStatus from "http-status";
import { randomUUID } from "crypto";
import { RequestUser } from "../../middleware/checkAuth";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { PaymentStatus, SemesterStatus, UserRole } from "../../../../generated/prisma/enums";
import { getBkashIdToken } from "../../lib/bkash";
import config from "../../config";

const checkout = async (semesterId: string, user: RequestUser) => {
    const student = await prisma.student.findFirst({
        where: {
            userId: user.userId,
            isDeleted: false,
        },
    });

    if (!student) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Student profile not found"
        );
    }

    const semester = await prisma.semester.findFirst({
        where: {
            id: semesterId,
            isDeleted: false,
        },
    });

    if (!semester) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Semester not found"
        );
    }

    // Payment করার জন্য semester OPEN হতে হবে
    if (semester.status !== SemesterStatus.REGISTRATION_OPEN) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Payment is not available for this semester"
        );
    }

    // Registration/payment period check
    const now = new Date();

    if (semester.registrationStart && now < semester.registrationStart) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Semester payment has not started yet"
        );
    }

    if (semester.registrationEnd && now > semester.registrationEnd) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Semester payment period has ended"
        );
    }

    // Already paid?
    const successfulPayment = await prisma.payment.findFirst({
        where: {
            studentId: student.id,
            semesterId: semester.id,
            status: PaymentStatus.SUCCESS,
        },
    });

    if (successfulPayment) {
        throw new AppError(
            httpStatus.CONFLICT,
            "Payment for this semester has already been completed"
        );
    }

    // Existing pending payment
    const pendingPayment = await prisma.payment.findFirst({
        where: {
            studentId: student.id,
            semesterId: semester.id,
            status: PaymentStatus.PENDING,
        },
    });

    if (pendingPayment) {
        return {
            paymentId: pendingPayment.id,
            merchantInvoiceNumber: pendingPayment.merchantInvoiceNumber,
            amount: pendingPayment.amount,
            status: pendingPayment.status,
        };
    }

    const merchantInvoiceNumber = `SEM-${semester.year}-${randomUUID()}`;

    const payment = await prisma.payment.create({
        data: {
            studentId: student.id,
            semesterId: semester.id,
            amount: semester.feeAmount,
            currency: "BDT",
            provider: "BKASH",
            status: PaymentStatus.PENDING,
            merchantInvoiceNumber,
            payerReference: user.email,
        },
    });

    return {
        paymentId: payment.id,
        merchantInvoiceNumber: payment.merchantInvoiceNumber,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
    };
};

const initiateBkashPayment = async (paymentId: string, user: RequestUser) => {
    const student = await prisma.student.findFirst({
        where: {
            userId: user.userId,
            isDeleted: false,
        },
    });

    if (!student) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Student profile not found"
        );
    }

    const payment = await prisma.payment.findFirst({
        where: {
            id: paymentId,
            studentId: student.id,
        },
        include: {
            semester: true,
        },
    });

    if (!payment) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Payment not found"
        );
    }

    if (payment.status !== PaymentStatus.PENDING) {
        throw new AppError(
            httpStatus.CONFLICT,
            `Payment is already ${payment.status.toLowerCase()}`
        );
    }

    if (payment.semester.isDeleted) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Semester is no longer available"
        );
    }

    const bkashIdToken = await getBkashIdToken();

    if (!bkashIdToken) {
        throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "bKash ID token is missing"
        );
    }

    const response = await fetch(`${config.bkash_base_url}/tokenized/checkout/create`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: bkashIdToken,
                "X-App-Key": config.bkash_app_key,
            },
            body: JSON.stringify({
                agreementID: config.bkash_agreement_id,
                mode: "0011",
                payerReference: payment.payerReference || user.email,

                callbackURL: `${config.bkash_callback_url}/payment/bkash/callback`,

                merchantAssociationInfo: "University Management System",

                amount: payment.amount.toString(),
                currency: payment.currency,
                intent: "sale",

                merchantInvoiceNumber: payment.merchantInvoiceNumber,
            }),
        }
    );

    const result = await response.json();

    if (!response.ok || !result?.paymentID) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            result?.statusMessage ||
            "Failed to initiate bKash payment"
        );
    }

    await prisma.payment.update({
        where: {
            id: payment.id,
        },
        data: {
            bkashPaymentId: result.paymentID,
            merchantInvoiceNumber:
                result.merchantInvoiceNumber ||
                payment.merchantInvoiceNumber,
            getwayResponse: result,
        },
    });

    return {
        paymentId: payment.id,
        paymentUrl: result.bkashURL,
        bkashPaymentId: result.paymentID,
    };
};

const bkashCallback = async (query: Record<string, any>) => {
    const paymentId = query.paymentID;
    const status = query.status;

    if (!paymentId) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Payment ID is missing"
        );
    }

    if (!status) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Payment status is missing"
        );
    }

    const bkashIdToken = await getBkashIdToken();

    const executeResponse = await fetch(`${config.bkash_base_url}/tokenized/checkout/execute`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: bkashIdToken,
                "X-App-Key": config.bkash_app_key,
            },
            body: JSON.stringify({
                paymentID: paymentId,
            }),
        }
    );

    const result = await executeResponse.json();

    const payment = await prisma.payment.findFirst({
        where: {
            bkashPaymentId: paymentId,
        },
        include: {
            student: {
                include: {
                    user: true,
                },
            },
            semester: true,
        },
    });

    if (!payment) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Payment record not found"
        );
    }

    /*
     * SUCCESS
     */
    if (status === "success") {
        // Prevent duplicate callback processing
        if (payment.status === PaymentStatus.SUCCESS) {
            return {
                redirectUrl: `${config.frontend_url}/dashboard/payments?status=success`,
            };
        }

        await prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                status: PaymentStatus.SUCCESS,
                bkashTrxId: result.trxID,
                paidAt: result.paymentExecuteTime
                    ? new Date(result.paymentExecuteTime)
                    : new Date(),
                getwayResponse: result,
            },
        });

        return {
            redirectUrl: `${config.frontend_url}/dashboard/payments?status=success`,
        };
    }

    /*
     * FAILURE
     */
    if (status === "failure") {
        await prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                status: PaymentStatus.FAILED,
                getwayResponse: result,
            },
        });

        return {
            redirectUrl: `${config.frontend_url}/dashboard/payments?status=failure`,
        };
    }

    /*
     * CANCEL
     */
    if (status === "cancel") {
        await prisma.payment.update({
            where: {
                id: payment.id,
            },
            data: {
                status: PaymentStatus.CANCELLED,
                getwayResponse: result,
            },
        });

        return {
            redirectUrl: `${config.frontend_url}/dashboard/payments?status=cancel`,
        };
    }

    await prisma.payment.update({
        where: {
            id: payment.id,
        },
        data: {
            getwayResponse: result,
        },
    });

    return {
        redirectUrl: `${config.frontend_url}/dashboard/payments?status=failed`,
    };
};

const getMyPayments = async (user: RequestUser) => {
    const student = await prisma.student.findFirst({
        where: {
            userId: user.userId,
            isDeleted: false,
        },
    });

    if (!student) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Student profile not found"
        );
    }

    return prisma.payment.findMany({
        where: {
            studentId: student.id,
        },
        include: {
            semester: {
                select: {
                    id: true,
                    name: true,
                    year: true,
                    feeAmount: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

const getPaymentById = async (paymentId: string, user: RequestUser) => {
    const payment = await prisma.payment.findUnique({
        where: {
            id: paymentId,
        },
        include: {
            student: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            semester: true,
        },
    });

    if (!payment) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Payment not found"
        );
    }

    if (user.role === UserRole.STUDENT) {
        if (payment.student.userId !== user.userId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You can only view your own payment"
            );
        }
    }

    return payment;
};

export const PaymentService = {
    checkout,
    initiateBkashPayment,
    bkashCallback,
    getMyPayments,
    getPaymentById,
};