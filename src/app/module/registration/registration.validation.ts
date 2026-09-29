import z from "zod";

export const CreateRegistrationZodSchema = z.object({
    sectionId: z
        .string({ message: "Section ID is required" })
        .uuid("Invalid section ID"),
});

export const UpdateRegistrationStatusZodSchema = z.object({
    status: z.enum(["PENDING", "ENROLLED", "DROPPED", "COMPLETED"], {
        message:
            "Status must be one of: PENDING, ENROLLED, DROPPED, COMPLETED",
    }),
});
