import * as express from 'express';
import { prisma } from '../lib/prisma';

const router = express.Router();

// GET /api/config - Public route for the landing page to adapt its UI
router.get('/config', async (req: express.Request, res: express.Response) => {
  try {
    const settings = await prisma.clinicSettings.findUnique({
      where: { id: 'singleton' },
      select: {
        clinicName: true,
        clinicLogo: true,
        whatsappNumber: true,
        emailEnabled: true, // Used by frontend to show/hide the email form
        aiEnabled: true     // Used by frontend to show/hide AI features
      }
    });

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load clinic configuration" });
  }
});

export default router;