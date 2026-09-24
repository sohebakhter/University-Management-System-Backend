import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CourseService } from "./course.service";
import httpStatus from "http-status"

const createCourse = catchAsync(async (req, res) => {
    const result = await CourseService.createCourse(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Course created successfully",
        data: result,
    });
});

const getAllCourses = catchAsync(async (req, res) => {
    const result = await CourseService.getAllCourses();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Courses retrieved successfully",
        data: result,
    });
});

const getCourseById = catchAsync(async (req, res) => {
    const { courseId } = req.params;

    const result = await CourseService.getCourseById(courseId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Course retrieved successfully",
        data: result,
    });
});

const updateCourse = catchAsync(async (req, res) => {
    const { courseId } = req.params;
    const payload = req.body
    const result = await CourseService.updateCourse(courseId as string, payload);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Course updated successfully",
        data: result,
    });
});

const deleteCourse = catchAsync(async (req, res) => {
    const { courseId } = req.params;

    const result = await CourseService.deleteCourse(courseId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Course deleted successfully",
        data: result,
    });
});

export const CourseController = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse
}