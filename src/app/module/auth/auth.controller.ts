import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";

const registerPatient = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    await AuthService.registerPatient(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Email Verification OTP Sent successfully",
        data: null,
    });
});
const verifyUserEmail = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await AuthService.verifyUserEmail(payload);

    const { accessToken, refreshToken, user } = result;

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Email verified Successfully.",
        data: {
            accessToken,
            refreshToken,
            user,
        },
    });
});



export const AuthController = {
    registerPatient,
    verifyUserEmail
};
