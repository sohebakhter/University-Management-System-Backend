export interface IUpdateUserStatusPayload {
    status: "ACTIVE" | "SUSPENDED"
}

export interface IUpdateUserPayload {
    name?: string;
    image?: string
}

export interface IUpdateStudentPayload {
    name?: string;
    departmentId?: string;
}

export interface IUpdateInstructorPayload {
    name?: string;
    departmentId?: string;
}