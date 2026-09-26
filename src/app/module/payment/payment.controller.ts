import { Request, Response } from "express";
import httpStatus from "http-status";
import { PaymentService } from "./payment.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const checkout = catchAsync(async (req: Request, res: Response) => {
    const semesterId = req.body.semesterId
    const user = req.user!
    const result = await PaymentService.checkout(semesterId, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Payment checkout created successfully",
        data: result,
    });
}
);

const initiateBkashPayment = catchAsync(async (req: Request, res: Response) => {
    const paymentId = req.body.paymentId
    const user = req.user!
    const result = await PaymentService.initiateBkashPayment(paymentId, user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "bKash payment initiated successfully",
        data: result,
    });
}
);

const bkashCallback = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await PaymentService.bkashCallback(query);

    return res.redirect(result.redirectUrl);
}
);

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentService.getMyPayments(req.user!);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment history retrieved successfully",
        data: result,
    });
}
);

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
    const paymentId = req.params.paymentId as string
    const user = req.user!
    const result = await PaymentService.getPaymentById(paymentId, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment retrieved successfully",
        data: result,
    });
}
);

export const PaymentController = {
    checkout,
    initiateBkashPayment,
    bkashCallback,
    getMyPayments,
    getPaymentById,
};