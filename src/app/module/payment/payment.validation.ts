import z from "zod";

export const CheckoutZodSchema = z.object({
    semesterId: z
        .string({ message: "Semester ID is required" })
        .uuid("Invalid semester ID"),
});

export const InitiateBkashPaymentZodSchema = z.object({
    paymentId: z
        .string({ message: "Payment ID is required" })
        .uuid("Invalid payment ID"),
});
