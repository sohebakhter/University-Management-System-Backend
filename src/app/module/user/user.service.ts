import { UserRole, UserStatus } from "../../../../generated/prisma/enums";
import { UserWhereInput } from "../../../../generated/prisma/models";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import httpStatus from "http-status"
import { IUpdateInstructorPayload, IUpdateStudentPayload, IUpdateUserPayload, IUpdateUserStatusPayload } from "./user.interface";
import { RequestUser } from "../../middleware/checkAuth";

const getAllUser = async (query: IQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    const andConditions: UserWhereInput[] = [
        {
            isDeleted: false
        },
        {
            status: UserStatus.ACTIVE
        },
    ];

    if (query.searchTerm) {
        andConditions.push({
            OR: [
                {
                    name: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                }
            ]
        })
    }

    if (query.status) {
        andConditions.push({
            status: query.status
        })
    }
    if (query.role) {
        andConditions.push({
            role: query.role
        })
    }
    if (query.authProvider) {
        andConditions.push({
            authProvider: query.authProvider
        })
    }

    const allUsers = await prisma.user.findMany({
        where: {
            AND: andConditions
        },

        take: limit,
        skip: skip,

        orderBy: {
            [sortBy]: sortOrder
        },
        omit: {
            password: true
        }
    })

    return allUsers
}

const getSingleUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
            isDeleted: false,
        },
        omit: {
            password: true,
        },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (!user.emailVerified) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "User is not verified"
        );
    }

    // Fetch profile based on user role
    if (user.role === UserRole.STUDENT) {
        const student = await prisma.student.findUnique({
            where: {
                userId: user.id,
            },
        });

        return {
            ...user,
            student,
        };
    }

    if (user.role === UserRole.INSTRUCTOR) {
        const instructor = await prisma.instructor.findUnique({
            where: {
                userId: user.id,
            },
        });

        return {
            ...user,
            instructor,
        };
    }

    return user;
};

const updateUserStatus = async (
    userId: string,
    payload: IUpdateUserStatusPayload
) => {
    // Check if user exists
    const existingUser = await prisma.user.findFirst({
        where: {
            id: userId,
            isDeleted: false,
        },
    });

    if (!existingUser) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "User not found"
        );
    }

    // Update user status
    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            status: payload.status,
        },
        omit: {
            password: true,
        },
    });

    return updatedUser;
};

const updateUser = async (userId: string, payload: IUpdateUserPayload, user: RequestUser) => {
    // 1. Check if target user exists
    const existingUser = await prisma.user.findFirst({
        where: {
            id: userId,
            isDeleted: false,
        },
    });

    if (!existingUser) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "User not found"
        );
    }

    // 2. Check Admin or Self permission
    if (
        user.role !== UserRole.ADMIN &&
        user.userId !== userId
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to update this user"
        );
    }

    // 3. Update user information
    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: payload,
        omit: {
            password: true,
        },
    });

    return updatedUser;
};

const getAllStudents = async () => {
    const students = await prisma.student.findMany({
        where: {
            user: {
                isDeleted: false,
            },
        },
        include: {
            user: {
                omit: {
                    password: true,
                },
            },
        },
    });

    return students;
};

const getSingleStudent = async (
    studentId: string,
    user: RequestUser,
) => {
    // 1. Check if student exists
    const student = await prisma.student.findUnique({
        where: {
            id: studentId,
        },
        include: {
            user: {
                omit: {
                    password: true,
                },
            },
        },
    });

    if (!student) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Student not found"
        );
    }

    // 2. Admin or Self
    if (
        user.role !== UserRole.ADMIN &&
        user.userId !== student.userId
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to view this student profile"
        );
    }

    return student;
};

const updateStudent = async (
    studentId: string,
    payload: IUpdateStudentPayload,
    user: RequestUser,
) => {
    // 1. Check if student exists
    const existingStudent = await prisma.student.findUnique({
        where: {
            id: studentId,
        },
    });

    if (!existingStudent) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Student not found"
        );
    }

    // 2. Check Admin or Self
    if (
        user.role !== UserRole.ADMIN &&
        user.userId !== existingStudent.userId
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to update this student profile"
        );
    }

    // 3. Update student profile
    const updatedStudent = await prisma.student.update({
        where: {
            id: studentId,
        },
        data: payload,
    });

    return updatedStudent;
};

const getAllInstructors = async () => {
    const instructors = await prisma.instructor.findMany({
        where: {
            user: {
                isDeleted: false,
            },
        },
        include: {
            user: {
                omit: {
                    password: true,
                },
            },
        },
    });

    return instructors;
};

const getSingleInstructor = async (
    instructorId: string,
    user: RequestUser,
) => {
    // 1. Check if instructor exists
    const instructor = await prisma.instructor.findUnique({
        where: {
            id: instructorId,
        },
        include: {
            user: {
                omit: {
                    password: true,
                },
            },
        },
    });

    if (!instructor) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Instructor not found"
        );
    }

    // 2. Check Admin or Self
    if (
        user.role !== UserRole.ADMIN &&
        user.userId !== instructor.userId
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to view this instructor profile"
        );
    }

    return instructor;
};

const updateInstructor = async (
    instructorId: string,
    payload: IUpdateInstructorPayload,
    user: RequestUser,
) => {
    // 1. Check if instructor exists
    const existingInstructor = await prisma.instructor.findUnique({
        where: {
            id: instructorId,
        },
    });

    if (!existingInstructor) {
        throw new AppError(
            httpStatus.NOT_FOUND,
            "Instructor not found"
        );
    }

    // 2. Check Admin or Self
    if (
        user.role !== UserRole.ADMIN &&
        user.userId !== existingInstructor.userId
    ) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not authorized to update this instructor profile"
        );
    }

    // 3. Update instructor profile
    const updatedInstructor = await prisma.instructor.update({
        where: {
            id: instructorId,
        },
        data: payload,
    });

    return updatedInstructor;
};
export const UserServices = {
    getAllUser,
    getSingleUser,
    updateUserStatus,
    updateUser,
    getAllStudents,
    getSingleStudent,
    updateStudent,
    getAllInstructors,
    getSingleInstructor,
    updateInstructor
}