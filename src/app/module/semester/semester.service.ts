import { SemesterStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { ICreateSemesterPayload, IUpdateSemesterPayload } from "./semester.interface";
import httpStatus from "http-status"

const createSemester = async (payload: ICreateSemesterPayload) => {
    const existingSemester = await prisma.semester.findUnique({
        where: {
            name_year: {
                name: payload.name,
                year: payload.year,
            },
        },
    });

    if (existingSemester) {
        throw new AppError(
            httpStatus.CONFLICT,
            "Semester already exists for this year"
        );
    }

    const result = await prisma.semester.create({
        data: payload,
    });

    return result;
};

const getAllSemesters = async () => {
    const result = await prisma.semester.findMany({
        where: {
            isDeleted: false,
        },
        orderBy: [
            {
                year: "desc",
            },
            {
                createdAt: "desc",
            },
        ],
    });

    return result;
};

const getSemesterById = async (semesterId: string) => {
    const result = await prisma.semester.findFirst({
        where: {
            id: semesterId,
            isDeleted: false,
        },
    });

    if (!result) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Semester not found"
        );
    }

    return result;
};

const updateSemester = async (semesterId: string, payload: IUpdateSemesterPayload) => {
    const existingSemester = await prisma.semester.findFirst({
        where: {
            id: semesterId,
            isDeleted: false,
        },
    });

    if (!existingSemester) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Semester not found"
        );
    }

    const name = payload.name ?? existingSemester.name;
    const year = payload.year ?? existingSemester.year;

    if (
        name !== existingSemester.name ||
        year !== existingSemester.year
    ) {
        const duplicateSemester = await prisma.semester.findUnique({
            where: {
                name_year: {
                    name,
                    year,
                },
            },
        });

        if (
            duplicateSemester &&
            duplicateSemester.id !== semesterId
        ) {
            throw new AppError(
                httpStatus.CONFLICT,
                "Semester already exists for this year"
            );
        }
    }

    const result = await prisma.semester.update({
        where: {
            id: semesterId,
        },
        data: payload
    });

    return result;
};

const updateSemesterStatus = async (semesterId: string, status: SemesterStatus) => {
    const existingSemester = await prisma.semester.findFirst({
        where: {
            id: semesterId,
            isDeleted: false,
        },
    });

    if (!existingSemester) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Semester not found"
        );
    }

    const result = await prisma.semester.update({
        where: {
            id: semesterId,
        },
        data: {
            status,
        },
    });

    return result;
};

const deleteSemester = async (semesterId: string) => {
    const existingSemester = await prisma.semester.findFirst({
        where: {
            id: semesterId,
            isDeleted: false,
        },
    });

    if (!existingSemester) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Semester not found or already deleted"
        );
    }

    const result = await prisma.semester.update({
        where: {
            id: semesterId,
        },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    return result;
};

export const SemesterService = {
    createSemester,
    getAllSemesters,
    getSemesterById,
    updateSemester,
    updateSemesterStatus,
    deleteSemester

}