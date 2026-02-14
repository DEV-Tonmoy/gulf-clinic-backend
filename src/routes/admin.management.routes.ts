import * as express from "express";
import { appointmentService } from "../services/appointment.service";
import { requireAdmin } from "../middleware/adminAuth";
import { AppointmentStatus } from "@prisma/client";

const router = express.Router();

// 1. Get Dashboard Stats
router.get("/stats", requireAdmin, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const stats = await appointmentService.getDashboardStats();
    res.json(stats);
  } catch (error) { next(error); }
});

// 2. List & Search Appointments (Protected)
router.get("/appointments", requireAdmin, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as AppointmentStatus;
    const search = req.query.search as string;

    const result = await appointmentService.getAllAppointments(page, limit, status, search);
    res.json(result);
  } catch (error) { next(error); }
});

// 3. Update Status
router.patch("/appointments/:id/status", requireAdmin, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { status } = req.body;
    const updated = await appointmentService.updateStatus(req.params.id, status);
    res.json(updated);
  } catch (error) { next(error); }
});

// 4. Delete Appointment (Restricted to SUPER_ADMIN)
router.delete("/appointments/:id", requireAdmin, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    // Audit check: Only Super Admin can delete
    if ((req as any).admin?.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Only Super Admins can delete records" });
    }
    await appointmentService.deleteAppointment(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) { next(error); }
});

export default router;