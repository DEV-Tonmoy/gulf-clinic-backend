import { Router, Request, Response, NextFunction } from "express";
import { AppointmentStatus, AdminRole } from "@prisma/client";
import { requireAdmin } from "../middleware/adminAuth";
import { authorizeRoles } from "../utils/authorizeRole";
import { logAdminActivity } from "../utils/adminActivityLogger";
import { appointmentService } from "../services/appointment.service"; // Import our new service

const router = Router();

// ... (GET /test stays same)

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

      // Use the service
      const result = await appointmentService.getAllAppointments(page, limit, status);

      await logAdminActivity({
        adminId: req.admin!.id,
        action: "VIEW_APPOINTMENTS",
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /appointments/:id/status
router.patch(
  "/appointments/:id/status",
  requireAdmin,
  authorizeRoles([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status: nextStatus } = req.body;

      if (!Object.values(AppointmentStatus).includes(nextStatus)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      // Use the service
      const updated = await appointmentService.updateStatus(id, nextStatus);

      await logAdminActivity({
        adminId: req.admin!.id,
        action: "UPDATE_APPOINTMENT_STATUS",
        targetId: id,
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /appointments/:id/notes
router.patch(
  "/appointments/:id/notes",
  requireAdmin,
  authorizeRoles([AdminRole.SUPER_ADMIN]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      // Use the service
      const updated = await appointmentService.updateNotes(id, adminNotes);

      await logAdminActivity({
        adminId: req.admin!.id,
        action: "UPDATE_APPOINTMENT_NOTES",
        targetId: id,
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);

export default router;