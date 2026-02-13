import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default clinic settings if they don't exist
  // This ensures the singleton row is ready for the landing page and admin panel
  const settings = await prisma.clinicSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      clinicName: 'Gulf Clinic',
      clinicLogo: null,
      contactEmail: null,
      whatsappNumber: null,
      emailEnabled: false,
      aiEnabled: false,
      sheetsEnabled: false,
    },
  });

  console.log('✅ Default settings initialized:', settings.clinicName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });