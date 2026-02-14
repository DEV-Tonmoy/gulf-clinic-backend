import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const admins = [
    {
      email: "nover0239@gmail.com",
      password: "supergulfadmin1",
      role: "SUPER_ADMIN"
    },
    {
      email: "linkedintonmoy@gmail.com",
      password: "reggulfadmin1",
      role: "ADMIN"
    }
  ];

  console.log("⏳ Starting admin seeding...");

  for (const adminData of admins) {
    // We use salt rounds 10 to match your auth route logic
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    const admin = await prisma.admin.upsert({
      where: { email: adminData.email },
      update: { passwordHash: hashedPassword },
      create: {
        email: adminData.email,
        passwordHash: hashedPassword,
        role: adminData.role as any,
        isActive: true,
      },
    });
    console.log(`✅ Success! Admin ${admin.email} is ready.`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });