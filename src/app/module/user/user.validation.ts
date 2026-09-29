import z from "zod";

export const UpdateUserStatusZodSchema = z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"], {
        message: "Status must be ACTIVE or SUSPENDED",
    }),
});

export const UpdateUserZodSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    image: z.string().url("Image must be a valid URL").optional(),
});

export const UpdateStudentZodSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    departmentId: z.string().uuid("Invalid department ID").optional(),
});

export const UpdateInstructorZodSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    departmentId: z.string().uuid("Invalid department ID").optional(),
    designation: z.string().min(1, "Designation cannot be empty").optional(),
});
