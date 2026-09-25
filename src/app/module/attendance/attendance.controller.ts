import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AttendanceService } from "./attendance.service";
import httpStatus from "http-status"

const markAttendance = catchAsync(async (req, res) => {
    const payload = req.body
    const user = req.user!

    const result = await AttendanceService.markAttendance(payload, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Attendance marked successfully",
        data: result,
    });
});

const bulkMarkAttendance = catchAsync(async (req, res) => {
    const payload = req.body
    const user = req.user!
    const result = await AttendanceService.bulkMarkAttendance(payload, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Attendance marked successfully",
        data: result,
    });
});

const getMyAttendance = catchAsync(async (req, res) => {
    const result = await AttendanceService.getMyAttendance(req.user!);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Attendance retrieved successfully",
        data: result,
    });
});

const getSectionAttendance = catchAsync(async (req, res) => {
    const { sectionId } = req.params;

    const result = await AttendanceService.getSectionAttendance(sectionId as string, req.user!);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Section attendance retrieved successfully",
        data: result,
    });
}
);

const updateAttendance = catchAsync(async (req, res) => {
    const { attendanceId } = req.params;
    const { status } = req.body;
    const user = req.user!
    const result = await AttendanceService.updateAttendance(attendanceId as string, status, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Attendance updated successfully",
        data: result,
    });
});

export const AttendanceController = {
    markAttendance,
    bulkMarkAttendance,
    getMyAttendance,
    getSectionAttendance,
    updateAttendance
}