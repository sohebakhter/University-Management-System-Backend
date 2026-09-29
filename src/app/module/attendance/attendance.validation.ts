import z from "zod";

const attendanceStatusEnum = z.enum(
    ["PRESENT", "ABSENT", "LATE", "EXCUSED"],
    {
        message: "Status must be one of: PRESENT, ABSENT, LATE, EXCUSED",
    },
);

export const MarkAttendanceZodSchema = z.object({
    registrationId: z
        .string({ message: "Registration ID is required" })
        .uuid("Invalid registration ID"),
    date: z.coerce.date({ message: "Date must be a valid date" }),
    status: attendanceStatusEnum,
});

export const BulkMarkAttendanceZodSchema = z.object({
    sectionId: z
        .string({ message: "Section ID is required" })
        .uuid("Invalid section ID"),
    date: z.coerce.date({ message: "Date must be a valid date" }),
    attendances: z
        .array(
            z.object({
                registrationId: z
                    .string({ message: "Registration ID is required" })
                    .uuid("Invalid registration ID"),
                status: attendanceStatusEnum,
            }),
        )
        .min(1, "Attendances array cannot be empty"),
});

export const UpdateAttendanceZodSchema = z.object({
    status: attendanceStatusEnum,
});
