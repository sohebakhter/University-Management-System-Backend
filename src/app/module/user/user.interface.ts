import { InstructorStatus } from "../../../../generated/prisma/enums";

export interface IUpdateUserStatusPayload {
    status: "ACTIVE" | "SUSPENDED"
}

export interface IUpdateUserPayload {
    name?: string;
    // imageUrl?: string
}

export interface IUpdateStudentPayload {
    name?: string;
    departmentId?: string;
}

export interface IUpdateInstructorPayload {
    name?: string;
    departmentId?: string;
    designation?: string
}
export interface IUpdateInstructorStatusPayload {
    instructorStatus: InstructorStatus
}