import { PrismaClient, AppointmentStatus, Prisma } from "@prisma/client";
import { isValidStatusTransition } from "../utils/appointmentStatusRules";

const prisma = new PrismaClient();

// Type for the validated data coming from your Zod schema
export interface CreateAppointmentInput {
  fullName: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  preferredDate?: string | Date | null;
}

export class AppointmentService {
  // 1. Create Appointment (Logic moved from Route to Service)
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

  // 4. Update Notes
  async updateNotes(id: string, adminNotes: string) {
    const appointment = await prisma.appointmentRequest.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw { status: 404, message: "Appointment not found" };
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
      throw { status: 404, message: "Appointment not found" };
    }

    return await prisma.appointmentRequest.delete({
      where: { id },
    });
  }

  // 6. Get Dashboard Stats
  async getDashboardStats() {
    const [totalAppointments, statusCounts, recentLogs] = await Promise.all([
      prisma.appointmentRequest.count(),
      prisma.appointmentRequest.groupBy({
        by: ['status'],
        _count: { _all: true }
      }),
      prisma.adminActivityLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { email: true, role: true }
          }
        }
      })
    ]);

    const stats = {
      NEW: 0,
      CONTACTED: 0,
      CLOSED: 0
    };
    
    statusCounts.forEach(item => {
      stats[item.status as keyof typeof stats] = item._count._all;
    });

    return {
      total: totalAppointments,
      byStatus: stats,
      recentActivity: recentLogs
    };
  }
}

export const appointmentService = new AppointmentService();