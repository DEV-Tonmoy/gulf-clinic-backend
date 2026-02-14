import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Initialize Clinic Settings
  const settings = await prisma.clinicSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      clinicName: 'Gulf Clinic',
      clinicLogo: null,
      contactEmail: 'admin@gulfclinic.com',
      whatsappNumber: '971000000000',
      emailEnabled: false,
      aiEnabled: false,
      sheetsEnabled: false,
    },
  });
  console.log('✅ Settings initialized:', settings.clinicName);

  // 2. Initialize Super Admin (So you can actually log in!)
  const adminEmail = 'admin@gulfclinic.com';
  const rawPassword = 'your_secure_password_here'; // Change this!
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Super Admin initialized:', admin.email);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });