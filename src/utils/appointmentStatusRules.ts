import { AppointmentStatus } from "@prisma/client";

const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.NEW]: [AppointmentStatus.CONTACTED, AppointmentStatus.CLOSED],
  [AppointmentStatus.CONTACTED]: [AppointmentStatus.CLOSED],
  [AppointmentStatus.CLOSED]: [],
};

export function isValidStatusTransition(
  current: AppointmentStatus,
  next: AppointmentStatus
): boolean {
  return allowedTransitions[current]?.includes(next) ?? false;
}