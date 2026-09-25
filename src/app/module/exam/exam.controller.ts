import { Request, Response } from "express";
import httpStatus from "http-status";
import { ExamService } from "./exam.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createExam = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body
    const user = req.user!
    const result = await ExamService.createExam(payload, user);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Exam created successfully",
        data: result,
    });
}
);

const getExams = catchAsync(async (req: Request, res: Response) => {
    const result = await ExamService.getExams(req.user!);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Exams retrieved successfully",
        data: result,
    });
}
);

const getExamById = catchAsync(async (req: Request, res: Response) => {
    const examId = req.params.examId as string
    const user = req.user!
    const result = await ExamService.getExamById(examId, user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Exam retrieved successfully",
        data: result,
    });
}
);

const updateExam = catchAsync(async (req: Request, res: Response) => {
    const examId = req.params.examId as string
    const payload = req.body
    const user = req.user!
    const result = await ExamService.updateExam(examId, payload, user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Exam updated successfully",
        data: result,
    });
}
);

const deleteExam = catchAsync(async (req: Request, res: Response) => {
    const examId = req.params.examId as string
    const result = await ExamService.deleteExam(examId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Exam deleted successfully",
        data: result,
    });
}
);

export const ExamController = {
    createExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam,
};