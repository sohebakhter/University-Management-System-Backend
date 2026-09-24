import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { ICreateDepartmentPayload, IUpdateDepartmentPayload } from "./department.interface";
import httpStatus from "http-status"

const createDepartment = async (payload: ICreateDepartmentPayload) => {
    // Check if department code already exists
    const existingDepartment = await prisma.department.findUnique({
        where: {
            code: payload.code,
        },
    });

    if (existingDepartment) {
        throw new AppError(
            httpStatus.CONFLICT,
            "Department code already exists"
        );
    }

    const department = await prisma.department.create({
        data: {
            name: payload.name,
            code: payload.code,
        },
    });

    return department;
};

const getAllDepartments = async () => {
    const departments = await prisma.department.findMany({
        where: {
            isDeleted: false,
        },
        orderBy: {
            name: "asc",
        },
    });

    return departments;
};

const getSingleDepartment = async (departmentId: string) => {
    const department = await prisma.department.findFirst({
        where: {
            id: departmentId,
            isDeleted: false,
        },
    });

    if (!department) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Department not found"
        );
    }

    return department;
};

const updateDepartment = async (departmentId: string, payload: IUpdateDepartmentPayload) => {
    // 1. Check if department exists
    const existingDepartment = await prisma.department.findFirst({
        where: {
            id: departmentId,
            isDeleted: false,
        },
    });

    if (!existingDepartment) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Department not found"
        );
    }

    // 2. Check duplicate code (if code is being updated)
    if (payload.code && payload.code !== existingDepartment.code) {
        const isCodeExists = await prisma.department.findUnique({
            where: {
                code: payload.code,
            },
        });

        if (isCodeExists) {
            throw new AppError(
                httpStatus.CONFLICT,
                "Department code already exists"
            );
        }
    }

    // 3. Update department
    const updatedDepartment = await prisma.department.update({
        where: {
            id: departmentId,
        },
        data: payload,
    });

    return updatedDepartment;
};

const deleteDepartment = async (departmentId: string) => {
    // 1. Check if department exists
    const existingDepartment = await prisma.department.findFirst({
        where: {
            id: departmentId,
            isDeleted: false,
        },
    });

    if (!existingDepartment) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Department not found"
        );
    }

    // 2. Soft delete
    const deletedDepartment = await prisma.department.update({
        where: {
            id: departmentId,
        },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    return deletedDepartment;
};

export const DepartmentService = {
    createDepartment,
    getAllDepartments,
    getSingleDepartment,
    updateDepartment,
    deleteDepartment
}