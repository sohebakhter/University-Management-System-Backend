import httpStatus from "http-status";
import { RequestUser } from "../../middleware/checkAuth";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { AttendanceStatus, RegistrationStatus, UserRole } from "../../../../generated/prisma/enums";
import { IBulkMarkAttendancePayload, IMarkAttendancePayload } from "./attendance.interface";

const markAttendance = async (
    payload: IMarkAttendancePayload,
    user: RequestUser,
) => {
    // 1. Find instructor
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

    // 2. Find registration
    const registration = await prisma.registration.findUnique({
        where: {
            id: payload.registrationId,
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

    // 3. Check instructor assignment
    if (registration.section.instructorId !== instructor.id) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not assigned to this section"
        );
    }

    // 4. Check registration status
    if (registration.status !== RegistrationStatus.ENROLLED) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Attendance can only be marked for enrolled students"
        );
    }

    // 5. Check duplicate attendance
    const existingAttendance = await prisma.attendance.findUnique({
        where: {
            registrationId_date: {
                registrationId: payload.registrationId,
                date: payload.date,
            },
        },
    });

    if (existingAttendance) {
        throw new AppError(
            httpStatus.CONFLICT,
            "Attendance already marked for this date"
        );
    }

    // 6. Create attendance
    const result = await prisma.attendance.create({
        data: {
            registrationId: payload.registrationId,
            date: payload.date,
            status: payload.status,
            markedById: instructor.id,
        },
    });

    return result;
};

const bulkMarkAttendance = async (payload: IBulkMarkAttendancePayload, user: RequestUser) => {
    // 1. Find instructor
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

    // 2. Check section
    const section = await prisma.section.findFirst({
        where: {
            id: payload.sectionId,
            instructorId: instructor.id,
            isDeleted: false,
        },
    });

    if (!section) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not assigned to this section"
        );
    }

    // 3. Get registrations
    const registrationIds = payload.attendances.map((item) => item.registrationId);

    const registrations = await prisma.registration.findMany({
        where: {
            id: {
                in: registrationIds,
            },
            sectionId: payload.sectionId,
            status: RegistrationStatus.ENROLLED,
        },
    });

    if (registrations.length !== registrationIds.length) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "One or more registrations are invalid or not enrolled in this section"
        );
    }

    // 4. Check duplicate attendance
    const existingAttendances = await prisma.attendance.findMany({
        where: {
            registrationId: {
                in: registrationIds,
            },
            date: payload.date,
        },
    });

    if (existingAttendances.length > 0) {
        throw new AppError(
            httpStatus.CONFLICT,
            "Attendance already exists for one or more students"
        );
    }

    // 5. Bulk create
    const result = await prisma.attendance.createMany({
        data: payload.attendances.map((item) => ({
            registrationId: item.registrationId,
            date: payload.date,
            status: item.status,
            markedById: instructor.id,
        })),
    });

    return result;
};

const getMyAttendance = async (user: RequestUser) => {
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

    const result = await prisma.attendance.findMany({
        where: {
            registration: {
                studentId: student.id,
            },
        },
        include: {
            registration: {
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
            date: "desc",
        },
    });

    return result;
};

const getSectionAttendance = async (sectionId: string, user: RequestUser) => {
    // 1. Check section
    const section = await prisma.section.findFirst({
        where: {
            id: sectionId,
            isDeleted: false,
        },
    });

    if (!section) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Section not found"
        );
    }

    // 2. Instructor assignment check
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

    // 3. Get attendance
    const result = await prisma.attendance.findMany({
        where: {
            registration: {
                sectionId,
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
        },
        orderBy: [
            {
                date: "desc",
            },
            {
                createdAt: "desc",
            },
        ],
    });

    return result;
};

const updateAttendance = async (attendanceId: string, status: AttendanceStatus, user: RequestUser) => {
    const attendance = await prisma.attendance.findUnique({
        where: {
            id: attendanceId,
        },
        include: {
            registration: {
                include: {
                    section: true,
                },
            },
        },
    });

    if (!attendance) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Attendance not found"
        );
    }

    // Instructor assignment check
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

        if (attendance.registration.section.instructorId !== instructor.id) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this section"
            );
        }
    }

    const result = await prisma.attendance.update({
        where: {
            id: attendanceId,
        },
        data: {
            status,
        },
    });

    return result;
};

export const AttendanceService = {
    markAttendance,
    bulkMarkAttendance,
    getMyAttendance,
    getSectionAttendance,
    updateAttendance
}