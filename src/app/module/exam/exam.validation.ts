import z from "zod";

export const CreateExamZodSchema = z.object({
    title: z
        .string({ message: "Title is required" })
        .min(1, "Title is required"),
    type: z.enum(["QUIZ", "MIDTERM", "FINAL", "ASSIGNMENT"], {
        message: "Type must be one of: QUIZ, MIDTERM, FINAL, ASSIGNMENT",
    }),
    totalMarks: z
        .number({ message: "Total marks must be a number" })
        .positive("Total marks must be greater than 0"),
    examDate: z
        .string({ message: "Exam date is required" })
        .min(1, "Exam date is required"),
    sectionId: z
        .string({ message: "Section ID is required" })
        .uuid("Invalid section ID"),
});

export const UpdateExamZodSchema = z.object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    type: z
        .enum(["QUIZ", "MIDTERM", "FINAL", "ASSIGNMENT"], {
            message: "Type must be one of: QUIZ, MIDTERM, FINAL, ASSIGNMENT",
        })
        .optional(),
    totalMarks: z
        .number()
        .positive("Total marks must be greater than 0")
        .optional(),
    examDate: z.string().min(1, "Exam date cannot be empty").optional(),
});
