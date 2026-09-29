import z from "zod";

const resultStatusEnum = z.enum(["DRAFT", "PUBLISHED"], {
    message: "Status must be DRAFT or PUBLISHED",
});

export const CreateResultZodSchema = z.object({
    examId: z
        .string({ message: "Exam ID is required" })
        .uuid("Invalid exam ID"),
    registrationId: z
        .string({ message: "Registration ID is required" })
        .uuid("Invalid registration ID"),
    marks: z
        .number({ message: "Marks must be a number" })
        .min(0, "Marks cannot be negative"),
    grade: z.string().min(1, "Grade cannot be empty").optional(),
    gradePoint: z
        .number()
        .min(0, "Grade point cannot be negative")
        .max(4, "Grade point cannot exceed 4.0")
        .optional(),
    status: resultStatusEnum.optional(),
});

export const BulkCreateResultZodSchema = z.object({
    examId: z
        .string({ message: "Exam ID is required" })
        .uuid("Invalid exam ID"),
    results: z
        .array(
            z.object({
                registrationId: z
                    .string({ message: "Registration ID is required" })
                    .uuid("Invalid registration ID"),
                marks: z
                    .number({ message: "Marks must be a number" })
                    .min(0, "Marks cannot be negative"),
                grade: z.string().min(1, "Grade cannot be empty").optional(),
                gradePoint: z
                    .number()
                    .min(0, "Grade point cannot be negative")
                    .max(4, "Grade point cannot exceed 4.0")
                    .optional(),
            }),
        )
        .min(1, "Results array cannot be empty"),
});

export const UpdateResultZodSchema = z.object({
    marks: z
        .number()
        .min(0, "Marks cannot be negative")
        .optional(),
    grade: z.string().nullable().optional(),
    gradePoint: z
        .number()
        .min(0, "Grade point cannot be negative")
        .max(4, "Grade point cannot exceed 4.0")
        .nullable()
        .optional(),
    status: resultStatusEnum.optional(),
});
