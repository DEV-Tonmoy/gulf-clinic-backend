import { Router, Request, Response, NextFunction } from "express";
import { AppointmentStatus, AdminRole } from "@prisma/client";
import { requireAdmin } from "../middleware/adminAuth";
import { authorizeRoles } from "../utils/authorizeRole";
import { appointmentService } from "../services/appointment.service";

const router = Router();

// GET /stats - This is what useAuth calls
router.get(
  "/stats",
  requireAdmin,
  authorizeRoles([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await appointmentService.getDashboardStats();
      // We return the admin data back so the frontend can save it
      res.json({ 
        ...stats, 
        admin: (req as any).admin 
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /appointments
router.get(
  "/appointments",
  requireAdmin,
  authorizeRoles([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const status = req.query.status as AppointmentStatus | undefined;
      const search = req.query.search as string | undefined;

      const result = await appointmentService.getAllAppointments(page, limit, status, search);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;