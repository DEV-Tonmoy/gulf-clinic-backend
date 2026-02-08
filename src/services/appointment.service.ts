import { PrismaClient, AppointmentStatus } from "@prisma/client";
import { isValidStatusTransition } from "../utils/appointmentStatusRules";

const prisma = new PrismaClient();

export class AppointmentService {
  // 1. Get all appointments (Logic moved from GET /admin/appointments)
  async getAllAppointments(page: number, limit: number, status?: AppointmentStatus) {
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

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 2. Update Status (Logic moved from PATCH /admin/appointments/:id/status)
  async updateStatus(id: string, nextStatus: AppointmentStatus) {
    const appointment = await prisma.appointmentRequest.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw { status: 404, message: "Appointment not found" };
    }

    if (!isValidStatusTransition(appointment.status, nextStatus)) {
      throw { 
        status: 400, 
        message: `Invalid status transition from ${appointment.status} to ${nextStatus}` 
      };
    }

    return await prisma.appointmentRequest.update({
      where: { id },
      data: { status: nextStatus },
    });
  }

  // 3. Update Notes (Logic moved from PATCH /admin/appointments/:id/notes)
  async updateNotes(id: string, adminNotes: string) {
    return await prisma.appointmentRequest.update({
      where: { id },
      data: { adminNotes },
    });
  }
}

export const appointmentService = new AppointmentService();