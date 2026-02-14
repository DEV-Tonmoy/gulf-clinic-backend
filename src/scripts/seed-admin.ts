import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = "admin@gulfclinic.com"; // Set your email
  const password = "YourSecurePassword123"; // Set your password
  
  // This creates the hash that your code expects
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash: hashedPassword },
    create: {
      email,
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log("✅ Success! Admin created in Supabase:", admin.email);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding Supabase:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });