import httpStatus from "http-status";
import { RequestUser } from "../../middleware/checkAuth";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { ICreateExamPayload, IUpdateExamPayload } from "./exam.interface";
import { UserRole } from "../../../../generated/prisma/enums";
import { ExamWhereInput } from "../../../../generated/prisma/models";

const createExam = async (payload: ICreateExamPayload, user: RequestUser) => {
    const { sectionId } = payload;

    const section = await prisma.section.findFirst({
        where: {
            id: sectionId,
            isDeleted: false,
            course: {
                isDeleted: false,
            },
            semester: {
                isDeleted: false,
            },
        },
    });

    if (!section) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Section not found"
        );
    }

    // Instructor হলে assigned section হতে হবে
    if (user.role === UserRole.INSTRUCTOR) {
        const instructor = await prisma.instructor.findFirst({
            where: {
                userId: user.userId,
                isDeleted: false,
            },
        });

        if (!instructor) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Instructor profile not found"
            );
        }

        if (section.instructorId !== instructor.id) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this section"
            );
        }
    }

    if (payload.totalMarks <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Total marks must be greater than 0");
    }

    const exam = await prisma.exam.create({
        data: {
            title: payload.title,
            type: payload.type,
            totalMarks: payload.totalMarks,
            examDate: new Date(payload.examDate),
            sectionId: payload.sectionId,
        },
        include: {
            section: {
                include: {
                    course: true,
                    semester: true,
                },
            },
        },
    });

    return exam;
};

const getExams = async (user: RequestUser) => {
    //guranteed where input --->  
    const where: ExamWhereInput = {
        isDeleted: false,
        section: {
            isDeleted: false,
            course: {
                isDeleted: false,
            },
            semester: {
                isDeleted: false,
            },
        },
    };

    if (user.role === UserRole.INSTRUCTOR) {
        const instructor = await prisma.instructor.findFirst({
            where: {
                userId: user.userId,
                isDeleted: false,
            },
        });

        if (!instructor) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Instructor profile not found"
            );
        }

        where.section = {
            isDeleted: false,
            instructorId: instructor.id,
        };
    }

    const exams = await prisma.exam.findMany({
        where,
        include: {
            section: {
                include: {
                    course: true,
                    semester: true,
                    instructor: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            examDate: "desc",
        },
    });

    return exams
};

const getExamById = async (examId: string, user: RequestUser) => {
    const exam = await prisma.exam.findFirst({
        where: {
            id: examId,
            isDeleted: false,
            section: {
                isDeleted: false,
            },
        },
        include: {
            section: {
                include: {
                    course: true,
                    semester: true,
                    instructor: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
            results: {
                include: {
                    registration: {
                        include: {
                            student: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            name: true,
                                            email: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!exam) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Exam not found"
        );
    }

    if (user.role === UserRole.INSTRUCTOR) {
        const instructor = await prisma.instructor.findFirst({
            where: {
                userId: user.userId,
                isDeleted: false,
            },
        });

        if (!instructor || exam.section.instructorId !== instructor.id) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this section"
            );
        }
    }

    return exam;
};

const updateExam = async (examId: string, payload: IUpdateExamPayload, user: RequestUser) => {
    const exam = await prisma.exam.findFirst({
        where: {
            id: examId,
            isDeleted: false,
        },
        include: {
            section: true,
        },
    });

    if (!exam) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Exam not found"
        );
    }

    if (user.role === UserRole.INSTRUCTOR) {
        const instructor = await prisma.instructor.findFirst({
            where: {
                userId: user.userId,
                isDeleted: false,
            },
        });

        if (!instructor || exam.section.instructorId !== instructor.id) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this section"
            );
        }
    }

    if (payload.totalMarks !== undefined && payload.totalMarks <= 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Total marks must be greater than 0"
        );
    }

    const updatedExam = await prisma.exam.update({
        where: {
            id: examId,
        },
        data: {
            ...(payload.title !== undefined && {
                title: payload.title,
            }),
            ...(payload.type !== undefined && {
                type: payload.type,
            }),
            ...(payload.totalMarks !== undefined && {
                totalMarks: payload.totalMarks,
            }),
            ...(payload.examDate !== undefined && {
                examDate: new Date(payload.examDate),
            }),
        },
        include: {
            section: {
                include: {
                    course: true,
                    semester: true,
                },
            },
        },
    });

    return updatedExam;
};

const deleteExam = async (examId: string) => {
    const exam = await prisma.exam.findFirst({
        where: {
            id: examId,
            isDeleted: false,
        },
    });

    if (!exam) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Exam not found"
        );
    }

    return prisma.exam.update({
        where: {
            id: examId,
        },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });
};

export const ExamService = {
    createExam,
    getExams,
    getExamById,
    updateExam,
    deleteExam,
};