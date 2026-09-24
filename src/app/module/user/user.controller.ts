import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status"

const getAllUser = catchAsync(async (req: Request, res: Response) => {
    const query = req.query
    const result = await UserServices.getAllUser(query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `Users retrieved successfully`,
        data: result,
    });
});
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const result = await UserServices.getSingleUser(userId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `Single User retrieved successfully`,
        data: result,
    });
});
const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { status } = req.body;

    const result = await UserServices.updateUserStatus(userId as string, status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `User ${status.toLowerCase()} successfully`,
        data: result,
    });
});

const updateUser = catchAsync(async (req, res) => {
    const userId = req.params.userId as string;
    const payload = req.body
    const user = req.user!

    const result = await UserServices.updateUser(userId, payload, user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User updated successfully",
        data: result,
    });
});

const getAllStudents = catchAsync(async (req, res) => {
    const result = await UserServices.getAllStudents();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Students retrieved successfully",
        data: result,
    });
});

const getSingleStudent = catchAsync(async (req, res) => {
    const studentId = req.params.studentId as string;
    const user = req.user!
    const result = await UserServices.getSingleStudent(studentId, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Student profile retrieved successfully",
        data: result,
    });
});
const updateStudent = catchAsync(async (req, res) => {
    const studentId = req.params.studentId as string;
    const payload = req.body
    const user = req.user!

    const result = await UserServices.updateStudent(studentId, payload, user);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Student profile updated successfully",
        data: result,
    });
});

const getAllInstructors = catchAsync(async (req, res) => {
    const result = await UserServices.getAllInstructors();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Instructors retrieved successfully",
        data: result,
    });
});

const getSingleInstructor = catchAsync(async (req, res) => {
    const instructorId = req.params.instructorId as string;
    const user = req.user!
    const result = await UserServices.getSingleInstructor(instructorId, user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Instructor profile retrieved successfully",
        data: result,
    });
});
const updateInstructor = catchAsync(async (req, res) => {
    const instructorId = req.params.instructorId as string;
    const payload = req.body
    const user = req.user!

    const result = await UserServices.updateInstructor(instructorId, payload, user);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Instructor profile updated successfully",
        data: result,
    });
});

export const UserController = {
    getAllUser,
    getSingleUser,
    updateUserStatus,
    updateUser,
    getAllStudents,
    getSingleStudent,
    updateStudent,
    getAllInstructors,
    getSingleInstructor,
    updateInstructor
}