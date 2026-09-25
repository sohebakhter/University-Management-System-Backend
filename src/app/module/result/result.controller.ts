import { Request, Response } from "express";
import httpStatus from "http-status";
import { ResultService } from "./result.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createResult = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body
    const user = req.user!
    const result = await ResultService.createResult(payload, user);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Result published successfully",
        data: result,
    });
}
);

const bulkCreateResult = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body
    const user = req.user!
    const result = await ResultService.bulkCreateResult(payload, user);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Results published successfully",
        data: result,
    });
}
);

const getMyResults = catchAsync(async (req: Request, res: Response) => {
    const user = req.user!
    const result = await ResultService.getMyResults(user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Your results retrieved successfully",
        data: result,
    });
}
);

const getResultsByRegistration = catchAsync(async (req: Request, res: Response) => {
    const registrationId = req.params.registrationId as string
    const user = req.user!
    const result = await ResultService.getResultsByRegistration(registrationId, user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Registration results retrieved successfully",
        data: result,
    });
}
);

const updateResult = catchAsync(async (req: Request, res: Response) => {
    const resultId = req.params.resultId as string
    const payload = req.body
    const user = req.user!
    const result = await ResultService.updateResult(resultId, payload, user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Result updated successfully",
        data: result,
    });
}
);

export const ResultController = {
    createResult,
    bulkCreateResult,
    getMyResults,
    getResultsByRegistration,
    updateResult,
};