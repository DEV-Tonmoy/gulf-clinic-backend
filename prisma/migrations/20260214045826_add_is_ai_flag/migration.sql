-- AlterTable
ALTER TABLE "AppointmentRequest" ADD COLUMN     "isAi" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ClinicSettings" ADD COLUMN     "clinicLogo" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "whatsappNumber" TEXT;
