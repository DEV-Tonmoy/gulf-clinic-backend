import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';
import { authorizeRole } from '../middleware/authorizeRole'; 
import { AdminRole } from '@prisma/client';
import { z } from 'zod';
// If this logger doesn't exist yet, we can comment out the log line
import { logAdminActivity } from '../utils/adminActivityLogger';

const router = Router();

const settingsUpdateSchema = z.object({
  clinicName: z.string().min(2).optional(),
  clinicLogo: z.string().url().nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  whatsappNumber: z.string().min(8).nullable().optional(),
  emailEnabled: z.boolean().optional(),
  aiEnabled: z.boolean().optional(),
  sheetsEnabled: z.boolean().optional(),
});

// GET Settings
router.get('/', adminAuth, async (req, res) => {
  try {
    const settings = await prisma.clinicSettings.findUnique({
      where: { id: 'singleton' },
    });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
});

// PATCH Settings (Restricted to SUPER_ADMIN)
router.patch('/', adminAuth, authorizeRole([AdminRole.SUPER_ADMIN]), async (req, res, next) => {
  try {
    const validatedData = settingsUpdateSchema.parse(req.body);
    const admin = (req as any).admin;

    const updatedSettings = await prisma.clinicSettings.update({
      where: { id: 'singleton' },
      data: validatedData,
    });

    // Optional: Log activity
    await logAdminActivity({
      adminId: admin.id,
      action: `SETTINGS_UPDATED`,
      targetId: 'singleton'
    });

    res.json({ success: true, data: updatedSettings });
  } catch (error) {
    next(error);
  }
});

export default router;