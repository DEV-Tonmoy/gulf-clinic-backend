import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { appointmentRequestSchema } from "../validators"; // Updated to point to your single file
import { publicIntakeRateLimit } from "../middleware/publicRateLimit";

const router = Router();
const prisma = new PrismaClient();

router.post("/request", publicIntakeRateLimit, async (req: Request, res: Response) => {
  try {
    const validation = appointmentRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validation.error.format() 
      });
    }

    const { fullName, phone, email, preferredDate, message } = validation.data;

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
    console.error("Public Appointment Intake Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;