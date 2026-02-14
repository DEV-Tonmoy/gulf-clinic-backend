import * as express from 'express';
import { prisma } from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';
import { authorizeRole } from '../middleware/authorizeRole';
import { AdminRole } from '@prisma/client';

const router = express.Router();

// 1. Get all doctors (Admin view: shows active and inactive)
router.get(
  '/doctors', 
  adminAuth, 
  authorizeRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]), 
  async (req: express.Request, res: express.Response) => {
    try {
      const doctors = await prisma.doctor.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, data: doctors });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch doctors" });
    }
});

// 2. Add a new doctor
router.post(
  '/doctors', 
  adminAuth, 
  authorizeRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]), 
  async (req: express.Request, res: express.Response) => {
    try {
      const { name, specialty, image, bio } = req.body;

      if (!name || !specialty) {
        return res.status(400).json({ success: false, message: "Name and specialty are required" });
      }

      const newDoctor = await prisma.doctor.create({
        data: { name, specialty, image, bio }
      });

      res.json({ success: true, message: "Doctor added successfully", data: newDoctor });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to add doctor" });
    }
});

// 3. Update Doctor (RBAC: Only SUPER_ADMIN can toggle isActive)
router.patch(
  '/doctors/:id',
  adminAuth,
  authorizeRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const { name, specialty, image, bio, isActive } = req.body;
      const admin = (req as any).admin;

      // Only SUPER_ADMIN can change the isActive status
      if (isActive !== undefined && admin.role !== AdminRole.SUPER_ADMIN) {
        return res.status(403).json({ 
          success: false, 
          message: "Access denied. Only SUPER_ADMIN can toggle doctor status." 
        });
      }

      const updatedDoctor = await prisma.doctor.update({
        where: { id },
        data: { name, specialty, image, bio, isActive }
      });

      res.json({ success: true, message: "Doctor updated successfully", data: updatedDoctor });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to update doctor" });
    }
  }
);

// 4. Soft Delete (STRICTLY SUPER_ADMIN ONLY)
router.delete(
  '/doctors/:id', 
  adminAuth, 
  authorizeRole([AdminRole.SUPER_ADMIN]), 
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      
      await prisma.doctor.update({
        where: { id },
        data: { isActive: false }
      });

      res.json({ success: true, message: "Doctor deactivated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to deactivate doctor" });
    }
});

export default router;