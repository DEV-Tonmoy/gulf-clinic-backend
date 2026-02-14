import { PrismaClient } from '@prisma/client';

/**
 * Explicitly typing the global namespace to include prisma.
 * This prevents the 'Cannot find name global' error.
 */
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined 
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;