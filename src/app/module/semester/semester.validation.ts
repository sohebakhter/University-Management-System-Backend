import z from "zod";

export const CreateSemesterZodSchema = z.object({
    name: z
        .string({ message: "Name is required" })
        .min(1, "Name is required"),
    year: z
        .number({ message: "Year must be a number" })
        .int("Year must be an integer")
        .min(2000, "Year must be 2000 or later")
        .max(2100, "Year must be 2100 or earlier"),
    registrationStart: z.coerce
        .date({ message: "Registration start must be a valid date" })
        .optional(),
    registrationEnd: z.coerce
        .date({ message: "Registration end must be a valid date" })
        .optional(),
    feeAmount: z
        .number({ message: "Fee amount must be a number" })
        .positive("Fee amount must be greater than 0"),
});

export const UpdateSemesterZodSchema = z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    year: z
        .number()
        .int("Year must be an integer")
        .min(2000, "Year must be 2000 or later")
        .max(2100, "Year must be 2100 or earlier")
        .optional(),
    registrationStart: z.coerce
        .date({ message: "Registration start must be a valid date" })
        .optional(),
    registrationEnd: z.coerce
        .date({ message: "Registration end must be a valid date" })
        .optional(),
    feeAmount: z
        .number()
        .positive("Fee amount must be greater than 0")
        .optional(),
});

export const UpdateSemesterStatusZodSchema = z.object({
    status: z.enum(
        ["UPCOMING", "REGISTRATION_OPEN", "ONGOING", "COMPLETED"],
        {
            message:
                "Status must be one of: UPCOMING, REGISTRATION_OPEN, ONGOING, COMPLETED",
        },
    ),
});
