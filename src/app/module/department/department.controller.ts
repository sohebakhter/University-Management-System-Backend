import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DepartmentService } from "./department.service";
import httpStatus from "http-status"

const createDepartment = catchAsync(async (req, res) => {
    const result = await DepartmentService.createDepartment(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Department created successfully",
        data: result,
    });
});

const getAllDepartments = catchAsync(async (req, res) => {
    const result = await DepartmentService.getAllDepartments();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Departments retrieved successfully",
        data: result,
    });
});

const getSingleDepartment = catchAsync(async (req, res) => {
    const { departmentId } = req.params;

    const result = await DepartmentService.getSingleDepartment(departmentId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Department retrieved successfully",
        data: result,
    });
});

const updateDepartment = catchAsync(async (req, res) => {
    const { departmentId } = req.params;
    const payload = req.body

    const result = await DepartmentService.updateDepartment(departmentId as string, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Department updated successfully",
        data: result,
    });
});

const deleteDepartment = catchAsync(async (req, res) => {
    const { departmentId } = req.params;

    const result = await DepartmentService.deleteDepartment(departmentId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Department deleted successfully",
        data: result,
    });
});

export const DepartmentController = {
    createDepartment,
    getAllDepartments,
    getSingleDepartment,
    updateDepartment,
    deleteDepartment
}