import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const appointments = await prisma.appointmentRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(appointments);
});


router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      phone,
      email,
      message,
      preferredDate,
    } = req.body;

    const appointment = await prisma.appointmentRequest.create({
      data: {
        fullName,
        phone,
        email,
        message,
        preferredDate: preferredDate
          ? new Date(preferredDate)
          : null,
      },
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

export default router;
