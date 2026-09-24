import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { ICreateCoursePayload, IUpdateCoursePayload } from "./course.interface";
import httpStatus from "http-status"

const createCourse = async (payload: ICreateCoursePayload) => {
    // 1. Check if department exists
    const existingDepartment = await prisma.department.findFirst({
        where: {
            id: payload.departmentId,
            isDeleted: false,
        },
    });

    if (!existingDepartment) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Department not found"
        );
    }

    // 2. Check duplicate course code
    const existingCourse = await prisma.course.findUnique({
        where: {
            code: payload.code,
        },
    });

    if (existingCourse) {
        throw new AppError(
            httpStatus.CONFLICT,
            "Course code already exists"
        );
    }

    // 3. Create course
    const course = await prisma.course.create({
        data: {
            title: payload.title,
            code: payload.code,
            credit: payload.credit,
            departmentId: payload.departmentId,
        },
        include: {
            department: true,
        },
    });

    return course;
};

const getAllCourses = async () => {
    const courses = await prisma.course.findMany({
        where: {
            isDeleted: false,
            department: {
                isDeleted: false,
            },
        },
        include: {
            department: true,
        },
        orderBy: {
            title: "asc",
        },
    });

    return courses;
};

const getCourseById = async (courseId: string) => {
    const course = await prisma.course.findFirst({
        where: {
            id: courseId,
            isDeleted: false,
            department: {
                isDeleted: false,
            },
        },
        include: {
            department: true,
        },
    });

    if (!course) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Course not found"
        );
    }

    return course;
};

const updateCourse = async (courseId: string, payload: IUpdateCoursePayload) => {
    // 1. Check whether course exists and is active
    const existingCourse = await prisma.course.findFirst({
        where: {
            id: courseId,
            isDeleted: false,
        },
    });

    if (!existingCourse) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Course not found"
        );
    }

    // 2. Check duplicate course code
    if (payload.code && payload.code !== existingCourse.code) {
        const duplicateCode = await prisma.course.findUnique({
            where: {
                code: payload.code,
            },
        });

        if (duplicateCode) {
            throw new AppError(
                httpStatus.CONFLICT,
                "Course code already exists"
            );
        }
    }

    // 3. Check department if departmentId is provided
    if (payload.departmentId) {
        const department = await prisma.department.findFirst({
            where: {
                id: payload.departmentId,
                isDeleted: false,
            },
        });

        if (!department) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Department not found or deleted"
            );
        }
    }

    const result = await prisma.course.update({
        where: { id: courseId },
        data: payload,
        include: {
            department: true,
        },
    });

    return result;
};

const deleteCourse = async (courseId: string) => {
    // 1. Check whether course exists and is active
    const existingCourse = await prisma.course.findFirst({
        where: {
            id: courseId,
            isDeleted: false,
        },
    });

    if (!existingCourse) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Course not found or already deleted"
        );
    }

    // 2. Soft delete course
    const result = await prisma.course.update({
        where: {
            id: courseId,
        },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    return result;
};


export const CourseService = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse
}