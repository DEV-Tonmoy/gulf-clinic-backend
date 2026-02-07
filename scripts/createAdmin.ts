import bcrypt from "bcrypt";
import { PrismaClient, AdminRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const roleRaw = process.env.ADMIN_ROLE;

  if (!email || !password || !roleRaw) {
    throw new Error(
      "ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_ROLE must all be set"
    );
  }

  if (!Object.values(AdminRole).includes(roleRaw as AdminRole)) {
    throw new Error(
      `Invalid ADMIN_ROLE value: "${roleRaw}". Valid values are: ${Object.values(
        AdminRole
      ).join(", ")}`
    );
  }

  const role = roleRaw as AdminRole;

  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    throw new Error(`Admin with email ${email} already exists`);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.create({
    data: {
      email,
      passwordHash,
      role,
    },
  });

  console.log(`Admin created successfully with role: ${role}`);
}

main()
  .catch((err) => {
    console.error("❌ Admin creation failed:");
    console.error(err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
