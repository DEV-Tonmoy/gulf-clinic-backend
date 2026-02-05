import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { fullName, phone, email, message } = req.body;

    // Basic required field validation
    if (!fullName || !phone) {
      return res.status(400).json({
        error: "fullName and phone are required",
      });
    }

    const appointment = await prisma.appointmentRequest.create({
      data: {
        fullName,
        phone,
        email: email ?? null,
        message: message ?? null,
      },
    });

    // Public-safe response (no internal fields)
    return res.status(201).json({
      id: appointment.id,
      status: appointment.status,
      createdAt: appointment.createdAt,
    });
  } catch (error) {
    console.error("Failed to create appointment:", error);
    return res.status(500).json({
      error: "Failed to create appointment",
    });
  }
});

export default router;
