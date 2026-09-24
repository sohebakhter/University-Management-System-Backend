import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SemesterService } from "./semester.service";
import httpStatus from "http-status"

const createSemester = catchAsync(async (req, res) => {
    const result = await SemesterService.createSemester(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Semester created successfully",
        data: result,
    });
});

const getAllSemesters = catchAsync(async (req, res) => {
    const result = await SemesterService.getAllSemesters();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Semesters retrieved successfully",
        data: result,
    });
});

const getSemesterById = catchAsync(async (req, res) => {
    const { semesterId } = req.params;

    const result = await SemesterService.getSemesterById(semesterId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Semester retrieved successfully",
        data: result,
    });
});

const updateSemester = catchAsync(async (req, res) => {
    const { semesterId } = req.params;
    const payload = req.body
    const result = await SemesterService.updateSemester(semesterId as string, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Semester updated successfully",
        data: result,
    });
});

const updateSemesterStatus = catchAsync(async (req, res) => {
    const { semesterId } = req.params;
    const { status } = req.body;

    const result = await SemesterService.updateSemesterStatus(semesterId as string, status);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Semester status updated successfully",
        data: result,
    });
});

const deleteSemester = catchAsync(async (req, res) => {
    const { semesterId } = req.params;

    const result = await SemesterService.deleteSemester(semesterId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Semester deleted successfully",
        data: result,
    });
});

export const SemesterController = {
    createSemester,
    getAllSemesters,
    getSemesterById,
    updateSemester,
    updateSemesterStatus,
    deleteSemester
}