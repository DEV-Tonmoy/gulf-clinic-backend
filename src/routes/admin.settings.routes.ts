import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Get current clinic settings (Protected)
router.get('/settings', adminAuth, async (req, res) => {
  try {
    const settings = await prisma.clinicSettings.findUnique({
      where: { id: 'singleton' },
    });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
});

// Update clinic settings (Protected)
router.patch('/settings', adminAuth, async (req, res) => {
  try {
    const { clinicName, emailEnabled, aiEnabled, sheetsEnabled } = req.body;

    const updatedSettings = await prisma.clinicSettings.update({
      where: { id: 'singleton' },
      data: {
        clinicName,
        emailEnabled,
        aiEnabled,
        sheetsEnabled,
      },
    });

    res.json({ 
      success: true, 
      message: "Settings updated successfully", 
      data: updatedSettings 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
});

export default router;