import z from "zod";

export const CreateCourseZodSchema = z.object({
    title: z
        .string({ message: "Title is required" })
        .min(1, "Title is required"),
    code: z
        .string({ message: "Code is required" })
        .min(1, "Code is required")
        .toUpperCase(),
    credit: z
        .number({ message: "Credit must be a number" })
        .int("Credit must be an integer")
        .positive("Credit must be a positive number"),
    departmentId: z
        .string({ message: "Department ID is required" })
        .uuid("Invalid department ID"),
});

export const UpdateCourseZodSchema = z.object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    code: z.string().min(1, "Code cannot be empty").toUpperCase().optional(),
    credit: z
        .number()
        .int("Credit must be an integer")
        .positive("Credit must be a positive number")
        .optional(),
    departmentId: z.string().uuid("Invalid department ID").optional(),
});
