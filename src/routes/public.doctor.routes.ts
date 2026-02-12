import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/doctors - Public list of active doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { 
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        specialty: true,
        image: true,
        bio: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch doctors" });
  }
});

export default router;