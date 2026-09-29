import z from "zod";

export const CreateSectionZodSchema = z.object({
    name: z
        .string({ message: "Name is required" })
        .min(1, "Name is required"),
    capacity: z
        .number({ message: "Capacity must be a number" })
        .int("Capacity must be an integer")
        .positive("Capacity must be greater than 0"),
    courseId: z
        .string({ message: "Course ID is required" })
        .uuid("Invalid course ID"),
    semesterId: z
        .string({ message: "Semester ID is required" })
        .uuid("Invalid semester ID"),
    instructorId: z
        .string({ message: "Instructor ID is required" })
        .uuid("Invalid instructor ID"),
});

export const UpdateSectionZodSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    capacity: z
        .number()
        .int("Capacity must be an integer")
        .positive("Capacity must be greater than 0")
        .optional(),
    courseId: z.string().uuid("Invalid course ID").optional(),
    semesterId: z.string().uuid("Invalid semester ID").optional(),
    instructorId: z.string().uuid("Invalid instructor ID").optional(),
});
