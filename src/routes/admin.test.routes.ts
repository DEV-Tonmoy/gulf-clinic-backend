import { Router, Request, Response } from "express";
import {
  PrismaClient,
  AppointmentStatus,
  AdminRole,
} from "@prisma/client";
import { requireAdmin } from "../middleware/adminAuth";
import { authorizeRoles } from "../utils/authorizeRole";
import { logAdminActivity } from "../utils/adminActivityLogger";
import { isValidStatusTransition } from "../utils/appointmentStatusRules";

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /admin/appointments
 * Roles: ADMIN, SUPER_ADMIN
 */
router.get(
  "/appointments",
  requireAdmin,
  authorizeRoles([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const status = req.query.status as AppointmentStatus | undefined;

      const where = status ? { status } : {};

      const [data, total] = await Promise.all([
        prisma.appointmentRequest.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.appointmentRequest.count({ where }),
      ]);

      await logAdminActivity({
        adminId: req.admin!.id,
        action: "VIEW_APPOINTMENTS",
      });

      res.json({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  }
);

/**
 * PATCH /admin/appointments/:id/status
 * Roles: ADMIN, SUPER_ADMIN
 * Enforces status transition rules
 */
router.patch(
  "/appointments/:id/status",
  requireAdmin,
  authorizeRoles([AdminRole.ADMIN, AdminRole.SUPER_ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status: nextStatus } = req.body;

      if (!Object.values(AppointmentStatus).includes(nextStatus)) {
        return res.status(400).json({ message: "Invalid status value" });
      }

      const appointment = await prisma.appointmentRequest.findUnique({
        where: { id },
      });

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const currentStatus = appointment.status;

      if (!isValidStatusTransition(currentStatus, nextStatus)) {
        return res.status(400).json({
          message: `Invalid status transition from ${currentStatus} to ${nextStatus}`,
        });
      }

      const updated = await prisma.appointmentRequest.update({
        where: { id },
        data: { status: nextStatus },
      });

      await logAdminActivity({
        adminId: req.admin!.id,
        action: "UPDATE_APPOINTMENT_STATUS",
        targetId: id,
      });

      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update status" });
    }
  }
);

/**
 * PATCH /admin/appointments/:id/notes
 * Roles: SUPER_ADMIN ONLY
 */
router.patch(
  "/appointments/:id/notes",
  requireAdmin,
  authorizeRoles([AdminRole.SUPER_ADMIN]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { adminNotes } = req.body;

      const updated = await prisma.appointmentRequest.update({
        where: { id },
        data: { adminNotes },
      });

      await logAdminActivity({
        adminId: req.admin!.id,
        action: "UPDATE_APPOINTMENT_NOTES",
        targetId: id,
      });

      res.json(updated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update notes" });
    }
  }
);

export default router;
