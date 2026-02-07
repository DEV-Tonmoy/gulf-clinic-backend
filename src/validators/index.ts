import { z } from "zod";

export const appointmentRequestSchema = z.object({
  fullName: z.string().min(2, "Name is too short").max(100),
  phone: z.string().min(8, "Invalid phone number").max(20),
  email: z.string().email("Invalid email address").optional().nullable(),
  preferredDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" })
    .optional()
    .nullable(),
  message: z.string().max(1000).optional().nullable(),
});

export default { appointmentRequestSchema };