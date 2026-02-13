import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';
import { authorizeRole } from '../middleware/authorizeRole'; // Use your existing RBAC middleware
import { AdminRole } from '@prisma/client';
import { z } from 'zod';
import { logAdminActivity } from '../utils/adminActivityLogger';

const router = Router();

// Validation schema to maintain high data quality in your SaaS template
const settingsUpdateSchema = z.object({
  clinicName: z.string().min(2, "Name must be at least 2 characters").optional(),
  clinicLogo: z.string().url("Logo must be a valid URL").nullable().optional(),
  contactEmail: z.string().email("Invalid email format").nullable().optional(),
  whatsappNumber: z.string().min(8, "Phone number is too short").nullable().optional(),
  emailEnabled: z.boolean().optional(),
  aiEnabled: z.boolean().optional(),
  sheetsEnabled: z.boolean().optional(),
});

/**
 * GET /settings
 * ACCESS: ADMIN, SUPER_ADMIN
 * Everyone on the staff can see the current configuration.
 */
router.get(
  '/settings', 
  adminAuth, 
  async (req, res) => {
    try {
      const settings = await prisma.clinicSettings.findUnique({
        where: { id: 'singleton' },
      });
      res.json({ success: true, data: settings });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch settings" });
    }
});

/**
 * PATCH /settings
 * ACCESS: SUPER_ADMIN ONLY
 * Only the owner/manager can change the clinic identity or toggle SaaS features.
 */
router.patch(
  '/settings', 
  adminAuth, 
  authorizeRole([AdminRole.SUPER_ADMIN]), // RESTRICTED: Only Super Admins can edit
  async (req, res, next) => {
    try {
      // 1. Validate the incoming data
      const validatedData = settingsUpdateSchema.parse(req.body);
      
      // 2. Access the admin info attached by adminAuth middleware
      const admin = (req as any).admin;

      // 3. Update the database
      const updatedSettings = await prisma.clinicSettings.update({
        where: { id: 'singleton' },
        data: validatedData,
      });

      // 4. Log the action for the audit trail
      await logAdminActivity({
        adminId: admin.id,
        action: `SETTINGS_MODIFIED: ${Object.keys(validatedData).join(', ')}`,
        targetId: 'singleton'
      });

      res.json({ 
        success: true, 
        message: "Clinic configuration updated and audit log recorded", 
        data: updatedSettings 
      });
    } catch (error) {
      // ZodErrors are caught here and handled by middleware/errorHandler.ts
      next(error);
    }
});

export default router;