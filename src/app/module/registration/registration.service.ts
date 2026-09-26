import httpStatus from "http-status";
import { RequestUser } from "../../middleware/checkAuth";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { RegistrationStatus, SemesterStatus, UserRole } from "../../../../generated/prisma/enums";
import { RegistrationWhereInput } from "../../../../generated/prisma/models";

const createRegistration = async (sectionId: string, user: RequestUser) => {
    // 1. Find student profile
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

    // 2. Check section
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
        include: {
            semester: true,
        },
    });

    if (!section) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Section not found"
        );
    }

    // 3. Check semester registration status
    if (section.semester.status !== SemesterStatus.REGISTRATION_OPEN) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Course registration is not open"
        );
    }

    // 4. Check registration period
    const now = new Date();

    if (section.semester.registrationStart && now < section.semester.registrationStart) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Registration has not started yet"
        );
    }

    if (section.semester.registrationEnd && now > section.semester.registrationEnd) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Registration period has ended"
        );
    }

    // 5. Check existing registration
    const existingRegistration = await prisma.registration.findUnique({
        where: {
            studentId_sectionId: {
                studentId: student.id,
                sectionId,
            },
        },
    });

    if (existingRegistration) {
        throw new AppError(
            httpStatus.CONFLICT,
            "You are already registered for this section"
        );
    }

    // 6. Check enrolled capacity
    const enrolledCount = await prisma.registration.count({
        where: {
            sectionId,
            status: RegistrationStatus.ENROLLED,
        },
    });

    if (enrolledCount >= section.capacity) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Section capacity is full"
        );
    }

    // 7. Create registration
    const result = await prisma.registration.create({
        data: {
            studentId: student.id,
            sectionId,
            status: RegistrationStatus.PENDING,
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

    return result;
};


const getMyRegistrations = async (user: RequestUser) => {
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

    const result = await prisma.registration.findMany({
        where: {
            studentId: student.id,
        },
        include: {
            section: {
                include: {
                    course: true,
                    semester: true,
                    instructor: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return result;
};

const getAllRegistrations = async (user: RequestUser) => {
    const whereCondition: RegistrationWhereInput = {};

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

        whereCondition.section = {
            instructorId: instructor.id,
            isDeleted: false,
        };
    }

    const result = await prisma.registration.findMany({
        where: whereCondition,
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
            section: {
                include: {
                    course: true,
                    semester: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return result;
};

const getRegistrationById = async (
    registrationId: string,
    user: RequestUser
) => {
    const registration = await prisma.registration.findUnique({
        where: {
            id: registrationId,
        },
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
            section: {
                include: {
                    course: true,
                    semester: true,
                    instructor: true,
                },
            },
        },
    });

    if (!registration) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Registration not found"
        );
    }

    // Admin can access everything
    if (user.role === UserRole.ADMIN) {
        return registration;
    }

    // Student owner check
    if (user.role === UserRole.STUDENT) {
        if (registration.student.userId !== user.userId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not allowed to view this registration"
            );
        }

        return registration;
    }

    // Instructor assigned-section check
    if (user.role === UserRole.INSTRUCTOR) {
        if (registration.section.instructor.userId !== user.userId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this section"
            );
        }

        return registration;
    }

    throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to view this registration"
    );
};

const dropRegistration = async (registrationId: string, user: RequestUser) => {
    const registration = await prisma.registration.findUnique({
        where: {
            id: registrationId,
        },
    });

    if (!registration) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Registration not found"
        );
    }

    // Student can only drop own registration
    if (user.role === UserRole.STUDENT) {
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

        if (registration.studentId !== student.id) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You can only drop your own registration"
            );
        }
    }

    // Cannot drop already dropped/completed registration
    if (registration.status === RegistrationStatus.DROPPED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Registration is already dropped"
        );
    }

    if (registration.status === RegistrationStatus.COMPLETED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Completed registration cannot be dropped"
        );
    }

    const result = await prisma.registration.update({
        where: {
            id: registrationId,
        },
        data: {
            status: RegistrationStatus.DROPPED,
            droppedAt: new Date(),
        },
    });

    return result;
};

const updateRegistrationStatus = async (registrationId: string, status: RegistrationStatus) => {
    const registration = await prisma.registration.findUnique({
        where: {
            id: registrationId,
        },
        include: {
            section: true,
        },
    });

    if (!registration) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Registration not found"
        );
    }

    // If enrolling, check capacity
    if (status === RegistrationStatus.ENROLLED && registration.status !== RegistrationStatus.ENROLLED) {
        const enrolledCount = await prisma.registration.count({
            where: {
                sectionId: registration.sectionId,
                status: RegistrationStatus.ENROLLED,
            },
        });

        if (enrolledCount >= registration.section.capacity) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                "Section capacity is full"
            );
        }
    }

    const result = await prisma.registration.update({
        where: {
            id: registrationId,
        },
        data: {
            status,
            ...(status === RegistrationStatus.DROPPED
                ? {
                    droppedAt: new Date(),
                }
                : {
                    droppedAt: null,
                }),
        },
    });

    return result;
};
export const RegistrationService = {
    createRegistration,
    getMyRegistrations,
    getAllRegistrations,
    getRegistrationById,
    dropRegistration,
    updateRegistrationStatus
}