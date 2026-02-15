import { PrismaClient, AppointmentStatus, Prisma } from "@prisma/client";
import { isValidStatusTransition } from "../utils/appointmentStatusRules";

const prisma = new PrismaClient();

export interface CreateAppointmentInput {
  fullName: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  preferredDate?: string | Date | null;
}

export class AppointmentService {
  // 1. Create Appointment
  async createAppointment(data: CreateAppointmentInput) {
    return await prisma.appointmentRequest.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        message: data.message,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        status: AppointmentStatus.NEW,
      },
    });
  }

  // 2. Get all appointments (with Search)
  async getAllAppointments(
    page: number, 
    limit: number, 
    status?: AppointmentStatus,
    search?: string
  ) {
    const where: Prisma.AppointmentRequestWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

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

  // 3. Update Status
  async updateStatus(id: string, nextStatus: AppointmentStatus) {
    const appointment = await prisma.appointmentRequest.findUnique({
      where: { id },
    });

    if (!appointment) {
      const error: any = new Error("Appointment not found");
      error.status = 404;
      throw error;
    }

    if (!isValidStatusTransition(appointment.status, nextStatus)) {
      const error: any = new Error(`Invalid status transition from ${appointment.status} to ${nextStatus}`);
      error.status = 400;
      throw error;
    }

    return await prisma.appointmentRequest.update({
      where: { id },
      data: { status: nextStatus },
    });
  }

  // 4. Update Notes
  async updateNotes(id: string, adminNotes: string) {
    const appointment = await prisma.appointmentRequest.findUnique({
      where: { id },
    });

    if (!appointment) {
      const error: any = new Error("Appointment not found");
      error.status = 404;
      throw error;
    }

    return await prisma.appointmentRequest.update({
      where: { id },
      data: { adminNotes },
    });
  }

  // 5. Delete Appointment
  async deleteAppointment(id: string) {
    const appointment = await prisma.appointmentRequest.findUnique({
      where: { id },
    });

    if (!appointment) {
      const error: any = new Error("Appointment not found");
      error.status = 404;
      throw error;
    }

    return await prisma.appointmentRequest.delete({
      where: { id },
    });
  }

  // 6. Get Dashboard Stats (SYNCED WITH FRONTEND)
  async getDashboardStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [total, newToday, aiHandled, closedCount] = await Promise.all([
      prisma.appointmentRequest.count(),
      prisma.appointmentRequest.count({ 
        where: { createdAt: { gte: startOfToday } } 
      }),
      prisma.appointmentRequest.count({ 
        where: { isAi: true } 
      }),
      prisma.appointmentRequest.count({ 
        where: { status: 'CLOSED' } 
      })
    ]);

    // Calculate conversion rate (Closed / Total)
    const conversionRate = total > 0 
      ? Math.round((closedCount / total) * 100) 
      : 0;

    return {
      success: true,
      stats: {
        total,
        newToday,
        aiHandled,
        conversionRate: `${conversionRate}%`
      }
    };
  }
}

export const appointmentService = new AppointmentService();