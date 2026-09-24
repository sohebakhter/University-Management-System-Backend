import { UserRole } from "../../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/appError";
import { ICreateSectionPayload, IUpdateSectionPayload } from "./section.interface";
import httpStatus from "http-status"

const createSection = async (payload: ICreateSectionPayload) => {
    // 1. Check course
    const course = await prisma.course.findFirst({
        where: {
            id: payload.courseId,
            isDeleted: false,
        },
    });

    if (!course) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Course not found or deleted"
        );
    }

    // 2. Check semester
    const semester = await prisma.semester.findFirst({
        where: {
            id: payload.semesterId,
            isDeleted: false,
        },
    });

    if (!semester) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Semester not found or deleted"
        );
    }

    // 3. Check instructor
    const instructor = await prisma.instructor.findFirst({
        where: {
            id: payload.instructorId,
            isDeleted: false,
        },
    });

    if (!instructor) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Instructor not found or deleted"
        );
    }

    // 4. Check duplicate section
    const existingSection = await prisma.section.findFirst({
        where: {
            courseId: payload.courseId,
            semesterId: payload.semesterId,
            name: payload.name,
            isDeleted: false,
        },
    });

    if (existingSection) {
        throw new AppError(
            httpStatus.CONFLICT,
            "Section already exists for this course and semester"
        );
    }

    // 5. Create section
    const result = await prisma.section.create({
        data: {
            name: payload.name,
            capacity: payload.capacity,
            courseId: payload.courseId,
            semesterId: payload.semesterId,
            instructorId: payload.instructorId,
        },
        include: {
            course: true,
            semester: true,
            instructor: true,
        },
    });

    return result;
};

const getAllSections = async () => {
    const result = await prisma.section.findMany({
        where: {
            isDeleted: false,
            course: {
                isDeleted: false,
            },
            semester: {
                isDeleted: false,
            },
            instructor: {
                isDeleted: false,
            },
        },
        include: {
            course: true,
            semester: true,
            instructor: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return result;
};

const getSectionById = async (sectionId: string) => {
    const result = await prisma.section.findFirst({
        where: {
            id: sectionId,
            isDeleted: false,
            course: {
                isDeleted: false,
            },
            semester: {
                isDeleted: false,
            },
            instructor: {
                isDeleted: false,
            },
        },
        include: {
            course: true,
            semester: true,
            instructor: true,
        },
    });

    if (!result) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Section not found"
        );
    }

    return result;
};

const updateSection = async (sectionId: string, payload: IUpdateSectionPayload) => {
    const existingSection = await prisma.section.findFirst({
        where: {
            id: sectionId,
            isDeleted: false,
        },
    });

    if (!existingSection) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Section not found"
        );
    }

    const courseId = payload.courseId ?? existingSection.courseId;
    const semesterId =
        payload.semesterId ?? existingSection.semesterId;
    const instructorId =
        payload.instructorId ?? existingSection.instructorId;
    const name = payload.name ?? existingSection.name;

    // Check course
    if (payload.courseId) {
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                isDeleted: false,
            },
        });

        if (!course) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Course not found or deleted"
            );
        }
    }

    // Check semester
    if (payload.semesterId) {
        const semester = await prisma.semester.findFirst({
            where: {
                id: semesterId,
                isDeleted: false,
            },
        });

        if (!semester) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Semester not found or deleted"
            );
        }
    }

    // Check instructor
    if (payload.instructorId) {
        const instructor = await prisma.instructor.findFirst({
            where: {
                id: instructorId,
                isDeleted: false,
            },
        });

        if (!instructor) {
            throw new AppError(
                httpStatus.NOT_FOUND,
                "Instructor not found or deleted"
            );
        }
    }

    // Check duplicate section
    if (
        name !== existingSection.name ||
        courseId !== existingSection.courseId ||
        semesterId !== existingSection.semesterId
    ) {
        const duplicateSection = await prisma.section.findFirst({
            where: {
                name,
                courseId,
                semesterId,
                isDeleted: false,
                NOT: {
                    id: sectionId,
                },
            },
        });

        if (duplicateSection) {
            throw new AppError(
                httpStatus.CONFLICT,
                "Section already exists for this course and semester"
            );
        }
    }

    const result = await prisma.section.update({
        where: {
            id: sectionId,
        },
        data: payload,
        include: {
            course: true,
            semester: true,
            instructor: true,
        },
    });

    return result;
};

const deleteSection = async (sectionId: string) => {
    const existingSection = await prisma.section.findFirst({
        where: {
            id: sectionId,
            isDeleted: false,
        },
    });

    if (!existingSection) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Section not found or already deleted"
        );
    }

    const result = await prisma.section.update({
        where: {
            id: sectionId,
        },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });

    return result;
};

const getSectionStudents = async (sectionId: string, user: RequestUser) => {
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

    // Admin can access any section
    // Instructor can access only assigned section
    if (user.role === UserRole.INSTRUCTOR) {
        if (user.userId !== section.instructorId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not assigned to this section"
            );
        }
    }

    const registrations = await prisma.registration.findMany({
        where: {
            sectionId: sectionId,
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
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return registrations;
};
export const SectionService = {
    createSection,
    getAllSections,
    getSectionById,
    updateSection,
    deleteSection,
    getSectionStudents
}