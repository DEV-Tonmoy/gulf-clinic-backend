import express, { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';
import { authorizeRole } from '../middleware/authorizeRole'; 
import { AdminRole } from '@prisma/client';
import { z } from 'zod';
import { logAdminActivity } from '../utils/adminActivityLogger';

const router = express.Router();

const settingsUpdateSchema = z.object({
  clinicName: z.string().min(2).optional(),
  clinicLogo: z.string().url().nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  whatsappNumber: z.string().min(8).nullable().optional(),
  emailEnabled: z.boolean().optional(),
  aiEnabled: z.boolean().optional(),
  sheetsEnabled: z.boolean().optional(),
});

router.get('/', adminAuth, async (req: Request, res: Response) => {
  try {
    const settings = await prisma.clinicSettings.findUnique({
      where: { id: 'singleton' },
    });
    
    if (!settings) {
      return res.json({ 
        success: true, 
        data: {
          id: 'singleton',
          clinicName: 'Gulf Clinic',
          emailEnabled: false,
          aiEnabled: false,
          sheetsEnabled: false
        } 
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
});

router.patch('/', adminAuth, authorizeRole([AdminRole.SUPER_ADMIN]), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = settingsUpdateSchema.parse(req.body);
    const admin = (req as any).admin;

    const updatedSettings = await prisma.clinicSettings.upsert({
      where: { id: 'singleton' },
      update: validatedData,
      create: {
        id: 'singleton',
        ...validatedData,
        clinicName: validatedData.clinicName || 'Gulf Clinic'
      },
    });

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