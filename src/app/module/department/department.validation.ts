import z from "zod";

export const CreateDepartmentZodSchema = z.object({
    name: z.string({ message: "Name is required" }).min(1, "Name is required"),
    code: z
        .string({ message: "Code is required" })
        .min(1, "Code is required")
        .toUpperCase(),
});

export const UpdateDepartmentZodSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    code: z.string().min(1, "Code cannot be empty").toUpperCase().optional(),
});
