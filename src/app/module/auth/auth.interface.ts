import type { UserRole } from "../../../../generated/prisma/browser";

export interface IRegisterUserPayload {
    name: string;
    email: string;
    password: string;
    role: UserRole
}
export interface IVerifyEmailPayload {
    email: string;
    otp: string;
}

