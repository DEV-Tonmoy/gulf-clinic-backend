import { Router, Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { appointmentRequestSchema } from "../validators";
import { publicIntakeRateLimit } from "../middleware/publicRateLimit";

const router = Router();
const prisma = new PrismaClient();

router.post("/request", publicIntakeRateLimit, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // This will throw a ZodError automatically if validation fails
    const validatedData = appointmentRequestSchema.parse(req.body);

    const { fullName, phone, email, preferredDate, message } = validatedData;

    const newRequest = await prisma.appointmentRequest.create({
      data: {
        fullName,
        phone,
        email,
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        message,
        status: "NEW", 
      },
    });

    return res.status(201).json({
      message: "Appointment request submitted successfully.",
      referenceId: newRequest.id,
      status: newRequest.status
    });

  } catch (error) {
    // Sends the error to our new Global Error Handler
    next(error);
  }
});

export default router;