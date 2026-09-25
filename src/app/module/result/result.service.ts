import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { RequestUser } from "../../middleware/checkAuth";
import { RegistrationStatus, ResultStatus, UserRole } from "../../../../generated/prisma/enums";
import { IBulkCreateResultPayload, ICreateResultPayload, IUpdateResultPayload } from "./result.interface";
import { ResultWhereInput } from "../../../../generated/prisma/models";

const getInstructor = async (userId: string) => {
    const instructor = await prisma.instructor.findFirst({
        where: {
            userId,
            isDeleted: false,
        },
    });

    if (!instructor) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Instructor profile not found"
        );
    }

    return instructor;
};

const checkExamAccess = async (examId: string, user: RequestUser) => {
    const exam = await prisma.exam.findFirst({
        where: {
            id: examId,
            isDeleted: false,
            section: {
                isDeleted: false,
            },
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
        const instructor = await getInstructor(user.userId);

        if (exam.section.instructorId !== instructor.id) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this section"
            );
        }
    }

    return exam;
};
//----------->
const createResult = async (payload: ICreateResultPayload, user: RequestUser) => {
    const exam = await checkExamAccess(payload.examId, user);

    // Marks validation
    if (payload.marks < 0) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Marks cannot be negative"
        );
    }

    if (payload.marks > Number(exam.totalMarks)) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Marks cannot exceed total marks"
        );
    }

    // Registration must belong to this exam's section
    const registration = await prisma.registration.findFirst({
        where: {
            id: payload.registrationId,
            sectionId: exam.sectionId,
            status: RegistrationStatus.ENROLLED,
        },
    });

    if (!registration) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Student is not enrolled in this section"
        );
    }

    // Duplicate result
    const existingResult = await prisma.result.findUnique({
        where: {
            examId_registrationId: {
                examId: payload.examId,
                registrationId: payload.registrationId,
            },
        },
    });

    if (existingResult) {
        throw new AppError(
            httpStatus.CONFLICT,
            "Result already exists for this student"
        );
    }

    const result = await prisma.result.create({
        data: {
            examId: payload.examId,
            registrationId: payload.registrationId,
            marks: payload.marks,
            grade: payload.grade,
            gradePoint: payload.gradePoint,
            status: payload.status ?? ResultStatus.PUBLISHED,
        },
        include: {
            exam: true,
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
    });

    return result;
};

const bulkCreateResult = async (payload: IBulkCreateResultPayload, user: RequestUser) => {
    const exam = await checkExamAccess(
        payload.examId,
        user
    );

    if (!payload.results?.length) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Results array cannot be empty"
        );
    }

    // Duplicate registration IDs in request
    const registrationIds = payload.results.map((item) => item.registrationId);

    const uniqueRegistrationIds = new Set(registrationIds);

    if (uniqueRegistrationIds.size !== registrationIds.length) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Duplicate registration IDs found"
        );
    }

    // Validate marks
    for (const item of payload.results) {
        if (item.marks < 0) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Marks cannot be negative"
            );
        }

        if (item.marks > Number(exam.totalMarks)) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `Marks cannot exceed ${exam.totalMarks}`
            );
        }
    }

    // Validate all registrations belong to exam section
    const registrations = await prisma.registration.findMany({
        where: {
            id: {
                in: registrationIds,
            },
            sectionId: exam.sectionId,
            status: RegistrationStatus.ENROLLED,
        },
        select: {
            id: true,
        },
    });

    if (registrations.length !== registrationIds.length) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "One or more students are not enrolled in this section"
        );
    }

    // Check existing results
    const existingResults = await prisma.result.findMany({
        where: {
            examId: payload.examId,
            registrationId: {
                in: registrationIds,
            },
        },
        select: {
            registrationId: true,
        },
    });

    if (existingResults.length > 0) {
        throw new AppError(
            httpStatus.CONFLICT,
            "Result already exists for one or more students"
        );
    }

    const data = payload.results.map((item) => ({
        examId: payload.examId,
        registrationId: item.registrationId,
        marks: item.marks,
        grade: item.grade,
        gradePoint: item.gradePoint,
        status: ResultStatus.PUBLISHED,
    }));

    await prisma.result.createMany({ data: data });

    const allResults = await prisma.result.findMany({
        where: {
            examId: payload.examId,
            registrationId: {
                in: registrationIds,
            },
        },
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
            exam: true,
        },
    });

    return allResults
};

const getMyResults = async (user: RequestUser) => {
    const student = await prisma.student.findFirst({
        where: {
            userId: user.userId,
            isDeleted: false,
        },
    });

    if (!student) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Student profile not found"
        );
    }

    const myAllResults = await prisma.result.findMany({
        where: {
            registration: {
                studentId: student.id,
            },
            status: ResultStatus.PUBLISHED,
            exam: {
                isDeleted: false,
                section: {
                    isDeleted: false,
                },
            },
        },
        include: {
            exam: {
                include: {
                    section: {
                        include: {
                            course: true,
                            semester: true,
                        },
                    },
                },
            },
            registration: true,
        },
        orderBy: {
            exam: {
                examDate: "desc",
            },
        },
    });

    return myAllResults
};

const getResultsByRegistration = async (registrationId: string, user: RequestUser) => {
    const registration = await prisma.registration.findUnique({
        where: {
            id: registrationId,
        },
        include: {
            student: {
                include: {
                    user: true,
                },
            },
            section: true,
        },
    });

    if (!registration) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Registration not found"
        );
    }

    // Student owner
    if (user.role === UserRole.STUDENT) {
        if (registration.student.userId !== user.userId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You can only view your own results"
            );
        }
    }

    // Instructor
    if (user.role === UserRole.INSTRUCTOR) {
        const instructor = await getInstructor(user.userId);

        if (registration.section.instructorId !== instructor.id) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this section"
            );
        }
    }

    const where: ResultWhereInput = {
        registrationId,
        exam: {
            isDeleted: false,
        },
    };

    // Student only published results
    if (user.role === UserRole.STUDENT) {
        where.status = ResultStatus.PUBLISHED;
    }

    const results = await prisma.result.findMany({
        where,
        include: {
            exam: {
                include: {
                    section: {
                        include: {
                            course: true,
                            semester: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            exam: {
                examDate: "desc",
            },
        },
    });

    return results
};

const updateResult = async (resultId: string, payload: IUpdateResultPayload, user: RequestUser) => {
    const result = await prisma.result.findUnique({
        where: {
            id: resultId,
        },
        include: {
            exam: {
                include: {
                    section: true,
                },
            },
        },
    });

    if (!result) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Result not found"
        );
    }

    if (result.exam.isDeleted) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Cannot update result of a deleted exam"
        );
    }

    // Instructor authorization
    if (user.role === UserRole.INSTRUCTOR) {
        const instructor = await getInstructor(user.userId);

        if (result.exam.section.instructorId !== instructor.id) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this section"
            );
        }
    }

    if (payload.marks !== undefined && (payload.marks < 0 || payload.marks > Number(result.exam.totalMarks))) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Marks must be between 0 and ${result.exam.totalMarks}`
        );
    }

    const updatedResult = await prisma.result.update({
        where: {
            id: resultId,
        },
        data: payload,
        include: {
            exam: true,
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
    });

    return updatedResult
};

export const ResultService = {
    createResult,
    bulkCreateResult,
    getMyResults,
    getResultsByRegistration,
    updateResult,
};