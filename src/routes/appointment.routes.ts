import { Router, Request, Response, NextFunction } from "express";
import { AppointmentStatus, AdminRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAdmin } from "../middleware/adminAuth";
import { authorizeRole } from "../middleware/authorizeRole"; 
import { appointmentService } from "../services/appointment.service";

const router = Router();

/**
 * PUBLIC: Create Appointment Request
 * Path: POST /api/appointments
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // 1. Check if the clinic has enabled email bookings (Keep logic for client control)
    const settings = await prisma.clinicSettings.findUnique({ where: { id: 'singleton' } });
    
    if (!settings || !settings.emailEnabled) {
      return res.status(403).json({ 
        success: false, 
        message: "Online booking is currently disabled. Please contact us via WhatsApp." 
      });
    }

    const { fullName, phone, email, message, doctorId, preferredDate } = req.body;

    if (!fullName || !phone) {
      return res.status(400).json({ success: false, message: "Full name and phone number are required" });
    }

    // 2. Save the request
    const newRequest = await prisma.appointmentRequest.create({
      data: { 
        fullName, 
        phone, 
        email, 
        message, 
        doctorId, 
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        status: 'NEW' 
      }
    });

    res.json({ success: true, message: "Booking request submitted!", data: newRequest });
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ success: false, message: "Submission failed" });
  }
});

/**
 * ADMIN: Dashboard Statistics
 * Path: GET /api/appointments/stats
 * FIX: Removed double-wrapping. appointmentService already returns { success: true, stats: { ... } }
 */
router.get(
  "/stats",
  requireAdmin,
  authorizeRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await appointmentService.getDashboardStats();
      // 'result' already contains the 'success' and 'stats' keys from the service
      res.json(result); 
    } catch (error) {
      next(error);
    }
  }
);

/**
 * ADMIN: Fetch All Appointments
 * Path: GET /api/appointments/list
 */
router.get(
  "/list",
  requireAdmin,
  authorizeRole([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const status = req.query.status as AppointmentStatus | undefined;
      const search = req.query.search as string | undefined;

      const result = await appointmentService.getAllAppointments(page, limit, status, search);
      
      // Corrected to use 'pagination' to match Service return type
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;