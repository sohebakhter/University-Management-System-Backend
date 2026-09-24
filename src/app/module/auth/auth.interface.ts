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

export interface ILoginUserPayload {
    email: string;
    password: string;
}

export interface IRequestUser {
    userId: string;
    email: string;
    name: string;
    role: UserRole;
}
export interface IGoogleLoginPayload {
    idToken: string;
}

export interface IForgotPassworddPayload {
    email: string;
}
export interface IResetPassworddPayload {
    email: string;
    otp: string;
    newPassword: string;
}