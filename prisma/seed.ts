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
      emailEnabled: true, // Enabled for testing
      aiEnabled: true,    // Enabled for testing
      sheetsEnabled: false,
    },
  });
  console.log('✅ Settings initialized:', settings.clinicName);

  // 2. Initialize Super Admin
  const adminEmail = 'admin@gulfclinic.com';
  const rawPassword = 'admin123'; // Simple for your local testing
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hashedPassword }, // Update password if admin exists
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Super Admin initialized:', admin.email);

  // 3. Create Sample Doctors
  const doctor = await prisma.doctor.upsert({
    where: { id: 'test-doctor-1' },
    update: {},
    create: {
      id: 'test-doctor-1',
      name: 'Dr. Sarah Ahmed',
      specialty: 'Dermatology',
      isActive: true,
    }
  });

  // 4. Create Sample Appointments (Mixed AI and Manual)
  console.log('📅 Creating sample appointments...');
  
  const appointmentData = [
    {
      fullName: 'John Doe',
      phone: '+971501234567',
      email: 'john@example.com',
      message: 'Looking for a skin consultation.',
      status: 'NEW' as const,
      isAi: true, // Test AI handled
      doctorId: doctor.id
    },
    {
      fullName: 'Jane Smith',
      phone: '+971507654321',
      status: 'CLOSED' as const,
      isAi: true, // Test conversion rate logic
      doctorId: doctor.id
    },
    {
      fullName: 'Ahmed Ali',
      phone: '+971509998888',
      status: 'CONTACTED' as const,
      isAi: false, // Manual entry
      doctorId: doctor.id
    }
  ];

  for (const data of appointmentData) {
    await prisma.appointmentRequest.create({ data });
  }

  console.log('✅ Database seeded successfully with test data.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });