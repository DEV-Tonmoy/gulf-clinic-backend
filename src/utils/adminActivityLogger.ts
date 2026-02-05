import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Logs an admin action for audit purposes
 */
export async function logAdminActivity(params: {
  adminId: string;
  action: string;
  targetId?: string;
}) {
  try {
    await prisma.adminActivityLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        targetId: params.targetId,
      },
    });
  } catch (error) {
    // Logging should NEVER break the main request
    console.error("Failed to log admin activity:", error);
  }
}
