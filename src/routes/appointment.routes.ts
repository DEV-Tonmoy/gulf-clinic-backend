import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { fullName, phone, email, message } = req.body;

    const appointment = await prisma.appointmentRequest.create({
      data: {
        fullName,
        phone,
        email,
        message,
      },
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

export default router;
