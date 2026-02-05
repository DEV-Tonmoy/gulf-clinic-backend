import { PrismaClient } from "@prisma/client";

export type AuditAction =
  | "ADMIN_LOGIN"
  | "APPOINTMENT_STATUS_UPDATED"
  | "APPOINTMENT_NOTES_UPDATED";

export async function logAdminActivity(params: {
  prisma: PrismaClient;
  adminId: string;
  action: AuditAction;
  targetId?: string;
}): Promise<void> {
  const { prisma, adminId, action, targetId } = params;

  try {
    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action,
        targetId,
      },
    });
  } catch (error) {
    /**
     * Audit logging must NEVER break production flows.
     * Fail silently but leave room for future monitoring hooks.
     */
    console.error("[AUDIT_LOG_FAILURE]", {
      adminId,
      action,
      targetId,
      error,
    });
  }
}
