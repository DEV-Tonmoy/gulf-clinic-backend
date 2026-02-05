import { AppointmentStatus } from "@prisma/client";

const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  NEW: [AppointmentStatus.CONTACTED, AppointmentStatus.CLOSED],
  CONTACTED: [AppointmentStatus.CLOSED],
  CLOSED: [],
};

export function isValidStatusTransition(
  current: AppointmentStatus,
  next: AppointmentStatus
): boolean {
  return allowedTransitions[current].includes(next);
}
