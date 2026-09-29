import z from "zod";

const passwordSchema = z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(100, { message: "Password cannot exceed 100 characters" })
    .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Atleast one Special Charecter." });

export const RegisterZodSchema = z.object({
    name: z.string({ message: "Name is required" }).min(1, "Name is required"),
    email: z.email("Invalid email address"),
    password: passwordSchema,
    role: z.enum(["ADMIN", "STUDENT", "INSTRUCTOR"], {
        message: "Role must be ADMIN, STUDENT, or INSTRUCTOR",
    }),
});

export const VerifyEmailZodSchema = z.object({
    email: z.email("Invalid email address"),
    otp: z.string({ message: "OTP is required" }).min(1, "OTP is required"),
});

export const LoginZodSchema = z.object({
    email: z.email("Not email!!"),
    password: passwordSchema,
});

export const GoogleLoginZodSchema = z.object({
    idToken: z.string({ message: "idToken is required" }).min(1, "idToken is required"),
});

export const ForgotPasswordZodSchema = z.object({
    email: z.email("Invalid email address"),
});

export const ResetPasswordZodSchema = z.object({
    email: z.email("Invalid email address"),
    otp: z.string({ message: "OTP is required" }).min(1, "OTP is required"),
    newPassword: passwordSchema,
});